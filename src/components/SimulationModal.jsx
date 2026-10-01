import React, { useState, useEffect, useRef } from 'react';
import { simulateCricketMatch } from '../engine/simulationEngine';
import { sound } from '../engine/soundEffects';
import { X, Play, Pause, FastForward, CheckCircle2, XCircle, BarChart3, Eye, Trophy } from 'lucide-react';
import PointsTableModal from './PointsTableModal';

export default function SimulationModal({
  lineup,
  captainId,
  viceCaptainId,
  fixtures,
  activeLeague = 'IPL',
  standings = [],
  onUpdateStandings,
  onCompleteSeason,
  onClose
}) {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchResults, setMatchResults] = useState([]);
  const [simulatedMatchData, setSimulatedMatchData] = useState(null);

  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(2);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [showPointsTable, setShowPointsTable] = useState(false);

  const [totalFantasyPoints, setTotalFantasyPoints] = useState(0);
  const [liveWinProb, setLiveWinProb] = useState(50);

  const commentaryContainerRef = useRef(null);

  const currentFixture = fixtures[currentMatchIndex];
  const totalMatches = fixtures.length;

  useEffect(() => {
    if (currentMatchIndex < totalMatches) {
      sound.init();
      const outcome = simulateCricketMatch(lineup, currentFixture, captainId, viceCaptainId);
      setSimulatedMatchData(outcome);
      setPlaybackIndex(0);
      setIsMatchFinished(false);
      setIsPlaying(true);
      setLiveWinProb(outcome.odds.winProbabilityPercent);
    }
  }, [currentMatchIndex]);

  useEffect(() => {
    if (!simulatedMatchData || isMatchFinished || !isPlaying) return;

    const totalEvents = simulatedMatchData.ballByBallEvents.length;
    if (playbackIndex >= totalEvents) {
      setIsMatchFinished(true);
      if (simulatedMatchData.isWin) sound.playVictory();
      else sound.playWicket();
      if (onUpdateStandings) {
        onUpdateStandings(simulatedMatchData, currentMatchIndex);
      }
      return;
    }

    const delay = Math.max(100, Math.floor(900 / speedMultiplier));
    const timer = setTimeout(() => {
      const currentEvent = simulatedMatchData.ballByBallEvents[playbackIndex];

      if (currentEvent.eventType === 'FOUR' || currentEvent.eventType === 'SIX') {
        sound.playBatCrack();
      } else if (currentEvent.eventType === 'WICKET') {
        sound.playWicket();
      }

      const progressFraction = playbackIndex / totalEvents;
      let targetProb = simulatedMatchData.isWin ? 95 : 10;
      let interpolated = Math.round(
        simulatedMatchData.odds.winProbabilityPercent +
        (targetProb - simulatedMatchData.odds.winProbabilityPercent) * progressFraction +
        (Math.random() - 0.5) * 6
      );
      setLiveWinProb(Math.min(99, Math.max(2, interpolated)));

      setPlaybackIndex(prev => prev + 1);

      if (commentaryContainerRef.current) {
        commentaryContainerRef.current.scrollTop = commentaryContainerRef.current.scrollHeight;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [simulatedMatchData, playbackIndex, isPlaying, speedMultiplier, isMatchFinished]);

  const handleInstantSkip = () => {
    if (!simulatedMatchData) return;
    setPlaybackIndex(simulatedMatchData.ballByBallEvents.length);
    setIsMatchFinished(true);
    setLiveWinProb(simulatedMatchData.isWin ? 99 : 5);
    if (simulatedMatchData.isWin) sound.playVictory();
    else sound.playWicket();
    if (onUpdateStandings) {
      onUpdateStandings(simulatedMatchData, currentMatchIndex);
    }
  };

  const handleNextMatch = () => {
    if (!simulatedMatchData) return;
    const updatedResults = [...matchResults, simulatedMatchData];
    setMatchResults(updatedResults);
    setTotalFantasyPoints(prev => prev + simulatedMatchData.totalTeamFantasyPoints);

    if (currentMatchIndex + 1 < totalMatches) {
      setCurrentMatchIndex(prev => prev + 1);
      setSimulatedMatchData(null);
    } else {
      onCompleteSeason(updatedResults, totalFantasyPoints + simulatedMatchData.totalTeamFantasyPoints);
    }
  };

  const handleSimulateAllRemaining = () => {
    sound.init();
    const results = [...matchResults];
    let fantasyAcc = totalFantasyPoints;

    for (let i = currentMatchIndex; i < totalMatches; i++) {
      let outcome = i === currentMatchIndex && simulatedMatchData
        ? simulatedMatchData
        : simulateCricketMatch(lineup, fixtures[i], captainId, viceCaptainId);

      results.push(outcome);
      fantasyAcc += outcome.totalTeamFantasyPoints;
      if (onUpdateStandings) {
        onUpdateStandings(outcome, i);
      }
    }

    setMatchResults(results);
    setTotalFantasyPoints(fantasyAcc);
    onCompleteSeason(results, fantasyAcc);
  };

  const currentEvent = simulatedMatchData?.ballByBallEvents[Math.max(0, playbackIndex - 1)];
  const activeOvers = currentEvent ? currentEvent.over : '0.0';
  const activeRuns = currentEvent ? currentEvent.totalRuns : 0;
  const activeWkts = currentEvent ? currentEvent.wickets : 0;

  const winsCount = matchResults.filter(m => m.isWin).length + (isMatchFinished && simulatedMatchData?.isWin ? 1 : 0);
  const lossesCount = matchResults.filter(m => !m.isWin).length + (isMatchFinished && !simulatedMatchData?.isWin ? 1 : 0);

  const userTeamStanding = standings.find(t => t.isUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94dvh]">
        {/* Top Header */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-sports font-bold text-xs sm:text-sm shrink-0">
              M{currentMatchIndex + 1}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2 flex-wrap truncate">
                <span>Match {currentMatchIndex + 1} of {totalMatches}</span>
                <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-normal shrink-0">
                  {currentFixture?.stage}
                </span>
                {userTeamStanding && (
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.2 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-sports font-bold shrink-0">
                    Rank #{userTeamStanding.rank} ({userTeamStanding.points} PTS)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                <span>Rec: <strong className="text-zinc-100">{winsCount}W - {lossesCount}L</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Pts: <strong className="text-zinc-100">{totalFantasyPoints.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowPointsTable(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
              title="View Points Table & Qualifiers"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Points Table</span>
            </button>

            <button
              onClick={handleSimulateAllRemaining}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
              title="Fast simulate all remaining matches"
            >
              <FastForward className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Sim All</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Fixtures Progression Strip */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {fixtures.map((fix, idx) => {
            const isDone = idx < currentMatchIndex;
            const res = isDone ? matchResults[idx] : idx === currentMatchIndex && isMatchFinished ? simulatedMatchData : null;
            const isCurrent = idx === currentMatchIndex;

            return (
              <div
                key={fix.matchNumber}
                className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-sports text-[10px] sm:text-xs font-bold transition-all ${
                  res?.isWin
                    ? 'bg-emerald-500 text-zinc-950 font-black'
                    : res && !res.isWin
                    ? 'bg-rose-500 text-white font-black'
                    : isCurrent
                    ? 'bg-zinc-100 text-zinc-950 font-black ring-1 ring-zinc-300'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {res ? (res.isWin ? 'W' : 'L') : fix.shortName.slice(0, 2)}
              </div>
            );
          })}
        </div>

        {/* Live Broadcast Arena */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3 sm:gap-4 no-scrollbar">
          {/* Opponent Info & Pitch Banner */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-sports">
                Fixture vs
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {currentFixture?.opponentName}
              </h3>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                {currentFixture?.venue} • <span className="text-zinc-300 font-medium">{currentFixture?.pitchName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase block font-semibold">Opponent OVR</span>
                <span className="font-sports font-bold text-zinc-100 text-xs sm:text-sm">{currentFixture?.threatRating}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase block font-semibold">Win Odds</span>
                <span className="font-sports font-bold text-emerald-400 text-xs sm:text-sm">{simulatedMatchData?.odds.winProbabilityPercent}%</span>
              </div>
            </div>
          </div>

          {/* Main Broadcast Split Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* Left: Scoreboard & Win Prob Gauge */}
            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-sports">
                    Live Scorecard
                  </span>
                  <span className="text-[11px] font-medium text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {simulatedMatchData?.isUserBattingFirst ? 'Target Defense' : 'Chasing Target'}
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="grid grid-cols-2 gap-3 py-1">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block font-sports">
                      Your Starting XI
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-sports text-white mt-1">
                      {activeRuns}/{activeWkts}
                    </div>
                    <span className="text-xs text-zinc-400 font-sports">
                      ({activeOvers} / 20.0 ov)
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block font-sports truncate">
                      {currentFixture?.shortName}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-sports text-zinc-400 mt-1">
                      {simulatedMatchData?.opponentRuns}/{simulatedMatchData?.opponentWickets}
                    </div>
                    <span className="text-xs text-zinc-500 font-sports">
                      (20.0 ov)
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Win Probability Bar */}
              <div className="mt-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs mb-1 font-sports">
                  <span className="text-emerald-400 font-bold">You: {liveWinProb}%</span>
                  <span className="text-zinc-500 text-[10px] uppercase">Win Probability</span>
                  <span className="text-zinc-400 font-bold">{currentFixture?.shortName}: {100 - liveWinProb}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${liveWinProb}%` }}
                  />
                  <div
                    className="bg-zinc-700 h-full transition-all duration-300"
                    style={{ width: `${100 - liveWinProb}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Ball-by-ball Commentary & Over Chart */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase block mb-1.5 sm:mb-2 font-sports">
                  Match Commentary
                </span>

                <div
                  ref={commentaryContainerRef}
                  className="space-y-1.5 max-h-36 sm:max-h-48 overflow-y-auto pr-1 text-xs"
                >
                  {simulatedMatchData?.ballByBallEvents.slice(0, playbackIndex).map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] border-b border-zinc-900 pb-1 text-zinc-300">
                      <span className="font-sports font-bold text-amber-400 shrink-0 w-8">
                        {ev.over}
                      </span>
                      <span className="flex-1 leading-snug">
                        {ev.commentary}
                      </span>
                    </div>
                  ))}
                  {playbackIndex === 0 && (
                    <span className="text-zinc-500 italic text-[11px]">Match starting...</span>
                  )}
                </div>
              </div>

              {/* Mini Over Chart */}
              <div className="mt-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-end gap-0.5 sm:gap-1 h-8 bg-zinc-900 p-1 rounded border border-zinc-800 overflow-x-auto no-scrollbar">
                  {simulatedMatchData?.overGraph.slice(0, Math.ceil(playbackIndex / 6)).map((og, idx) => (
                    <div
                      key={idx}
                      className="flex-1 min-w-[6px] bg-zinc-400 hover:bg-zinc-200 rounded-xs transition-all"
                      style={{ height: `${Math.min(100, Math.max(15, (og.overRuns / 24) * 100))}%` }}
                      title={`Over ${og.over}: ${og.overRuns} runs`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Post Match Result Banner */}
          {isMatchFinished && simulatedMatchData && (
            <div className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 ${
              simulatedMatchData.isWin
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-red-950/40 border-red-800/80 text-red-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {simulatedMatchData.isWin ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {simulatedMatchData.marginText}
                  </h4>
                  <span className="text-[11px] text-zinc-400">+{simulatedMatchData.totalTeamFantasyPoints} Fantasy Points</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowPointsTable(true)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Check Table Rank</span>
                </button>

                <button
                  onClick={() => setShowFullScorecard(!showFullScorecard)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{showFullScorecard ? 'Hide' : 'Scorecard'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Full Detailed Scorecard */}
          {showFullScorecard && simulatedMatchData && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-3.5 overflow-x-auto">
              <h4 className="text-xs font-bold text-zinc-300 uppercase mb-2 font-sports">
                Batting Scorecard
              </h4>
              <table className="w-full text-left text-xs min-w-[340px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-sports">
                    <th className="py-1">Batter</th>
                    <th className="py-1">Dismissal</th>
                    <th className="py-1 text-right">R</th>
                    <th className="py-1 text-right">B</th>
                    <th className="py-1 text-right">4s</th>
                    <th className="py-1 text-right">6s</th>
                    <th className="py-1 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {simulatedMatchData.playerFantasySummary.map((item, idx) => (
                    <tr key={idx} className="text-zinc-300">
                      <td className="py-1.5 font-medium flex items-center gap-1">
                        <span>{item.player.name}</span>
                        {item.player.id === captainId && <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-black font-bold rounded">C</span>}
                        {item.player.id === viceCaptainId && <span className="text-[9px] px-1 py-0.2 bg-sky-400 text-black font-bold rounded">VC</span>}
                      </td>
                      <td className="py-1.5 text-zinc-500 text-[11px]">{item.stats.dismissal}</td>
                      <td className="py-1.5 text-right font-bold text-white">{item.stats.runs}</td>
                      <td className="py-1.5 text-right text-zinc-400">{item.stats.ballsFaced}</td>
                      <td className="py-1.5 text-right text-zinc-400">{item.stats.fours}</td>
                      <td className="py-1.5 text-right text-zinc-400">{item.stats.sixes}</td>
                      <td className="py-1.5 text-right text-zinc-400">
                        {item.stats.ballsFaced > 0 ? ((item.stats.runs / item.stats.ballsFaced) * 100).toFixed(1) : '0.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Playback Controls */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          {!isMatchFinished ? (
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>

              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`px-2 py-1 rounded text-xs font-bold font-sports transition-all cursor-pointer ${
                      speedMultiplier === spd
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleInstantSkip}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
              >
                Instant Finish
              </button>
            </div>
          ) : (
            <span className="text-xs text-zinc-400 text-center sm:text-left">
              {currentMatchIndex + 1 < totalMatches ? `Next fixture: Match ${currentMatchIndex + 2}` : 'Tournament season completed!'}
            </span>
          )}

          <div className="w-full sm:w-auto">
            <button
              onClick={handleNextMatch}
              disabled={!isMatchFinished}
              className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isMatchFinished
                  ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <span>{currentMatchIndex + 1 < totalMatches ? 'Next Match' : 'View Tournament Results'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Points Table Sub-Modal */}
      {showPointsTable && (
        <PointsTableModal
          standings={standings}
          activeLeague={activeLeague}
          currentRound={currentMatchIndex + 1}
          totalRounds={totalMatches}
          onClose={() => setShowPointsTable(false)}
        />
      )}
    </div>
  );
}
