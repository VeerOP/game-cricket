import React from 'react';
import { calculateSquadSynergy } from '../engine/simulationEngine';
import { sound } from '../engine/soundEffects';
import { Plane, AlertTriangle, CheckCircle, Zap, RefreshCw, X } from 'lucide-react';

export default function PitchBoard({
  lineup,
  slots,
  captainId,
  setCaptainId,
  viceCaptainId,
  setViceCaptainId,
  onRemovePlayer,
  onStartSimulation,
  onTriggerImpactSub,
  impactSubAvailable,
  isProMode
}) {
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

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Tactical Status Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Ratings */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700/80 flex flex-col items-center justify-center text-white">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">OVR</span>
              <span className="text-2xl font-bold font-sports leading-none mt-1 text-amber-400">
                {synergy.overallRating}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Starting XI Strength</h3>
                {synergy.penaltyApplied > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/80 border border-red-800/80 text-red-300">
                    -{synergy.penaltyApplied} Penalty
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-1">
                <span>Batting: <strong className="text-zinc-200 font-semibold">{synergy.batPower}</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Bowling: <strong className="text-zinc-200 font-semibold">{synergy.bowlPower}</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Pace/Spin: <strong className="text-zinc-200 font-semibold">{synergy.pacerCount}P / {synergy.spinnerCount}S</strong></span>
              </div>
            </div>
          </div>

          {/* Compliance Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Overseas counter */}
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              synergy.overseasCount > 4
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300'
            }`}>
              <Plane className="w-3.5 h-3.5 text-zinc-400" />
              <span>Overseas:</span>
              <strong className={`font-semibold ${synergy.overseasCount > 4 ? 'text-red-400' : 'text-zinc-100'}`}>
                {synergy.overseasCount}/4
              </strong>
            </div>

            {/* Wicketkeeper status */}
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              synergy.hasWicketkeeper
                ? 'bg-zinc-950 border-zinc-800 text-zinc-300'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}>
              {synergy.hasWicketkeeper ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span>WK: {synergy.hasWicketkeeper ? 'Ready' : 'Needed'}</span>
            </div>

            {/* Impact Sub (if available) */}
            {isFull && impactSubAvailable && (
              <button
                onClick={onTriggerImpactSub}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Spin once to replace any player"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Impact Sub</span>
              </button>
            )}

            {/* Squad Count */}
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              <span>Picks: <strong className="text-zinc-100">{activeCount}/11</strong></span>
            </div>

            {/* Simulation Action */}
            <button
              onClick={onStartSimulation}
              disabled={!canSimulate}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
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

      {/* Clean Tactical 11-Player Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const player = lineup[slot.id];
          const isCaptain = player && captainId === player.id;
          const isViceCaptain = player && viceCaptainId === player.id;

          return (
            <div
              key={slot.id}
              className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between min-h-[135px] ${
                player
                  ? 'bg-zinc-900/90 border-zinc-800 shadow-sm hover:border-zinc-700'
                  : 'bg-zinc-950/60 border-zinc-800/80 border-dashed hover:border-zinc-700'
              }`}
            >
              {/* Card Header: Position & Action Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                <span className="text-[11px] font-bold text-zinc-400 tracking-wider font-sports uppercase">
                  {slot.posCode}
                </span>

                {player ? (
                  <div className="flex items-center gap-1">
                    {/* Captain toggle */}
                    <button
                      onClick={() => handleSetCaptain(player.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-sports transition-all cursor-pointer ${
                        isCaptain
                          ? 'bg-amber-400 text-zinc-950 font-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Captain (2.0x Fantasy Points)"
                    >
                      C
                    </button>

                    {/* Vice-Captain toggle */}
                    <button
                      onClick={() => handleSetViceCaptain(player.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-sports transition-all cursor-pointer ${
                        isViceCaptain
                          ? 'bg-sky-400 text-zinc-950 font-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Vice-Captain (1.5x Fantasy Points)"
                    >
                      VC
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => onRemovePlayer(slot.id)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
                      title="Remove"
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
                <div className="pt-2 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm text-zinc-100 truncate">
                        {player.name}
                      </h4>
                      {!isProMode && (
                        <span className="font-sports font-bold text-amber-400 text-sm ml-1 shrink-0">
                          {player.overall}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                      <span className="truncate">{player.country}</span>
                      {player.isOverseas && (
                        <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-800 text-sky-300">
                          OS
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/40 flex items-center justify-between">
                    <span className="truncate text-zinc-300 font-medium">
                      {player.specialBadge || player.role.replace('_', ' ')}
                    </span>
                    {isCaptain && <span className="text-[9px] font-bold text-amber-400 font-sports">2.0x</span>}
                    {isViceCaptain && <span className="text-[9px] font-bold text-sky-400 font-sports">1.5x</span>}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <span className="text-xs text-zinc-500 font-medium">
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
