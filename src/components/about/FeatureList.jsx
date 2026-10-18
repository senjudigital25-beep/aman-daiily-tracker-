import React from 'react';
import {
  ListChecks, Flame, Megaphone, Sparkles,
  MessageSquare, Palette, ShieldCheck
} from 'lucide-react';

const FEATURES = [
  { icon: ListChecks, text: 'Plan your workouts and daily tasks in one place' },
  { icon: Flame, text: 'Track your daily streak and weekly consistency' },
  { icon: Megaphone, text: 'Monitor your outreach and see your progress over time' },
  { icon: Sparkles, text: 'Use the floating AI companion for motivation and quick task creation' },
  { icon: MessageSquare, text: 'Chat with the AI assistant to add tasks just by typing' },
  { icon: Palette, text: 'Pick a theme that matches your mood' },
  { icon: ShieldCheck, text: 'Your data stays private to your account' }
];

export default function FeatureList() {
  return (
    <section className="bg-surface rounded-2xl border border-surface card-shadow p-6 sm:p-8">
      <h2 className="font-heading font-bold text-pri text-xl mb-4">What this dashboard does</h2>
      <ul className="flex flex-col gap-3">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <span className="mt-0.5 h-8 w-8 rounded-xl bg-accent-soft text-accent-ink flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-pri text-sm sm:text-base leading-relaxed pt-1">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}