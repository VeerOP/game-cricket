import React, { useState } from 'react';
import { sound } from '../engine/soundEffects';
import { X, Check, Plane, Shield, ChevronRight } from 'lucide-react';

export default function PlayerDrawer({
  team,
  lineup,
  slots,
  onSelectPlayer,
  onClose,
  isProMode
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [targetSlotId, setTargetSlotId] = useState(null);

  if (!team) return null;

  const activeOverseasCount = Object.values(lineup).filter(p => p && p.isOverseas).length;

  const getCompatibleSlots = (player) => {
    return slots.filter(slot => {
      const roleMatches = slot.acceptedRoles.some(role => {
        if (role === player.role) return true;
        if (role === 'OPENER' && player.role === 'TOP_ORDER') return true;
        if (role === 'TOP_ORDER' && player.role === 'OPENER') return true;
        if (role === 'MIDDLE_ORDER' && player.role === 'FINISHER') return true;
        if (role === 'FINISHER' && player.role === 'MIDDLE_ORDER') return true;
        if (role === 'PACER' && player.role === 'PACE_ALL') return true;
        if (role === 'SPINNER' && player.role === 'SPIN_ALL') return true;
        return false;
      });
      return roleMatches;
    });
  };

  const handlePlayerClick = (player) => {
    const isAlreadyInTeam = Object.values(lineup).some(p => p && p.id === player.id);
    if (isAlreadyInTeam) return;

    if (player.isOverseas && activeOverseasCount >= 4) {
      alert('Overseas player limit reached (Max 4). Please select a domestic player.');
      return;
    }

    setSelectedPlayer(player);
    const compatible = getCompatibleSlots(player);
    const emptyCompat = compatible.find(s => !lineup[s.id]);
    setTargetSlotId(emptyCompat ? emptyCompat.id : (compatible[0]?.id || null));
  };

  const handleConfirmDraft = () => {
    if (!selectedPlayer || !targetSlotId) return;
    sound.playBatCrack();
    onSelectPlayer(selectedPlayer, targetSlotId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-zinc-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-5 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-sports font-bold text-sm sm:text-base text-white border border-zinc-700 shrink-0"
              style={{ backgroundColor: team.themeColor || '#27272a' }}
            >
              {team.shortName}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">
                  {team.name}
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] sm:text-[11px] font-bold bg-zinc-800 text-zinc-300 font-sports shrink-0">
                  {team.year}
                </span>
                {team.league && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 font-medium shrink-0">
                    {team.league}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 truncate">
                {team.banner} • Select 1 player
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overseas Quota Info Banner */}
        <div className="px-4 py-2 bg-zinc-950/50 border-b border-zinc-800/80 flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Overseas in XI:</span>
            <strong className={`font-semibold ${activeOverseasCount >= 4 ? 'text-amber-400' : 'text-zinc-200'}`}>
              {activeOverseasCount}/4
            </strong>
          </div>
          {activeOverseasCount >= 4 && (
            <span className="text-amber-400 font-medium text-[10px] sm:text-[11px]">
              Quota full (Domestic only)
            </span>
          )}
        </div>

        {/* Players Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 flex-1">
          {team.players.map((player) => {
            const isSelected = selectedPlayer?.id === player.id;
            const isAlreadyDrafted = Object.values(lineup).some(p => p && p.id === player.id);
            const isOverseasBlocked = player.isOverseas && activeOverseasCount >= 4;

            return (
              <div
                key={player.id}
                onClick={() => !isAlreadyDrafted && !isOverseasBlocked && handlePlayerClick(player)}
                className={`rounded-xl p-2.5 sm:p-3.5 border transition-all flex flex-col justify-between cursor-pointer ${
                  isAlreadyDrafted
                    ? 'opacity-35 cursor-not-allowed bg-zinc-950 border-zinc-800'
                    : isOverseasBlocked
                    ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-800'
                    : isSelected
                    ? 'bg-zinc-800 border-amber-500 ring-1 ring-amber-500/50 shadow-sm'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                {/* Header: Role & Overseas */}
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-medium mb-1">
                  <span className="font-sports uppercase text-zinc-300 truncate">
                    {player.role.replace('_', ' ')}
                  </span>
                  {player.isOverseas && (
                    <span className="px-1 py-0.2 rounded bg-zinc-800 text-sky-300 font-semibold flex items-center gap-0.5 shrink-0">
                      <Plane className="w-2.5 h-2.5" /> OS
                    </span>
                  )}
                </div>

                {/* Player Name */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                    {player.name}
                  </h3>
                  <span className="text-[10px] sm:text-xs text-zinc-400 block truncate">{player.country}</span>
                </div>

                {/* Rating */}
                <div className="my-1.5 sm:my-2 p-1.5 sm:p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">OVR</span>
                  {isProMode ? (
                    <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Pro IQ
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-lg font-bold font-sports text-amber-400">
                        {player.overall}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-500">
                        ({player.batRating}B/{player.bowlRating}W)
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Season Stat */}
                <div className="text-[9px] sm:text-[10px] text-zinc-400 mb-1.5">
                  <span className="text-zinc-300 font-medium block truncate">{player.specialBadge}</span>
                </div>

                {/* Selection state button */}
                <div className="text-[10px] sm:text-[11px] pt-1.5 border-t border-zinc-800/60 text-center">
                  {isAlreadyDrafted ? (
                    <span className="text-zinc-600">Drafted</span>
                  ) : isOverseasBlocked ? (
                    <span className="text-red-400">Quota Full</span>
                  ) : isSelected ? (
                    <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-medium">Select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Placement Action Bar */}
        {selectedPlayer && (
          <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm sm:text-base font-bold font-sports text-amber-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                {selectedPlayer.overall}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 leading-none">Drafting Player</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{selectedPlayer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-[11px] sm:text-xs text-zinc-400 whitespace-nowrap">Slot:</label>
              <select
                value={targetSlotId || ''}
                onChange={(e) => setTargetSlotId(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none flex-1 sm:flex-initial"
              >
                {getCompatibleSlots(selectedPlayer).map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name} {lineup[slot.id] ? `(Swap ${lineup[slot.id].name})` : '(Open)'}
                  </option>
                ))}
              </select>

              <button
                onClick={handleConfirmDraft}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <span>Draft</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
