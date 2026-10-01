import React, { useState } from 'react';
import { calculateSquadSynergy } from '../engine/simulationEngine';
import { sound } from '../engine/soundEffects';
import { Plane, AlertTriangle, CheckCircle, Zap, ArrowUp, ArrowDown, ArrowUpDown, X, Trophy } from 'lucide-react';

export default function PitchBoard({
  lineup,
  slots,
  captainId,
  setCaptainId,
  viceCaptainId,
  setViceCaptainId,
  onMovePlayerUp,
  onMovePlayerDown,
  onRemovePlayer,
  onStartSimulation,
  onOpenPointsTable,
  currentRound = 0,
  userRank = 1,
  isProMode
}) {
  const [selectedSwapSlot, setSelectedSwapSlot] = useState(null);
  const synergy = calculateSquadSynergy(lineup, captainId, viceCaptainId);
  const activeCount = Object.values(lineup).filter(Boolean).length;
  const isFull = activeCount === 11;
  const canSimulate = isFull && synergy.isOverseasValid && synergy.hasWicketkeeper;

  const handleSetCaptain = (id) => {
    sound.init();
    sound.playTick();
    if (captainId === id) {
      setCaptainId(null);
    } else {
      setCaptainId(id);
      if (viceCaptainId === id) setViceCaptainId(null);
    }
  };

  const handleSetViceCaptain = (id) => {
    sound.init();
    sound.playTick();
    if (viceCaptainId === id) {
      setViceCaptainId(null);
    } else {
      setViceCaptainId(id);
      if (captainId === id) setCaptainId(null);
    }
  };

  const handleSlotClickForSwap = (slotId) => {
    if (!lineup[slotId]) return;
    if (selectedSwapSlot === null) {
      setSelectedSwapSlot(slotId);
    } else if (selectedSwapSlot === slotId) {
      setSelectedSwapSlot(null);
    } else {
      // Swap the two batting order positions
      sound.init();
      sound.playTick();
      if (onMovePlayerUp) {
        // trigger swap
        const idx1 = selectedSwapSlot;
        const idx2 = slotId;
        if (idx1 < idx2) {
          // move downwards
          for (let i = idx1; i < idx2; i++) onMovePlayerDown(i);
        } else {
          for (let i = idx1; i > idx2; i--) onMovePlayerUp(i);
        }
      }
      setSelectedSwapSlot(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Top Tactical Status Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
          {/* Main Ratings */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-zinc-800 border border-zinc-700/80 flex flex-col items-center justify-center text-white shrink-0">
              <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">OVR</span>
              <span className="text-xl sm:text-2xl font-bold font-sports leading-none mt-0.5 sm:mt-1 text-amber-400">
                {synergy.overallRating}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Starting XI Lineup & Batting Order</h3>
                {synergy.penaltyApplied > 0 && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-red-950/80 border border-red-800/80 text-red-300">
                    -{synergy.penaltyApplied} Penalty
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs text-zinc-400 mt-1 flex-wrap">
                <span>Batting: <strong className="text-zinc-200 font-semibold">{synergy.batPower}</strong></span>
                <span className="text-zinc-600 hidden xs:inline">•</span>
                <span>Bowling: <strong className="text-zinc-200 font-semibold">{synergy.bowlPower}</strong></span>
                <span className="text-zinc-600 hidden xs:inline">•</span>
                <span>P/S: <strong className="text-zinc-200 font-semibold">{synergy.pacerCount}P / {synergy.spinnerCount}S</strong></span>
              </div>
            </div>
          </div>

          {/* Compliance Status Badges & Action */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Overseas counter */}
            <div className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-[11px] sm:text-xs ${
              synergy.overseasCount > 4
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300'
            }`}>
              <Plane className="w-3.5 h-3.5 text-zinc-400" />
              <span>OS:</span>
              <strong className={`font-semibold ${synergy.overseasCount > 4 ? 'text-red-400' : 'text-zinc-100'}`}>
                {synergy.overseasCount}/4
              </strong>
            </div>

            {/* Wicketkeeper status */}
            <div className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-[11px] sm:text-xs ${
              synergy.hasWicketkeeper
                ? 'bg-zinc-950 border-zinc-800 text-zinc-300'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}>
              {synergy.hasWicketkeeper ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span>WK: {synergy.hasWicketkeeper ? 'Ready' : 'Needed'}</span>
            </div>

            {/* Points Table Button */}
            {onOpenPointsTable && (
              <button
                onClick={onOpenPointsTable}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View League Qualifiers & Points Table"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Points Table</span>
              </button>
            )}

            {/* Squad Count */}
            <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] sm:text-xs">
              <span>Picks: <strong className="text-zinc-100">{activeCount}/11</strong></span>
            </div>

            {/* Simulation Action Button */}
            <button
              onClick={onStartSimulation}
              disabled={!canSimulate}
              className={`w-full sm:w-auto px-4 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                canSimulate
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{canSimulate ? 'Simulate Season' : 'Draft XI First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batting Order Instructions Banner */}
      {activeCount > 1 && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              Use the <strong className="text-zinc-200">▲ / ▼ arrows</strong> on each card to arrange your tactical batting order (Positions 1 to 11).
            </span>
          </div>
        </div>
      )}

      {/* Clean Tactical 11-Player Grid with Batting Order Management */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {slots.map((slot, index) => {
          const slotId = slot.id;
          const player = lineup[slotId];
          const isCaptain = player && captainId === player.id;
          const isViceCaptain = player && viceCaptainId === player.id;
          const canMoveUp = player && index > 0 && lineup[slots[index - 1].id];
          const canMoveDown = player && index < 10 && lineup[slots[index + 1].id];

          return (
            <div
              key={slotId}
              className={`rounded-xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between min-h-[130px] sm:min-h-[145px] relative ${
                player
                  ? 'bg-zinc-900/90 border-zinc-800 shadow-sm hover:border-zinc-700'
                  : 'bg-zinc-950/60 border-zinc-800/80 border-dashed hover:border-zinc-700'
              }`}
            >
              {/* Card Header: Position & Batting Order Controls */}
              <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-5 h-5 rounded bg-zinc-800 text-amber-400 font-sports font-black text-[10px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 tracking-wider font-sports uppercase truncate">
                    {slot.posCode}
                  </span>
                </div>

                {player ? (
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move Up in Batting Order */}
                    <button
                      onClick={() => onMovePlayerUp && onMovePlayerUp(slotId)}
                      disabled={!canMoveUp}
                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                        canMoveUp
                          ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          : 'text-zinc-700 cursor-not-allowed'
                      }`}
                      title="Move Up in Batting Order"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down in Batting Order */}
                    <button
                      onClick={() => onMovePlayerDown && onMovePlayerDown(slotId)}
                      disabled={!canMoveDown}
                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                        canMoveDown
                          ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          : 'text-zinc-700 cursor-not-allowed'
                      }`}
                      title="Move Down in Batting Order"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Captain toggle */}
                    <button
                      onClick={() => handleSetCaptain(player.id)}
                      className={`min-w-[22px] px-1 py-0.5 rounded text-[10px] font-bold font-sports transition-all cursor-pointer ${
                        isCaptain
                          ? 'bg-amber-400 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Captain (2.0x Fantasy Points)"
                    >
                      C
                    </button>

                    {/* Vice-Captain toggle */}
                    <button
                      onClick={() => handleSetViceCaptain(player.id)}
                      className={`min-w-[22px] px-1 py-0.5 rounded text-[10px] font-bold font-sports transition-all cursor-pointer ${
                        isViceCaptain
                          ? 'bg-sky-400 text-zinc-950 font-black shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Vice-Captain (1.5x Fantasy Points)"
                    >
                      VC
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => onRemovePlayer(slotId)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer ml-0.5"
                      title="Remove Draft Pick"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-medium">Empty</span>
                )}
              </div>

              {/* Card Body */}
              {player ? (
                <div className="pt-1.5 sm:pt-2 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                        {player.name}
                      </h4>
                      {!isProMode && (
                        <span className="font-sports font-bold text-amber-400 text-xs sm:text-sm ml-1 shrink-0">
                          {player.overall}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                      <span className="truncate">{player.country}</span>
                      {player.isOverseas && (
                        <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-800 text-sky-300 shrink-0">
                          OS
                        </span>
                      )}
                      <span className="text-zinc-600">•</span>
                      <span className="truncate text-zinc-300 font-medium text-[10px]">
                        Bat: {player.batRating} / Bowl: {player.bowlRating}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5 sm:mt-2 text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/40 flex items-center justify-between">
                    <span className="truncate text-zinc-300 font-medium text-[10px]">
                      {player.specialBadge || player.role.replace('_', ' ')}
                    </span>
                    {isCaptain && <span className="text-[9px] font-bold text-amber-400 font-sports shrink-0 ml-1">2.0x (C)</span>}
                    {isViceCaptain && <span className="text-[9px] font-bold text-sky-400 font-sports shrink-0 ml-1">1.5x (VC)</span>}
                  </div>
                </div>
              ) : (
                <div className="py-3 sm:py-4 text-center">
                  <span className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                    {slot.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
