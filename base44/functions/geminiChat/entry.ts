import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Primary model per spec, then the fallback, then a couple of current models so
// a retired or overloaded name can never take the companion offline.
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

const ATTEMPT_TIMEOUT_MS = 8000; // fall through to the next model after this
const TOTAL_TIMEOUT_MS = 15000; // hard ceiling for the whole call

const MAX_HISTORY = 10;
const MAX_MESSAGE_CHARS = 1000;
const CATEGORIES = ['outreach', 'skill', 'personal', 'content'];

const SYSTEM_PROMPT = `You are the personal AI assistant inside this user's daily tracker. You help them manage tasks, answer questions about their dashboard, and stay motivated. When they clearly ask you to add or create a task, understand it naturally and confirm it in your reply. Be conversational, encouraging, and practical. Keep replies to 1-3 sentences.`;

const OUTPUT_RULES = `Always respond with a single JSON object and nothing else, in exactly this shape:
{"reply": "<your 1-3 sentence reply>", "task": null}
If and only if the user is clearly asking you to add or create a task, set "task" to:
{"title": "<short task title>", "category": "outreach" | "skill" | "personal" | "content", "time": "HH:MM or empty string"}
Choose the category that best fits: outreach for cold DMs/messages/follow-ups, skill for learning or building, content for posts/videos, personal for everything else.
If the request is unclear or missing a title, do NOT create a task — instead ask a short clarifying question and leave "task" as null.
Never create a task the user did not ask for. For questions, conversation, or anything that is not a task creation request, "task" MUST be null.`;

function buildContext(c) {
  if (!c || typeof c !== 'object') return 'No dashboard data available.';
  const list = Array.isArray(c.todaysTasks) ? c.todaysTasks.slice(0, 20) : [];
  const tasksText = list.length
    ? list.map((t) => `${t.title} (${t.category || 'personal'}${t.completed ? ', done' : ''})`).join('; ')
    : 'none yet';
  return [
    `Today's date: ${c.today || 'unknown'}`,
    `Current streak: ${Number(c.streak) || 0} day(s)`,
    `Tasks done today: ${Number(c.tasksDone) || 0} of ${Number(c.tasksTotal) || 0}`,
    `Weekly consistency: ${Number(c.consistencyPct) || 0}%`,
    `Outreach today: ${Number(c.outreachCount) || 0} of ${Number(c.outreachTarget) || 0}`,
    `Today's tasks: ${tasksText}`,
  ].join('\n');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const message = typeof body.message === 'string' ? body.message.slice(0, MAX_MESSAGE_CHARS).trim() : '';
    if (!message) return Response.json({ error: 'Missing message' }, { status: 400 });

    // The key never reaches the browser: it is read from the server secret only.
    let apiKey = '';
    try {
      apiKey = secrets.get('GEMINI_API_KEY') || '';
    } catch {
      apiKey = '';
    }
    if (!apiKey) {
      return Response.json(
        { error: 'Having trouble connecting, try again in a moment' },
        { status: 502 }
      );
    }

    const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];
    const contents = history
      .filter((h) => h && typeof h.text === 'string' && h.text.trim())
      .map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(h.text).slice(0, 2000) }],
      }));
    // Gemini expects the conversation to start with a user turn.
    while (contents.length && contents[0].role === 'model') contents.shift();
    contents.push({ role: 'user', parts: [{ text: message }] });

    const systemInstruction = {
      parts: [
        { text: `${SYSTEM_PROMPT}\n\n${OUTPUT_RULES}\n\nCurrent dashboard context:\n${buildContext(body.context)}` },
      ],
    };

    const requestBody = JSON.stringify({
      contents,
      systemInstruction,
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json' },
    });

    const started = Date.now();
    let parsed = null;
    let attempted = false;

    for (const model of MODELS) {
      const elapsed = Date.now() - started;
      if (elapsed >= TOTAL_TIMEOUT_MS) break;
      const budget = Math.min(ATTEMPT_TIMEOUT_MS, TOTAL_TIMEOUT_MS - elapsed);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      let response;
      try {
        attempted = true;
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: AbortSignal.timeout(budget),
        });
      } catch (err) {
        console.error('Gemini request failed', model, String(err));
        continue;
      }

      if (response.ok) {
        const data = await response.json();
        const raw = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }
        if (parsed) break;
        continue;
      }

      const errText = await response.text();
      console.error('Gemini error', model, response.status, errText.slice(0, 300));

      if (response.status === 400 || response.status === 403) {
        return Response.json(
          { error: 'Having trouble connecting, try again in a moment' },
          { status: 502 }
        );
      }
      // 404 (retired model) / 503 (busy) / 5xx -> try the next model.
    }

    if (!parsed) {
      return Response.json(
        { error: attempted ? 'Having trouble connecting, try again in a moment' : 'Missing message' },
        { status: 502 }
      );
    }

    const reply =
      typeof parsed.reply === 'string' && parsed.reply.trim()
        ? parsed.reply.trim()
        : 'Sorry, I could not generate a response.';

    const task =
      parsed.task && typeof parsed.task.title === 'string' && parsed.task.title.trim()
        ? {
            title: parsed.task.title.trim().slice(0, 200),
            category: CATEGORIES.includes(parsed.task.category) ? parsed.task.category : 'personal',
            time: typeof parsed.task.time === 'string' ? parsed.task.time.slice(0, 5) : '',
          }
        : null;

    return Response.json({ reply, task });
  } catch (error) {
    return Response.json({ error: 'Having trouble connecting, try again in a moment' }, { status: 500 });
  }
}