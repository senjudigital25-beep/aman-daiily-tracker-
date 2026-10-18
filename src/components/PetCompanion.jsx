import React, { useEffect, useRef, useState, useCallback } from 'react';
import Avatar from '@/components/Avatar';
import CompanionChat from '@/components/CompanionChat';
import { useProfile } from '@/lib/ProfileContext';
import { PET_GREETINGS, PET_NUDGES } from '@/lib/quotes';

const SIZE = 76;
const EDGE = 40; // keep at least 40px from every edge
const MOBILE_NAV_INSET = 76; // clears the mobile bottom nav bar
const MOVE_INTERVAL_MIN = 120000;
const MOVE_INTERVAL_MAX = 150000;
const BUBBLE_DURATION = 5500;

function randomFrom(arr, avoid) {
  if (arr.length <= 1) return arr[0];
  let pick;
  do { pick = arr[Math.floor(Math.random() * arr.length)]; }
  while (pick === avoid);
  return pick;
}

function bounds() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const bottomInset = w < 1024 ? MOBILE_NAV_INSET : 0;
  return {
    minX: EDGE,
    maxX: Math.max(EDGE, w - SIZE - EDGE),
    minY: EDGE,
    maxY: Math.max(EDGE, h - SIZE - EDGE - bottomInset)
  };
}

function clampPos(p) {
  const b = bounds();
  return {
    x: Math.max(b.minX, Math.min(b.maxX, p.x)),
    y: Math.max(b.minY, Math.min(b.maxY, p.y))
  };
}

function randomPosition() {
  const b = bounds();
  const spanX = Math.max(0, b.maxX - b.minX);
  const spanY = Math.max(0, b.maxY - b.minY);
  const edge = Math.random();
  let x;
  let y;
  if (edge < 0.25) { x = b.minX; y = b.minY + Math.random() * spanY; }
  else if (edge < 0.5) { x = b.maxX; y = b.minY + Math.random() * spanY; }
  else if (edge < 0.75) { x = b.minX + Math.random() * spanX; y = b.minY; }
  else { x = b.minX + Math.random() * spanX; y = b.maxY; }
  return clampPos({ x, y });
}

export default function PetCompanion({ data }) {
  const { displayName, avatarUrl } = useProfile();
  const [pos, setPos] = useState(() => randomPosition());
  const [bubble, setBubble] = useState('');
  const [dragging, setDragging] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const bubbleTimer = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const showBubble = useCallback((text) => {
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(''), BUBBLE_DURATION);
  }, []);

  const showRandomGreeting = useCallback(() => {
    const pool = Math.random() < 0.5 ? PET_GREETINGS : PET_NUDGES;
    showBubble(randomFrom(pool, bubble));
  }, [bubble, showBubble]);

  // Never drift outside the visible screen — re-clamp on resize and rotation.
  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-move every 120-150s. Paused while dragging, while the chat is open,
  // and while the tab is hidden.
  useEffect(() => {
    if (dragging || chatOpen) return undefined;
    let moveTimer;
    const delay = MOVE_INTERVAL_MIN + Math.random() * (MOVE_INTERVAL_MAX - MOVE_INTERVAL_MIN);
    moveTimer = setTimeout(() => {
      if (document.hidden) return;
      setPos(randomPosition());
      showRandomGreeting();
    }, delay);
    return () => clearTimeout(moveTimer);
  }, [dragging, chatOpen, showRandomGreeting]);

  // No bubbles while the user is actually chatting.
  useEffect(() => {
    if (chatOpen) {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      setBubble('');
    }
  }, [chatOpen]);

  useEffect(() => () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); }, []);

  const onPointerDown = (e) => {
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y
    };
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    setPos(clampPos({ x: d.origX + dx, y: d.origY + dy }));
  };

  const onPointerUp = () => {
    const d = drag.current;
    const wasTap = d.active && !d.moved;
    d.active = false;
    setDragging(false);
    setPos((p) => clampPos(p));
    if (wasTap) setChatOpen(true);
  };

  // ---- Dashboard context for the assistant ----
  const stats = data?.stats || {};
  const today = stats.today || '';
  const outreach = data?.outreachForDate ? data.outreachForDate(today) : { count: 0, target: 10 };
  const todaysTasks = (data?.tasks || []).filter((t) => t.date === today);
  const chatContext = {
    today,
    streak: stats.streak || 0,
    tasksDone: stats.todaysDone || 0,
    tasksTotal: stats.todaysTotal || 0,
    consistencyPct: stats.weeklyPct || 0,
    outreachCount: outreach.count,
    outreachTarget: outreach.target,
    todaysTasks: todaysTasks.map((t) => ({ title: t.title, category: t.category, completed: !!t.completed }))
  };

  return (
    <>
      <div
        className="fixed z-40 select-none"
        style={{
          left: pos.x,
          top: pos.y,
          transition: dragging
            ? 'none'
            : 'left 1.1s cubic-bezier(0.16,1,0.3,1), top 1.1s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        {bubble && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[220px] bubble-in">
            <div className="bg-surface border border-surface card-shadow rounded-2xl px-3.5 py-2.5 text-sm text-pri text-center font-medium">
              {bubble}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 h-3 w-3 bg-surface border-b border-r border-surface rotate-45" />
          </div>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Drag me anywhere, or tap to chat"
          className={`block rounded-full overflow-hidden ring-2 ring-surface border border-surface cursor-grab active:cursor-grabbing ${
            dragging ? '' : 'pet-breathe'
          }`}
          style={{
            width: SIZE,
            height: SIZE,
            touchAction: 'none',
            filter: 'drop-shadow(0 6px 12px rgba(255,107,74,0.35))'
          }}
        >
          <Avatar
            src={avatarUrl}
            name={displayName}
            className="h-full w-full"
            textClassName="text-2xl"
          />
        </button>
      </div>

      <CompanionChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
        addTask={data?.addTask}
      />
    </>
  );
}