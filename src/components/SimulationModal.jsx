import React, { useState, useEffect, useRef } from 'react';
import { simulateCricketMatch } from '../engine/simulationEngine';
import { sound } from '../engine/soundEffects';
import { X, Play, Pause, FastForward, CheckCircle2, XCircle, BarChart3, Eye } from 'lucide-react';

export default function SimulationModal({
  lineup,
  captainId,
  viceCaptainId,
  fixtures,
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
      return;
    }

    const delay = Math.max(120, Math.floor(1000 / speedMultiplier));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-sports font-bold text-sm">
              M{currentMatchIndex + 1}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Match {currentMatchIndex + 1} of {totalMatches}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal">
                  {currentFixture?.stage}
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span>Record: <strong className="text-zinc-100">{winsCount}W - {lossesCount}L</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Fantasy: <strong className="text-zinc-100">{totalFantasyPoints.toLocaleString()} pts</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateAllRemaining}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />
              <span className="hidden sm:inline">Fast Sim</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fixtures Progression Strip */}
        <div className="px-4 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {fixtures.map((fix, idx) => {
            const isDone = idx < currentMatchIndex;
            const res = isDone ? matchResults[idx] : idx === currentMatchIndex && isMatchFinished ? simulatedMatchData : null;
            const isCurrent = idx === currentMatchIndex;

            return (
              <div
                key={fix.matchNumber}
                className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-sports text-xs font-bold transition-all ${
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

        {/* Main Simulation View */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3.5">
          {/* Opponent Card */}
          <div className="rounded-xl p-3.5 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                {currentFixture?.opponentName}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentFixture?.venue} • <span className="text-zinc-300">{currentFixture?.pitchName || currentFixture?.pitchType}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 self-start sm:self-auto text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Your Odds</span>
                <span className="font-bold font-sports text-zinc-100">
                  {simulatedMatchData?.odds.userOdds || '1.45'}
                </span>
              </div>
              <div className="h-5 w-px bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Opponent</span>
                <span className="font-bold font-sports text-zinc-400">
                  {simulatedMatchData?.odds.opponentOdds || '2.80'}
                </span>
              </div>
            </div>
          </div>

          {/* Broadcast Scoreboard Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Main Score Area */}
            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Your Innings</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black font-sports text-white">
                        {activeRuns}/{activeWkts}
                      </span>
                      <span className="text-sm font-semibold text-zinc-400 font-sports">
                        ({activeOvers} ov)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">{currentFixture?.shortName} Target</span>
                    <div className="text-lg font-bold font-sports text-zinc-300 mt-0.5">
                      {simulatedMatchData?.opponentScore}
                    </div>
                  </div>
                </div>

                {/* Active Players Box */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block">Striker</span>
                    <strong className="text-zinc-200 font-medium truncate block">
                      {currentEvent?.strikerName || 'Opening Bat'}
                    </strong>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block">Bowler</span>
                    <strong className="text-zinc-200 font-medium truncate block">
                      {currentEvent?.bowlerName || currentFixture?.keyPlayers[0]}
                    </strong>
                  </div>
                </div>

                {/* Live Delivery Event */}
                {currentEvent && (
                  <div className={`p-2.5 rounded-lg border text-center text-xs transition-all ${
                    currentEvent.eventType === 'SIX'
                      ? 'bg-zinc-900 border-zinc-600 text-amber-300 font-bold'
                      : currentEvent.eventType === 'FOUR'
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 font-bold'
                      : currentEvent.eventType === 'WICKET'
                      ? 'bg-red-950/60 border-red-800 text-red-300 font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400'
                  }`}>
                    {currentEvent.commentary}
                  </div>
                )}
              </div>

              {/* Live Win Probability Bar */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px] mb-1 text-zinc-400 font-medium">
                  <span className="text-zinc-200">Your XI: {liveWinProb}%</span>
                  <span className="text-zinc-500 text-[10px]">Win Predictor</span>
                  <span className="text-zinc-400">{currentFixture?.shortName}: {100 - liveWinProb}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
                  <div className="h-full bg-zinc-100 transition-all duration-200" style={{ width: `${liveWinProb}%` }} />
                  <div className="h-full bg-zinc-700 transition-all duration-200" style={{ width: `${100 - liveWinProb}%` }} />
                </div>
              </div>
            </div>

            {/* Commentary Feed */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase block mb-2">
                  Match Timeline
                </span>

                <div
                  ref={commentaryContainerRef}
                  className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs"
                >
                  {simulatedMatchData?.ballByBallEvents.slice(0, playbackIndex).map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] border-b border-zinc-900 pb-1 text-zinc-300">
                      <span className="font-sports font-bold text-zinc-400 shrink-0">[{ev.over}]</span>
                      <span className={ev.eventType === 'WICKET' ? 'text-red-400 font-semibold' : ev.eventType === 'SIX' ? 'text-amber-300 font-semibold' : ev.eventType === 'FOUR' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}>
                        {ev.commentary}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Over Chart */}
              <div className="mt-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-end gap-1 h-8 bg-zinc-900 p-1 rounded border border-zinc-800">
                  {simulatedMatchData?.overGraph.slice(0, Math.ceil(playbackIndex / 6)).map((og, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-zinc-400 hover:bg-zinc-200 rounded-xs transition-all"
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
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
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
                  <h4 className="text-sm font-bold text-white">
                    {simulatedMatchData.marginText}
                  </h4>
                  <span className="text-xs text-zinc-400">+{simulatedMatchData.totalTeamFantasyPoints} Fantasy Points</span>
                </div>
              </div>

              <button
                onClick={() => setShowFullScorecard(!showFullScorecard)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                <span>{showFullScorecard ? 'Hide' : 'Scorecard'}</span>
              </button>
            </div>
          )}

          {/* Full Detailed Scorecard */}
          {showFullScorecard && simulatedMatchData && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 overflow-x-auto">
              <h4 className="text-xs font-bold text-zinc-300 uppercase mb-2">
                Batting Scorecard
              </h4>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-sports">
                    <th className="py-1">Batter</th>
                    <th>Dismissal</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th className="text-right">Fantasy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {simulatedMatchData.playerFantasySummary.map(item => (
                    <tr key={item.player.id} className="text-zinc-300">
                      <td className="py-1 font-medium text-zinc-100 flex items-center gap-1">
                        {item.player.name}
                        {item.player.id === captainId && <span className="text-[9px] bg-amber-400 text-zinc-950 px-1 rounded font-bold">C</span>}
                        {item.player.id === viceCaptainId && <span className="text-[9px] bg-sky-400 text-zinc-950 px-1 rounded font-bold">VC</span>}
                      </td>
                      <td className="text-zinc-500 text-[11px]">{item.stats.dismissal}</td>
                      <td className="font-bold text-zinc-100 font-sports">{item.stats.runs}</td>
                      <td>{item.stats.ballsFaced}</td>
                      <td>{item.stats.fours}</td>
                      <td>{item.stats.sixes}</td>
                      <td className="font-sports font-semibold text-emerald-400 text-right">+{item.fantasy.finalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Playback Controls */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          {!isMatchFinished ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-sports">
                {[1, 2, 5].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setSpeedMultiplier(speed)}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      speedMultiplier === speed
                        ? 'bg-zinc-100 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleInstantSkip}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
              >
                Instant
              </button>
            </div>
          ) : (
            <span className="text-xs text-zinc-400">
              {currentMatchIndex + 1 < totalMatches ? `Next fixture: Match ${currentMatchIndex + 2}` : 'Campaign finished'}
            </span>
          )}

          <div>
            <button
              onClick={handleNextMatch}
              disabled={!isMatchFinished}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isMatchFinished
                  ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <span>{currentMatchIndex + 1 < totalMatches ? 'Next Match' : 'View Summary'}</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
