import React from 'react';
import { Image } from '@/components/ui/image';
import { initialOf } from '@/lib/profile';

// The user's own photo when they've uploaded one, otherwise a warm initial.
// Never renders anyone else's photo — the src is always the signed-in user's.
export default function Avatar({ src, name, className = 'h-10 w-10', textClassName = 'text-sm' }) {
  if (src) {
    return (
      <span className={`${className} rounded-full overflow-hidden shrink-0 bg-appAccentSoft inline-block`}>
        <Image
          src={src}
          alt={name ? `${name}'s photo` : 'Profile photo'}
          fittingType="fill"
          focalPointX={0.5}
          focalPointY={0.5}
          className="h-full w-full"
        />
      </span>
    );
  }

  return (
    <span
      className={`${className} rounded-full shrink-0 bg-appAccentSoft text-accent font-heading font-bold flex items-center justify-center ${textClassName}`}
      aria-hidden="true"
    >
      {initialOf(name)}
    </span>
  );
}