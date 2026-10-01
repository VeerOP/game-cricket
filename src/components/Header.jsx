import React from 'react';
import { CRICKET_LEAGUES } from '../data/franchises';
import { sound } from '../engine/soundEffects';
import { Trophy, Volume2, VolumeX, Shield, HelpCircle, Flame, Swords, Table } from 'lucide-react';

export default function Header({
  activeLeague,
  setActiveLeague,
  isProMode,
  setIsProMode,
  bestRecord,
  currentStreak,
  onOpenRules,
  onOpenPointsTable,
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
    <header className="border-b border-zinc-800 bg-zinc-950/95 sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-md">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-2.5 sm:gap-3">
        {/* Main Navigation Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-sports font-black text-amber-400 text-xs sm:text-sm shadow-xs shrink-0">
              16-0
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight leading-none font-sports truncate">
                THE INVINCIBLES <span className="text-zinc-500 font-normal text-[10px] sm:text-xs uppercase font-sans">Cricket</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 hidden md:block truncate">
                Draft an undefeated Starting XI across IPL, PSL, SA20, CPL, BBL & ICC World Cups
              </p>
            </div>
          </div>

          {/* Right Utilities & Mode Switchers */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Points Table Button */}
            {!isMultiplayer && onOpenPointsTable && (
              <button
                onClick={onOpenPointsTable}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-amber-400 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="View Qualifiers & Standings Table"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden xs:inline">Points Table</span>
              </button>
            )}

            {/* Multiplayer Clash Switch */}
            <button
              onClick={() => setIsMultiplayer(!isMultiplayer)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold font-sports uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 border transition-all cursor-pointer ${
                isMultiplayer
                  ? 'bg-amber-500 text-black border-amber-400 shadow-amber-950/50 shadow-md'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
              title="Toggle Multiplayer Head-to-Head Clash"
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline sm:inline">{isMultiplayer ? 'Solo Mode' : 'Multiplayer PvP'}</span>
              <span className="xs:hidden sm:hidden">{isMultiplayer ? 'Solo' : 'PvP'}</span>
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] sm:text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-zinc-400 hidden sm:inline">Streak:</span>
              <span className="font-bold text-zinc-200 font-sports">{currentStreak}W</span>
            </div>

            {/* Best Run (hidden on tiny screens, visible on sm+) */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
              <Trophy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-zinc-400">Best:</span>
              <span className="font-bold text-zinc-200 font-sports">{bestRecord}</span>
            </div>

            {/* Pro IQ Toggle */}
            <button
              onClick={() => setIsProMode(!isProMode)}
              title={isProMode ? "Pro IQ Active (Ratings hidden)" : "Pro IQ Mode"}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isProMode
                  ? 'bg-zinc-800 border-zinc-600 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pro IQ</span>
            </button>

            {/* Rules Info */}
            <button
              onClick={onOpenRules}
              className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
              title="Rules & Scoring"
              aria-label="Rules and Scoring"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label="Sound Toggle"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* League Tabs Bar */}
        {!isMultiplayer && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {CRICKET_LEAGUES.map((league) => {
              const isActive = activeLeague === league.id;
              return (
                <button
                  key={league.id}
                  onClick={() => setActiveLeague(league.id)}
                  className={`flex-shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium tracking-tight transition-all cursor-pointer ${
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
