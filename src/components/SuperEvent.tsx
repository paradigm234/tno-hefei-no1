import React, { useEffect } from 'react';
import { SuperEventData } from '../types';
import { getSuperEventImageUrl } from '../config/assets';

interface SuperEventProps {
  event: SuperEventData;
  onConfirm: () => void;
}

export default function SuperEvent({ event, onConfirm }: SuperEventProps) {
  const color = event.color || 'tno-red';
  const resolvedColor = color.startsWith('#') ? color : `var(--color-${color}, #ef4444)`;

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onConfirm();
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/78 backdrop-blur-sm">
      <div className={`relative h-[540px] w-[900px] max-w-[94vw] border-4 bg-black flex flex-col overflow-hidden animate-super-event-appear shadow-[0_0_42px_rgba(0,0,0,0.65)]`} style={{ borderColor: resolvedColor }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-78" style={{ backgroundImage: `url('${getSuperEventImageUrl(event.id)}')` }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.15),rgba(0,0,0,0.44)_56%,rgba(0,0,0,0.68)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,86,137,0.08),transparent_38%,rgba(82,172,255,0.07)_72%,transparent)]" />
        <div className="pointer-events-none absolute inset-0 border border-white/15" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/65 to-transparent" />
        <div className="pointer-events-none absolute left-5 top-5 h-6 w-6 border-l-2 border-t-2 border-white/50" />
        <div className="pointer-events-none absolute right-5 top-5 h-6 w-6 border-r-2 border-t-2 border-white/50" />
        <div className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 border-b-2 border-l-2 border-white/50" />
        <div className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 border-b-2 border-r-2 border-white/50" />

        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.22) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 255, 0.03), rgba(0, 0, 255, 0.05))', backgroundSize: '100% 4px, 8px 100%' }}></div>

        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(to_top,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0)_100%)]" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 pb-12 pt-8 text-center">
          <h1 className={`mb-8 text-4xl font-black tracking-[0.18em] crt-flicker md:text-6xl`} style={{ color: resolvedColor, textShadow: `0 0 12px ${resolvedColor}, 0 0 36px rgba(255,255,255,0.22)` }}>
            {event.title}
          </h1>

          <div className="mt-auto w-full max-w-3xl px-3 pb-3">
            <p className="mb-3 text-lg italic leading-relaxed text-white md:text-2xl" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
              "{event.quote}"
            </p>
            <p className="text-sm tracking-[0.14em] text-white/78 md:text-base" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.75)' }}>
              — {event.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
