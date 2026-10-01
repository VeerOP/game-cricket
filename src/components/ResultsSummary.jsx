import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../engine/soundEffects';
import { Trophy, Share2, RotateCcw, Check, Award } from 'lucide-react';

export default function ResultsSummary({
  matchResults,
  totalFantasyPoints,
  lineup,
  captainId,
  viceCaptainId,
  onResetSeason
}) {
  const [copied, setCopied] = useState(false);

  const winsCount = matchResults.filter(m => m.isWin).length;
  const lossesCount = matchResults.filter(m => !m.isWin).length;
  const totalMatches = matchResults.length;
  const isInvincible = winsCount === totalMatches && totalMatches > 0;

  useEffect(() => {
    sound.init();
    if (isInvincible) {
      sound.playVictory();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff']
      });
    } else {
      sound.playBoundaryHorn();
    }
  }, [isInvincible]);

  const playerStatsMap = {};
  Object.values(lineup).filter(Boolean).forEach(p => {
    playerStatsMap[p.id] = {
      player: p,
      runs: 0,
      balls: 0,
      wickets: 0,
      fantasyPts: 0
    };
  });

  matchResults.forEach(match => {
    match.playerFantasySummary.forEach(item => {
      if (playerStatsMap[item.player.id]) {
        playerStatsMap[item.player.id].runs += item.stats.runs || 0;
        playerStatsMap[item.player.id].balls += item.stats.ballsFaced || 0;
        playerStatsMap[item.player.id].wickets += item.stats.wickets || 0;
        playerStatsMap[item.player.id].fantasyPts += item.fantasy.finalPoints || 0;
      }
    });
  });

  const allPerformers = Object.values(playerStatsMap);
  const orangeCap = [...allPerformers].sort((a, b) => b.runs - a.runs)[0];
  const purpleCap = [...allPerformers].sort((a, b) => b.wickets - a.wickets)[0];
  const tournamentMVP = [...allPerformers].sort((a, b) => b.fantasyPts - a.fantasyPts)[0];

  const captainPlayer = Object.values(lineup).find(p => p && p.id === captainId);

  const handleShare = () => {
    const text = `🏏 16-0: The Invincibles Draft\n` +
      `${isInvincible ? '🏆 16-0 UNDEFEATED CHAMPIONS' : `Record: ${winsCount}W - ${lossesCount}L`}\n` +
      `Fantasy Score: ${totalFantasyPoints.toLocaleString()} pts\n` +
      `Top Run Scorer: ${orangeCap?.player.name} (${orangeCap?.runs}r)\n` +
      `Top Wickets: ${purpleCap?.player.name} (${purpleCap?.wickets}w)\n` +
      `Captain: ${captainPlayer ? captainPlayer.name : 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col items-center text-center my-auto max-h-[92dvh] overflow-y-auto">
        {/* Header Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
          <Trophy className={`w-7 h-7 sm:w-8 sm:h-8 ${isInvincible ? 'text-amber-400' : 'text-zinc-400'}`} />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight font-sports uppercase">
          {isInvincible ? '16-0 Invincible Champions' : 'Season Complete'}
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5 sm:mt-1 max-w-sm">
          {isInvincible
            ? 'Flawless run. You completed the campaign without suffering a single defeat.'
            : `Finished with ${winsCount} Wins and ${lossesCount} Losses.`}
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 my-4 sm:my-5">
          <div className="bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block font-sports">Record</span>
            <span className="text-lg sm:text-xl font-bold font-sports text-zinc-100">
              {winsCount}-{lossesCount}
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block font-sports">Win Rate</span>
            <span className="text-lg sm:text-xl font-bold font-sports text-zinc-100">
              {totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0}%
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block font-sports">Points</span>
            <span className="text-lg sm:text-xl font-bold font-sports text-zinc-100">
              {winsCount * 2}
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block font-sports">Fantasy</span>
            <span className="text-lg sm:text-xl font-bold font-sports text-emerald-400">
              {totalFantasyPoints.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Honors Box */}
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-3.5 mb-4 sm:mb-5 text-left">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 font-sports">
            Individual Awards
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-amber-400 font-semibold block">Top Run Scorer</span>
              <strong className="text-zinc-100 block truncate">{orangeCap?.player.name}</strong>
              <span className="text-zinc-500 text-[11px]">{orangeCap?.runs} Runs</span>
            </div>

            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-purple-400 font-semibold block">Top Wickets</span>
              <strong className="text-zinc-100 block truncate">{purpleCap?.player.name}</strong>
              <span className="text-zinc-500 text-[11px]">{purpleCap?.wickets} Wkts</span>
            </div>

            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-sky-400 font-semibold block">Squad MVP</span>
              <strong className="text-zinc-100 block truncate">{tournamentMVP?.player.name}</strong>
              <span className="text-zinc-500 text-[11px]">{tournamentMVP?.fantasyPts} pts</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Card'}</span>
          </button>

          <button
            onClick={onResetSeason}
            className="w-full sm:w-auto px-6 py-2 sm:py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
