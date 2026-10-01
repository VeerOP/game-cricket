import React, { useState } from 'react';
import {
  Users,
  Trophy,
  Dices,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Swords,
  ChevronRight,
  Crown,
  Medal,
  Globe,
  ArrowRight,
  Volume2,
  VolumeX,
  FastForward,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import SlotReelSelector from './SlotReelSelector';
import PlayerDrawer from './PlayerDrawer';
import { SQUAD_SLOTS, ALL_CRICKET_TEAMS } from '../data/franchises';
import { calculateSquadSynergy, simulateHeadToHeadMatch } from '../engine/simulationEngine';
import { sound } from '../engine/soundEffects';
import confetti from 'canvas-confetti';

export default function MultiplayerMode({ onExitMultiplayer }) {
  // Manager profiles
  const [p1Name, setP1Name] = useState('Manager 1');
  const [p2Name, setP2Name] = useState('Manager 2');
  const [activeLeague, setActiveLeague] = useState('ALL_STARS');

  // Draft state
  const [activeTurn, setActiveTurn] = useState(1); // 1 = P1, 2 = P2
  const [draftRound, setDraftRound] = useState(1); // 1 to 11
  const [p1Lineup, setP1Lineup] = useState({});
  const [p2Lineup, setP2Lineup] = useState({});
  const [p1CapId, setP1CapId] = useState(null);
  const [p1VcId, setP1VcId] = useState(null);
  const [p2CapId, setP2CapId] = useState(null);
  const [p2VcId, setP2VcId] = useState(null);

  // Spun team & drawer state
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpunTeam, setCurrentSpunTeam] = useState(null);
  const [viewingTeam, setViewingTeam] = useState(1); // which team pitch to view (1 or 2)

  // Match Simulation & Arena state
  const [matchResult, setMatchResult] = useState(null);
  const [isSimulatingMatch, setIsSimulatingMatch] = useState(false);
  const [activeTab, setActiveTab] = useState('SCORECARD'); // 'SCORECARD' | 'COMMENTARY' | 'FANTASY'

  const filteredTeams = React.useMemo(() => {
    return activeLeague === 'ALL_STARS'
      ? ALL_CRICKET_TEAMS
      : ALL_CRICKET_TEAMS.filter(t => t.league === activeLeague);
  }, [activeLeague]);

  const p1Count = Object.values(p1Lineup).filter(Boolean).length;
  const p2Count = Object.values(p2Lineup).filter(Boolean).length;
  const isDraftComplete = p1Count === 11 && p2Count === 11;

  const p1Synergy = calculateSquadSynergy(p1Lineup, p1CapId, p1VcId);
  const p2Synergy = calculateSquadSynergy(p2Lineup, p2CapId, p2VcId);

  // Handle Slot Reel Landed
  const handleSpinComplete = (team) => {
    setCurrentSpunTeam(team);
  };

  // Handle Player Selected into active manager's lineup
  const handleSelectPlayer = (player, slotId) => {
    if (activeTurn === 1) {
      setP1Lineup(prev => ({ ...prev, [slotId]: player }));
      if (!p1CapId) setP1CapId(player.id);
      else if (!p1VcId && p1CapId !== player.id) setP1VcId(player.id);

      // Switch turn to Player 2
      setActiveTurn(2);
      setViewingTeam(2);
    } else {
      setP2Lineup(prev => ({ ...prev, [slotId]: player }));
      if (!p2CapId) setP2CapId(player.id);
      else if (!p2VcId && p2CapId !== player.id) setP2VcId(player.id);

      // Advance round and switch turn back to Player 1
      setDraftRound(r => r + 1);
      setActiveTurn(1);
      setViewingTeam(1);
    }

    setCurrentSpunTeam(null);
  };

  const handleStartHeadToHead = () => {
    if (!isDraftComplete) return;

    sound.init();
    sound.playVictory();

    const result = simulateHeadToHeadMatch(
      p1Lineup,
      p2Lineup,
      p1CapId,
      p1VcId,
      p2CapId,
      p2VcId,
      p1Name,
      p2Name
    );

    setMatchResult(result);
    setIsSimulatingMatch(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // confetti fallback
    }
  };

  const handleResetMultiplayer = () => {
    if (!window.confirm('Reset the multiplayer draft?')) return;
    setP1Lineup({});
    setP2Lineup({});
    setP1CapId(null);
    setP1VcId(null);
    setP2CapId(null);
    setP2VcId(null);
    setActiveTurn(1);
    setDraftRound(1);
    setCurrentSpunTeam(null);
    setMatchResult(null);
    setIsSimulatingMatch(false);
  };

  const currentActiveLineup = activeTurn === 1 ? p1Lineup : p2Lineup;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
              <Swords className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap truncate">
                <span className="font-sports font-black text-xs sm:text-sm tracking-wide text-white uppercase truncate">
                  Head-to-Head Clash
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-sports font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  PVP
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block truncate">
                2 Managers • Turn-by-Turn Draft • 20-Over Live Showdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleResetMultiplayer}
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] sm:text-xs font-medium border border-zinc-700/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              onClick={onExitMultiplayer}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] sm:text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
            >
              Back to Solo
            </button>
          </div>
        </div>
      </header>

      {/* Main Drafting Interface */}
      {!isSimulatingMatch ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-3.5 sm:gap-4">
          {/* Active Turn Tracker Banner */}
          <div
            className={`rounded-2xl border p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
              activeTurn === 1
                ? 'bg-blue-950/25 border-blue-500/40'
                : 'bg-amber-950/25 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-sports font-black text-sm sm:text-base border shadow-md shrink-0 ${
                  activeTurn === 1
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-amber-600 border-amber-400 text-white'
                }`}
              >
                P{activeTurn}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider font-sports text-zinc-400">
                    {isDraftComplete ? 'DRAFT COMPLETED' : `Round ${Math.min(11, draftRound)} of 11`}
                  </span>
                  <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {activeTurn === 1 ? `${p1Name}'s Turn` : `${p2Name}'s Turn`}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                  {isDraftComplete
                    ? 'Both Starting XIs are locked! Ready for Showdown!'
                    : `Spin reel for Pick ${activeTurn === 1 ? p1Count + 1 : p2Count + 1} (${activeTurn === 1 ? p1Name : p2Name})`}
                </h3>
              </div>
            </div>

            {/* Ready to Fight CTA */}
            {isDraftComplete && (
              <button
                onClick={handleStartHeadToHead}
                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sports font-black text-xs uppercase tracking-wider border border-emerald-400 shadow-lg shadow-emerald-950/80 flex items-center justify-center gap-2 animate-bounce cursor-pointer shrink-0"
              >
                <Swords className="w-4 h-4" />
                <span>Simulate Head-to-Head Showdown</span>
              </button>
            )}
          </div>

          {/* Grid: Left Slot Machine Reel + Right Dual Squad Pitches */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-start">
            {/* Slot Reel Drawer Column */}
            <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sports">
                  Draft Reel
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {activeTurn === 1 ? `${p1Name} (${p1Count}/11)` : `${p2Name} (${p2Count}/11)`}
                </span>
              </div>

              <SlotReelSelector
                teams={filteredTeams}
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                disabled={isDraftComplete}
                currentPickNumber={activeTurn === 1 ? p1Count + 1 : p2Count + 1}
                totalPicks={11}
              />

              {/* Manager Config & Quick Switch */}
              <div className="w-full mt-3 pt-2.5 border-t border-zinc-800 flex flex-col gap-2">
                <span className="text-[10px] font-sports font-bold uppercase tracking-wider text-zinc-500">
                  Manager Profiles
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-zinc-400 font-medium mb-0.5">Player 1</label>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-zinc-400 font-medium mb-0.5">Player 2</label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Pitch Board Column */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Pitch Switcher Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setViewingTeam(1)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-sports font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewingTeam === 1
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{p1Name}'s XI</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30">
                      {p1Count}/11
                    </span>
                  </button>

                  <button
                    onClick={() => setViewingTeam(2)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-sports font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewingTeam === 2
                        ? 'bg-amber-600 text-white border border-amber-400'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{p2Name}'s XI</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30">
                      {p2Count}/11
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-sports">
                    <span>OVR:</span>
                    <strong className="text-white">
                      {viewingTeam === 1 ? p1Synergy.overallRating : p2Synergy.overallRating}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>OS:</span>
                    <strong
                      className={
                        (viewingTeam === 1 ? p1Synergy.overseasCount : p2Synergy.overseasCount) > 4
                          ? 'text-red-400'
                          : 'text-zinc-200'
                      }
                    >
                      {viewingTeam === 1 ? p1Synergy.overseasCount : p2Synergy.overseasCount}/4
                    </strong>
                  </span>
                </div>
              </div>

              {/* Roster Slot Pitch Board */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-2">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
                  {SQUAD_SLOTS.map((slot) => {
                    const activeLineup = viewingTeam === 1 ? p1Lineup : p2Lineup;
                    const capId = viewingTeam === 1 ? p1CapId : p2CapId;
                    const vcId = viewingTeam === 1 ? p1VcId : p2VcId;
                    const player = activeLineup[slot.id];
                    const isCap = player && player.id === capId;
                    const isVc = player && player.id === vcId;

                    return (
                      <div
                        key={slot.id}
                        className={`rounded-xl border p-2 sm:p-2.5 flex items-center justify-between gap-2 transition-all ${
                          player
                            ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-950/40 border-dashed border-zinc-800/80'
                        }`}
                      >
                        {/* Slot info */}
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <span className="w-4 sm:w-5 text-[10px] sm:text-[11px] font-sports font-bold text-zinc-500 shrink-0">
                            {slot.id}
                          </span>

                          {player ? (
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                                <span className="text-xs font-bold text-white truncate">
                                  {player.name}
                                </span>
                                {player.isOverseas && (
                                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                                    OS
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 truncate">
                                {player.role.replace('_', ' ')} • {player.country}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs text-zinc-500 font-medium truncate">
                                {slot.name}
                              </span>
                              <span className="text-[10px] text-zinc-600 truncate">
                                {slot.desc}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right: Captaincy buttons */}
                        {player && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                if (viewingTeam === 1) {
                                  setP1CapId(player.id);
                                  if (p1VcId === player.id) setP1VcId(null);
                                } else {
                                  setP2CapId(player.id);
                                  if (p2VcId === player.id) setP2VcId(null);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-sports font-bold cursor-pointer transition-colors border ${
                                isCap
                                  ? 'bg-amber-500 text-black border-amber-400 font-black'
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-amber-300'
                              }`}
                              title="Set as Captain (2.0x points)"
                            >
                              C
                            </button>
                            <button
                              onClick={() => {
                                if (viewingTeam === 1) {
                                  setP1VcId(player.id);
                                  if (p1CapId === player.id) setP1CapId(null);
                                } else {
                                  setP2VcId(player.id);
                                  if (p2CapId === player.id) setP2CapId(null);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-sports font-bold cursor-pointer transition-colors border ${
                                isVc
                                  ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-cyan-300'
                              }`}
                              title="Set as Vice-Captain (1.5x points)"
                            >
                              VC
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Head-to-Head Live Match Arena */
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-3.5 sm:gap-4">
          {/* Match Score Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4 shadow-xl">
            {/* Toss & Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-zinc-800 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-sports">
                  Matchday Broadcast
                </h2>
              </div>
              <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                {matchResult.toss.text}
              </span>
            </div>

            {/* Big Scoreboards Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
              {/* Team 1 Score Card */}
              <div
                className={`rounded-2xl border p-3.5 sm:p-4 flex items-center justify-between ${
                  matchResult.winnerNumber === 1
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-blue-950/50 shadow-lg'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-sports font-bold text-xs sm:text-sm text-white">
                      {p1Name}
                    </span>
                    {matchResult.winnerNumber === 1 && (
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold font-sports bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        WINNER
                      </span>
                    )}
                  </div>
                  <span className="text-xl sm:text-2xl font-sports font-black text-white mt-0.5 sm:mt-1 block">
                    {matchResult.team1.score}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 block font-sports">
                    FANTASY PTS
                  </span>
                  <span className="text-sm sm:text-base font-sports font-black text-emerald-400">
                    {matchResult.team1.totalFantasy} pts
                  </span>
                </div>
              </div>

              {/* Team 2 Score Card */}
              <div
                className={`rounded-2xl border p-3.5 sm:p-4 flex items-center justify-between ${
                  matchResult.winnerNumber === 2
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-amber-950/50 shadow-lg'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-sports font-bold text-xs sm:text-sm text-white">
                      {p2Name}
                    </span>
                    {matchResult.winnerNumber === 2 && (
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold font-sports bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        WINNER
                      </span>
                    )}
                  </div>
                  <span className="text-xl sm:text-2xl font-sports font-black text-white mt-0.5 sm:mt-1 block">
                    {matchResult.team2.score}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 block font-sports">
                    FANTASY PTS
                  </span>
                  <span className="text-sm sm:text-base font-sports font-black text-emerald-400">
                    {matchResult.team2.totalFantasy} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Victory Headline */}
            <div className="text-center py-2 bg-zinc-950 border border-zinc-800 rounded-xl">
              <span className="text-xs sm:text-sm font-sports font-bold text-amber-300">
                🏆 {matchResult.marginText}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 sm:p-2 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('SCORECARD')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-sports font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'SCORECARD'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Scorecards
              </button>
              <button
                onClick={() => setActiveTab('COMMENTARY')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-sports font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'COMMENTARY'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Ball Feed
              </button>
              <button
                onClick={() => setActiveTab('FANTASY')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-sports font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'FANTASY'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Fantasy
              </button>
            </div>

            <button
              onClick={() => setIsSimulatingMatch(false)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] sm:text-xs font-medium border border-zinc-700 cursor-pointer shrink-0"
            >
              Back to Draft
            </button>
          </div>

          {/* Tab 1: Full Scorecards */}
          {activeTab === 'SCORECARD' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Innings 1 Scorecard */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-200 uppercase font-sports truncate">
                    1st Innings: {matchResult.innings1.battingTeamName}
                  </span>
                  <span className="text-xs font-sports font-black text-white shrink-0 ml-2">
                    {matchResult.innings1.scoreFormatted}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[280px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-sports text-[11px]">
                        <th className="py-1">Batter</th>
                        <th className="py-1 text-right">R</th>
                        <th className="py-1 text-right">B</th>
                        <th className="py-1 text-right">4s</th>
                        <th className="py-1 text-right">6s</th>
                        <th className="py-1 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 font-mono text-[11px]">
                      {matchResult.innings1.batters.map((b, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/20">
                          <td className="py-1.5 font-sans font-medium text-zinc-300">
                            <span className="truncate block max-w-[120px]">{b.player.name}</span>
                            <span className="text-[9px] text-zinc-500 block font-normal truncate">
                              {b.isOut ? b.dismissal : 'not out'}
                            </span>
                          </td>
                          <td className="py-1.5 text-right font-bold text-white">{b.runs}</td>
                          <td className="py-1.5 text-right text-zinc-400">{b.ballsFaced}</td>
                          <td className="py-1.5 text-right text-zinc-400">{b.fours}</td>
                          <td className="py-1.5 text-right text-zinc-400">{b.sixes}</td>
                          <td className="py-1.5 text-right text-zinc-400">
                            {b.ballsFaced > 0 ? ((b.runs / b.ballsFaced) * 100).toFixed(0) : '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Innings 2 Scorecard */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-200 uppercase font-sports truncate">
                    2nd Innings: {matchResult.innings2.battingTeamName}
                  </span>
                  <span className="text-xs font-sports font-black text-white shrink-0 ml-2">
                    {matchResult.innings2.scoreFormatted}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[280px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-sports text-[11px]">
                        <th className="py-1">Batter</th>
                        <th className="py-1 text-right">R</th>
                        <th className="py-1 text-right">B</th>
                        <th className="py-1 text-right">4s</th>
                        <th className="py-1 text-right">6s</th>
                        <th className="py-1 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 font-mono text-[11px]">
                      {matchResult.innings2.batters.map((b, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/20">
                          <td className="py-1.5 font-sans font-medium text-zinc-300">
                            <span className="truncate block max-w-[120px]">{b.player.name}</span>
                            <span className="text-[9px] text-zinc-500 block font-normal truncate">
                              {b.isOut ? b.dismissal : 'not out'}
                            </span>
                          </td>
                          <td className="py-1.5 text-right font-bold text-white">{b.runs}</td>
                          <td className="py-1.5 text-right text-zinc-400">{b.ballsFaced}</td>
                          <td className="py-1.5 text-right text-zinc-400">{b.fours}</td>
                          <td className="py-1.5 text-right text-zinc-400">{b.sixes}</td>
                          <td className="py-1.5 text-right text-zinc-400">
                            {b.ballsFaced > 0 ? ((b.runs / b.ballsFaced) * 100).toFixed(0) : '0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Commentary Feed */}
          {activeTab === 'COMMENTARY' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-sports">
                Live Broadcast Log
              </span>
              <div className="flex flex-col divide-y divide-zinc-800">
                {[...matchResult.innings2.events, ...matchResult.innings1.events].map((ev, idx) => (
                  <div key={idx} className="py-2 flex items-start gap-2 sm:gap-3 text-xs">
                    <span className="font-mono font-bold text-emerald-400 shrink-0 w-8 sm:w-10 text-[11px]">
                      {ev.over}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-zinc-200 text-xs">{ev.commentary}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 truncate">
                        {ev.strikerName} vs {ev.bowlerName} • {ev.totalRuns}/{ev.wickets}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Fantasy Breakdown */}
          {activeTab === 'FANTASY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-300 font-sports uppercase truncate">
                  {p1Name} Fantasy ({matchResult.team1.totalFantasy} pts)
                </span>
                <div className="divide-y divide-zinc-800">
                  {matchResult.team1.performers.map((p, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-white truncate block">{p.player.name}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          {p.stats.runs}r, {p.stats.wickets}w
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
                        {p.fantasy.finalPoints} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-300 font-sports uppercase truncate">
                  {p2Name} Fantasy ({matchResult.team2.totalFantasy} pts)
                </span>
                <div className="divide-y divide-zinc-800">
                  {matchResult.team2.performers.map((p, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-white truncate block">{p.player.name}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          {p.stats.runs}r, {p.stats.wickets}w
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
                        {p.fantasy.finalPoints} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Spun Team Player Drawer Modal */}
      {currentSpunTeam && (
        <PlayerDrawer
          team={currentSpunTeam}
          lineup={currentActiveLineup}
          slots={SQUAD_SLOTS}
          onSelectPlayer={handleSelectPlayer}
          onClose={() => setCurrentSpunTeam(null)}
          isProMode={false}
        />
      )}
    </div>
  );
}
