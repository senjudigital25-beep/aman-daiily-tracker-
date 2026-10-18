import React from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL =
  "https://wa.me/9199355128136?text=I%20came%20from%20Aman%27s%20Daily%20Tracker.%20I%20want%20to%20build%20something%20like%20this.";

export default function BuildCta() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="w-full inline-flex items-center justify-center gap-2 min-h-[52px] rounded-2xl bg-accent text-on-accent font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity card-shadow"
    >
      <MessageCircle className="h-5 w-5" /> Build something like this
    </a>
  );
}