import React from 'react';

const PARAGRAPHS = [
  "Hey, I'm Aman. I'm 18 years old, and this is my first startup.",
  "I've been learning web development and AI for years, and I kept running into the same problem: I knew what I needed to do, but without a clear daily routine, my consistency fell apart. Outreach got skipped, tasks piled up, and I had no simple way to see my progress.",
  "So I built the tracker I wished I had. It keeps me accountable every day, and now I'm sharing it with you. If you want to build something like this, or work together, message me."
];

export default function StorySection() {
  return (
    <section className="bg-surface rounded-2xl border border-surface card-shadow p-6 sm:p-8">
      <h2 className="font-heading font-bold text-pri text-xl mb-4">My story</h2>
      <div className="flex flex-col gap-4">
        {PARAGRAPHS.map((text) => (
          <p key={text} className="text-pri text-sm sm:text-base leading-relaxed">
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}