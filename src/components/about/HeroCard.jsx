import React from 'react';
import { Image } from '@/components/ui/image';

// Aman's own photo — always this one, whoever is signed in.
export const AMAN_PHOTO =
  'https://media.base44.com/images/public/6ab2dfb31644c312f89bc86e/c559aced4_WhatsAppImage2026-10-07at10626PM.jpeg';

export default function HeroCard() {
  return (
    <section className="bg-surface rounded-2xl border border-surface card-shadow p-6 sm:p-8 flex flex-col items-center text-center">
      <h1 className="font-heading font-bold text-pri text-2xl sm:text-3xl">About this dashboard</h1>

      <div
        className="mt-6 h-32 w-32 sm:h-40 sm:w-40 rounded-full p-[3px] shrink-0"
        style={{ background: 'var(--app-accent)', boxShadow: '0 0 0 6px var(--app-accent-soft)' }}
      >
        <div
          className="h-full w-full rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--app-accent-soft)' }}
        >
          <Image
            src={AMAN_PHOTO}
            alt="Aman"
            fittingType="fit"
            className="h-full w-full"
          />
        </div>
      </div>

      <p className="mt-5 text-pri text-sm sm:text-base font-medium leading-relaxed">
        Meet Aman · CO- Founder of  Senju Digital · Solo AI builder
      </p>
    </section>
  );
}