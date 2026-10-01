import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Dices, ShieldCheck } from 'lucide-react';
import { sound } from '../engine/soundEffects';

const ITEM_HEIGHT = 68; // Height in pixels for each slot item

export default function SlotReelSelector({
  teams = [],
  onSpinComplete,
  isSpinning,
  setIsSpinning,
  disabled = false,
  currentPickNumber = 1,
  totalPicks = 11
}) {
  const [turboMode, setTurboMode] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isLanded, setIsLanded] = useState(false);
  const [isBlurRolling, setIsBlurRolling] = useState(false);

  const animTimerRef = useRef(null);
  const finishTimeoutRef = useRef(null);

  // Initialize or handle league team list update
  useEffect(() => {
    if (!teams || teams.length === 0) return;
    setCenterIndex(prev => (prev < teams.length ? prev : 0));
    setIsLanded(false);
    setIsBlurRolling(false);
  }, [teams]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, []);

  const handleSpin = () => {
    if (isSpinning || disabled || !teams || teams.length === 0) return;

    sound.init();
    setIsSpinning(true);
    setIsLanded(false);
    setIsBlurRolling(true);

    // Pick target team upfront
    const targetIdx = Math.floor(Math.random() * teams.length);
    const chosenTeam = teams[targetIdx];

    const spinDuration = turboMode ? 900 : 2200;
    const startTime = Date.now();
    let currentIdx = centerIndex;
    let stepInterval = 45; // Rapid rolling speed (ms per step)

    if (animTimerRef.current) clearInterval(animTimerRef.current);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);

    const stepReel = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / spinDuration);

      // Advance by 1 item in circular array
      currentIdx = (currentIdx + 1) % teams.length;
      setCenterIndex(currentIdx);

      // Play mechanical sound
      try {
        sound.playReelTick(0.85 + progress * 0.35);
      } catch {
        // Safe sound execution
      }

      if (progress < 0.75) {
        // High speed rolling phase
        animTimerRef.current = setTimeout(stepReel, stepInterval);
      } else if (progress < 0.95) {
        // Deceleration phase (slowing down into payline)
        stepInterval = 65 + (progress - 0.75) * 400;
        animTimerRef.current = setTimeout(stepReel, stepInterval);
      } else {
        // Final landing step: snap to target index
        setCenterIndex(targetIdx);
        setIsBlurRolling(false);
        setIsLanded(true);

        try {
          sound.playReelLock();
        } catch {
          // Safe lock sound
        }

        // Lock pause so user sees exact landed team crest, then open drawer
        finishTimeoutRef.current = setTimeout(() => {
          setIsSpinning(false);
          if (onSpinComplete) {
            onSpinComplete(chosenTeam);
          }
        }, 400);
      }
    };

    animTimerRef.current = setTimeout(stepReel, stepInterval);
  };

  if (!teams || teams.length === 0) {
    return (
      <div className="w-full py-8 text-center text-xs text-zinc-500">
        No teams available for this selection
      </div>
    );
  }

  // Calculate 3 visible items: top (prev), center (active target), bottom (next)
  const count = teams.length;
  const topIndex = (centerIndex - 1 + count) % count;
  const bottomIndex = (centerIndex + 1) % count;

  const topTeam = teams[topIndex] || teams[0];
  const activeTeam = teams[centerIndex] || teams[0];
  const bottomTeam = teams[bottomIndex] || teams[0];

  const visibleItems = [
    { team: topTeam, key: 'top', isCenter: false },
    { team: activeTeam, key: 'center', isCenter: true },
    { team: bottomTeam, key: 'bottom', isCenter: false }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Reel HUD Header Controls */}
      <div className="w-full flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Dices className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-sports font-semibold uppercase tracking-wide text-[11px] text-zinc-300">
            Era Slot Selector
          </span>
        </div>

        {/* Turbo Mode Switch */}
        <button
          onClick={() => setTurboMode(!turboMode)}
          disabled={isSpinning}
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all border cursor-pointer ${
            turboMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle Turbo Mode (Faster 0.9s Spin)"
        >
          <Zap className={`w-3 h-3 ${turboMode ? 'text-amber-400 fill-amber-400' : ''}`} />
          <span>Turbo {turboMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Mechanical Reel Window */}
      <div className="w-full relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner select-none">
        {/* Center Target Payline Reticle Frame */}
        <div
          className={`absolute left-0 right-0 top-[68px] h-[68px] z-20 pointer-events-none transition-all duration-300 border-y ${
            isLanded
              ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
              : isSpinning
              ? 'border-zinc-700 bg-zinc-800/20'
              : 'border-zinc-700/80 bg-zinc-800/10'
          }`}
        >
          {/* Target Pointer Indicators */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-emerald-400 border border-zinc-900" />
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-emerald-400 border border-zinc-900" />

          <div className="absolute right-2.5 top-1 px-1.5 py-0.2 rounded text-[9px] font-sports font-bold tracking-wider uppercase text-emerald-400/80 bg-emerald-950/60 border border-emerald-500/30">
            {isLanded ? 'LOCKED' : 'PAYLINE'}
          </div>
        </div>

        {/* Top Gradient Shadow Mask */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />

        {/* Bottom Gradient Shadow Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />

        {/* 3 Fixed-Slot Window Viewport */}
        <div
          style={{ height: `${ITEM_HEIGHT * 3}px` }}
          className={`w-full flex flex-col justify-start relative transition-all duration-100 ${
            isBlurRolling ? 'blur-[0.5px] opacity-90' : 'blur-0 opacity-100'
          }`}
        >
          {visibleItems.map(({ team: t, key, isCenter }) => (
            <div
              key={`${key}-${t.id}`}
              style={{ height: `${ITEM_HEIGHT}px` }}
              className={`w-full px-3 flex items-center justify-between border-b border-zinc-800/40 transition-colors ${
                isCenter && isLanded
                  ? 'bg-emerald-950/25'
                  : isCenter
                  ? 'bg-zinc-900/40'
                  : 'opacity-60 bg-zinc-950/60'
              }`}
            >
              {/* Left: Color Bar + Team Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-2.5 h-9 rounded-full flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: t.themeColor || '#27272a',
                    border: `1px solid ${t.secondaryColor || '#52525b'}`
                  }}
                />

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-bold text-white tracking-tight truncate font-sans">
                      {t.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-sports font-bold bg-zinc-800 text-zinc-300 flex-shrink-0 border border-zinc-700">
                      {t.year}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate">
                    {t.banner || `${t.league} Era`}
                  </span>
                </div>
              </div>

              {/* Right: League Pill */}
              <div className="flex-shrink-0 pl-2">
                <span className="text-[10px] font-sports font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {t.shortName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full mt-3">
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled}
          className={`w-full py-3 px-4 rounded-xl font-sports font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            disabled
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
              : isSpinning
              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-emerald-950/50 active:scale-[0.99]'
          }`}
        >
          {isSpinning ? (
            <>
              <Dices className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Rolling Reel...</span>
            </>
          ) : disabled ? (
            <>
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
              <span>XI Draft Complete (11/11)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>
                {currentPickNumber <= totalPicks
                  ? `Spin Reel (Pick ${currentPickNumber}/${totalPicks})`
                  : 'Spin Again'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
