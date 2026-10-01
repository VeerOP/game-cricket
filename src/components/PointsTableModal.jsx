import React from 'react';
import { Trophy, X, Shield, ChevronRight, Award, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { formatNRR } from '../engine/standingsEngine';

export default function PointsTableModal({
  standings = [],
  activeLeague = 'IPL',
  currentRound = 0,
  totalRounds = 10,
  onClose
}) {
  const userTeam = standings.find(t => t.isUser);
  const cutoffRank = 4; // Top 4 qualify for playoffs

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {activeLeague === 'ALL_STARS' ? 'Global All-Stars' : activeLeague.replace('_', ' ')} Points Table
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-sports bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {currentRound > 0 ? `Matchday ${currentRound} of ${totalRounds}` : 'Pre-Season Standings'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                Top 4 teams qualify for the Season Playoffs (Qualifier 1 & Eliminator)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Standing Highlight Card */}
        {userTeam && (
          <div className="px-4 sm:px-5 py-3 bg-emerald-950/20 border-b border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 font-sports font-black text-sm flex items-center justify-center shrink-0">
                #{userTeam.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-emerald-300">
                    Your Starting XI Standing: Rank #{userTeam.rank}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${userTeam.statusBadgeColor}`}>
                    {userTeam.statusLabel}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                  <span>Played: <strong className="text-zinc-200">{userTeam.played}</strong></span>
                  <span>•</span>
                  <span>Won: <strong className="text-emerald-400">{userTeam.won}</strong></span>
                  <span>•</span>
                  <span>Lost: <strong className="text-red-400">{userTeam.lost}</strong></span>
                  <span>•</span>
                  <span>PTS: <strong className="text-amber-400">{userTeam.points}</strong></span>
                  <span>•</span>
                  <span>NRR: <strong className={userTeam.nrr >= 0 ? 'text-emerald-400' : 'text-red-400'}>{userTeam.nrrFormatted}</strong></span>
                </div>
              </div>
            </div>

            {userTeam.rank <= 2 && (
              <span className="text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-950/60 rounded-md border border-emerald-800/80">
                ★ Top 2 Spot: Qualifier 1 (Double Chance)
              </span>
            )}
            {userTeam.rank > 2 && userTeam.rank <= 4 && (
              <span className="text-[11px] text-teal-400 font-medium px-2 py-1 bg-teal-950/60 rounded-md border border-teal-800/80">
                ✓ Playoff Spot: Eliminator Qualified
              </span>
            )}
          </div>
        )}

        {/* Scrollable Points Table */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-sports uppercase tracking-wider bg-zinc-900/60">
                  <th className="py-2.5 px-3 text-center w-12">Pos</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3 text-center">P</th>
                  <th className="py-2.5 px-3 text-center text-emerald-400">W</th>
                  <th className="py-2.5 px-3 text-center text-red-400">L</th>
                  <th className="py-2.5 px-3 text-center font-bold text-amber-400">PTS</th>
                  <th className="py-2.5 px-3 text-center">NRR</th>
                  <th className="py-2.5 px-3 text-center">Last 5</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {standings.map((team, idx) => {
                  const isCutoff = idx === cutoffRank - 1;

                  return (
                    <React.Fragment key={team.teamId || idx}>
                      <tr
                        className={`transition-colors ${
                          team.isUser
                            ? 'bg-emerald-950/30 font-semibold border-l-4 border-l-emerald-500'
                            : idx % 2 === 0
                              ? 'bg-zinc-900/40 hover:bg-zinc-900/80'
                              : 'bg-zinc-950 hover:bg-zinc-900/60'
                        }`}
                      >
                        {/* Position */}
                        <td className="py-2.5 px-3 text-center font-sports font-bold text-zinc-300">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] ${
                              team.rank <= 2
                                ? 'bg-amber-400/20 text-amber-300 font-black'
                                : team.rank <= 4
                                  ? 'bg-teal-400/20 text-teal-300'
                                  : 'text-zinc-500'
                            }`}>
                              {team.rank}
                            </span>
                          </div>
                        </td>

                        {/* Team Name */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: team.color || '#3b82f6' }}
                            />
                            <span className={`truncate font-medium ${team.isUser ? 'text-emerald-300 font-bold' : 'text-zinc-100'}`}>
                              {team.name}
                            </span>
                            {team.isUser && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Played */}
                        <td className="py-2.5 px-3 text-center text-zinc-300 font-medium">
                          {team.played}
                        </td>

                        {/* Won */}
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-semibold">
                          {team.won}
                        </td>

                        {/* Lost */}
                        <td className="py-2.5 px-3 text-center text-red-400">
                          {team.lost}
                        </td>

                        {/* Points */}
                        <td className="py-2.5 px-3 text-center font-sports font-black text-amber-400 text-sm">
                          {team.points}
                        </td>

                        {/* NRR */}
                        <td className={`py-2.5 px-3 text-center font-mono text-[11px] ${
                          team.nrr > 0 ? 'text-emerald-400' : team.nrr < 0 ? 'text-red-400' : 'text-zinc-500'
                        }`}>
                          {team.nrrFormatted || formatNRR(team.nrr)}
                        </td>

                        {/* Form */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {team.form.length === 0 ? (
                              <span className="text-[10px] text-zinc-600">-</span>
                            ) : (
                              team.form.slice(-5).map((f, fIdx) => (
                                <span
                                  key={fIdx}
                                  className={`w-4 h-4 rounded text-[9px] font-black font-sports flex items-center justify-center leading-none ${
                                    f === 'W'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {f}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-right">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${team.statusBadgeColor}`}>
                            {team.statusLabel}
                          </span>
                        </td>
                      </tr>

                      {/* Green Playoff Cutoff Divider Line */}
                      {isCutoff && idx < standings.length - 1 && (
                        <tr className="bg-emerald-950/40 border-y-2 border-emerald-500/60">
                          <td colSpan={9} className="py-1 px-3 text-[10px] font-bold text-emerald-400 text-center uppercase tracking-wider font-sports">
                            ▲ Top 4 Qualify for Season Playoffs • Relegation / Elimination Zone Below ▼
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Qualifiers & Playoff Rules Info Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 sm:p-4 text-xs">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider font-sports flex items-center gap-1.5 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Tournament Qualification Rules</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-400">
              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Qualifier 1 (Rank #1 vs Rank #2)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Winner advances straight to the Grand Final. The losing team gets a second chance in Qualifier 2.
                </p>
              </div>

              <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-teal-300 font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>Eliminator (Rank #3 vs Rank #4)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Sudden death knockout. Winner advances to Qualifier 2. Loser is eliminated from the tournament.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Back to Match Arena
          </button>
        </div>
      </div>
    </div>
  );
}
