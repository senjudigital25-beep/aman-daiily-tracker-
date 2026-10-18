import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Avatar from '@/components/Avatar';
import { useProfile } from '@/lib/ProfileContext';

const MAX_HISTORY = 10;
const FAILURE_MESSAGE = 'Having trouble connecting, try again in a moment';

export default function CompanionChat({ open, onClose, context, addTask }) {
  const { displayName, avatarUrl } = useProfile();
  const greeting = `Hey ${displayName || 'there'}, how can I help you?`;

  const [messages, setMessages] = useState([{ role: 'assistant', text: greeting }]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const lastAttempt = useRef({ text: '', history: [] });

  // Reset the conversation whenever the modal is opened fresh.
  useEffect(() => {
    if (open) {
      setMessages([{ role: 'assistant', text: greeting }]);
      setInput('');
      setError('');
      setPending(false);
      lastAttempt.current = { text: '', history: [] };
      const id = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open, greeting]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending, error]);

  if (!open) return null;

  const runRequest = async (text, history) => {
    setPending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('geminiChat', { message: text, history, context });
      const data = res?.data || {};
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || FAILURE_MESSAGE }]);
      if (data.task && addTask && context?.today) {
        await addTask({
          title: data.task.title,
          date: context.today,
          category: data.task.category,
          time: data.task.time
        });
      }
    } catch {
      setError(FAILURE_MESSAGE);
    } finally {
      setPending(false);
    }
  };

  const submit = () => {
    const text = input.trim();
    if (!text || pending) return;
    const history = messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, text: m.text }));
    lastAttempt.current = { text, history };
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    runRequest(text, history);
  };

  const retry = () => {
    if (pending || !lastAttempt.current.text) return;
    runRequest(lastAttempt.current.text, lastAttempt.current.history);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-in" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-surface border border-surface rounded-t-3xl sm:rounded-3xl card-shadow flex flex-col h-[80vh] sm:h-[600px] max-h-[80vh] slide-up overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface shrink-0">
          <Avatar src={avatarUrl} name={displayName} className="h-11 w-11" textClassName="text-base" />
          <div className="min-w-0">
            <p className="font-heading font-bold text-pri leading-tight">{displayName || 'Your companion'}</p>
            <p className="text-xs text-sec">AI companion · online</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="ml-auto h-11 w-11 rounded-full hover:bg-appAccentSoft flex items-center justify-center text-sec transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed fade-in ${
                  m.role === 'user'
                    ? 'bg-accent text-white rounded-br-sm'
                    : 'bg-appAccentSoft text-pri rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {pending && (
            <div className="flex justify-start">
              <div className="bg-appAccentSoft rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-appTextSec animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-appTextSec animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-appTextSec animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="flex-1">{error}</span>
              <button
                onClick={retry}
                disabled={pending}
                className="inline-flex items-center gap-1 underline underline-offset-2 font-medium shrink-0 disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-surface p-3 flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
            placeholder="Message your companion..."
            disabled={pending}
            className="flex-1 min-h-[44px] bg-app border border-surface rounded-full px-4 text-sm text-pri outline-none focus:border-appAccent disabled:opacity-60"
          />
          <button
            onClick={submit}
            disabled={pending || !input.trim()}
            aria-label="Send message"
            className="h-11 w-11 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}