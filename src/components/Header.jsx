import React from 'react';
import { CRICKET_LEAGUES } from '../data/franchises';
import { sound } from '../engine/soundEffects';
import { Trophy, Volume2, VolumeX, Shield, HelpCircle, Flame, Swords } from 'lucide-react';

export default function Header({
  activeLeague,
  setActiveLeague,
  isProMode,
  setIsProMode,
  bestRecord,
  currentStreak,
  onOpenRules,
  isMuted,
  setIsMuted,
  isMultiplayer,
  setIsMultiplayer
}) {
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 sticky top-0 z-40 px-4 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Main Navigation Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-sports font-black text-amber-400 text-sm shadow-xs">
              16-0
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none font-sports">
                THE INVINCIBLES <span className="text-zinc-500 font-normal text-xs uppercase font-sans">Draft</span>
              </h1>
              <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">
                Achieve a flawless 16-0 undefeated season across global cricket history
              </p>
            </div>
          </div>

          {/* Right Utilities & Mode Switchers */}
          <div className="flex items-center gap-2">
            {/* Multiplayer Clash Switch */}
            <button
              onClick={() => setIsMultiplayer(!isMultiplayer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sports uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                isMultiplayer
                  ? 'bg-amber-500 text-black border-amber-400 shadow-amber-950/50 shadow-md'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
              title="Toggle Multiplayer Head-to-Head Clash"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Multiplayer PvP</span>
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-zinc-400 hidden sm:inline">Streak:</span>
              <span className="font-bold text-zinc-200 font-sports">{currentStreak}W</span>
            </div>

            {/* Best Run */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <Trophy className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400 hidden sm:inline">Best:</span>
              <span className="font-bold text-zinc-200 font-sports">{bestRecord}</span>
            </div>

            {/* Pro IQ Toggle */}
            <button
              onClick={() => setIsProMode(!isProMode)}
              title={isProMode ? "Pro IQ Active (Ratings hidden)" : "Pro IQ Mode"}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isProMode
                  ? 'bg-zinc-800 border-zinc-600 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pro IQ</span>
            </button>

            {/* Rules Info */}
            <button
              onClick={onOpenRules}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Rules & Scoring"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* League Tabs */}
        {!isMultiplayer && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CRICKET_LEAGUES.map((league) => {
              const isActive = activeLeague === league.id;
              return (
                <button
                  key={league.id}
                  onClick={() => setActiveLeague(league.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-medium tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
                  }`}
                >
                  {league.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
