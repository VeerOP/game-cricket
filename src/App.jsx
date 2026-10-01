import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PitchBoard from './components/PitchBoard';
import SlotReelSelector from './components/SlotReelSelector';
import PlayerDrawer from './components/PlayerDrawer';
import SimulationModal from './components/SimulationModal';
import ResultsSummary from './components/ResultsSummary';
import RulesAndOddsModal from './components/RulesAndOddsModal';
import MultiplayerMode from './components/MultiplayerMode';
import { ALL_CRICKET_TEAMS, SQUAD_SLOTS } from './data/franchises';
import { getFixtureScheduleForMode } from './data/opponents';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [activeLeague, setActiveLeague] = useState('ALL_STARS');
  const [isProMode, setIsProMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);

  // Single-player squad state
  const [lineup, setLineup] = useState({});
  const [captainId, setCaptainId] = useState(null);
  const [viceCaptainId, setViceCaptainId] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestRecord, setBestRecord] = useState('0-0');
  const [impactSubAvailable, setImpactSubAvailable] = useState(true);

  // Reel & Draft states
  const [isSpinning, setIsSpinning] = useState(false);
  const [spunTeam, setSpunTeam] = useState(null);
  const [draftHistory, setDraftHistory] = useState([]);

  // Simulation & Modals
  const [isSimulating, setIsSimulating] = useState(false);
  const [seasonResults, setSeasonResults] = useState(null);
  const [totalFantasyPoints, setTotalFantasyPoints] = useState(0);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    const savedBest = localStorage.getItem('invincibles_best_record');
    if (savedBest) setBestRecord(savedBest);
    const savedStreak = localStorage.getItem('invincibles_streak');
    if (savedStreak) setCurrentStreak(Number(savedStreak));
  }, []);

  const filteredTeams = useMemo(() => {
    return activeLeague === 'ALL_STARS'
      ? ALL_CRICKET_TEAMS
      : ALL_CRICKET_TEAMS.filter(t => t.league === activeLeague);
  }, [activeLeague]);

  const currentFixtures = useMemo(() => {
    return getFixtureScheduleForMode(activeLeague);
  }, [activeLeague]);

  const handleSpinComplete = (team) => {
    setSpunTeam(team);
    setDraftHistory(prev => [team, ...prev]);
  };

  const handleSelectPlayer = (player, slotId) => {
    setLineup(prev => ({ ...prev, [slotId]: player }));

    if (!captainId) {
      setCaptainId(player.id);
    } else if (!viceCaptainId && captainId !== player.id) {
      setViceCaptainId(player.id);
    }

    setSpunTeam(null);
  };

  const handleRemovePlayer = (slotId) => {
    const removedPlayer = lineup[slotId];
    if (removedPlayer) {
      if (captainId === removedPlayer.id) setCaptainId(null);
      if (viceCaptainId === removedPlayer.id) setViceCaptainId(null);
    }
    setLineup(prev => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  const handleTriggerImpactSub = () => {
    if (!impactSubAvailable) return;
    setImpactSubAvailable(false);
    const randomTeam = filteredTeams[Math.floor(Math.random() * filteredTeams.length)];
    setSpunTeam(randomTeam);
  };

  const handleResetSquad = () => {
    if (Object.keys(lineup).length > 0 && !window.confirm('Reset current squad draft?')) {
      return;
    }
    setLineup({});
    setCaptainId(null);
    setViceCaptainId(null);
    setSpunTeam(null);
    setImpactSubAvailable(true);
  };

  const handleLeagueChange = (newLeague) => {
    if (Object.keys(lineup).length > 0) {
      if (!window.confirm('Switching tournament mode will reset your current draft. Continue?')) return;
    }
    setActiveLeague(newLeague);
    setLineup({});
    setCaptainId(null);
    setViceCaptainId(null);
    setSpunTeam(null);
    setImpactSubAvailable(true);
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
  };

  const handleCompleteSeason = (results, fantasyPoints) => {
    setIsSimulating(false);
    setSeasonResults(results);
    setTotalFantasyPoints(fantasyPoints);

    const wins = results.filter(r => r.isWin).length;
    const losses = results.filter(r => !r.isWin).length;
    const totalMatchCount = results.length;
    const currentRunRecord = `${wins}-${losses}`;

    if (wins === totalMatchCount) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      localStorage.setItem('invincibles_streak', newStreak);
      setBestRecord(`${totalMatchCount}-0`);
      localStorage.setItem('invincibles_best_record', `${totalMatchCount}-0`);
    } else {
      setCurrentStreak(0);
      localStorage.setItem('invincibles_streak', 0);
      const [bestWins] = bestRecord.split('-').map(Number);
      if (isNaN(bestWins) || wins > bestWins) {
        setBestRecord(currentRunRecord);
        localStorage.setItem('invincibles_best_record', currentRunRecord);
      }
    }
  };

  const handleResetSeason = () => {
    setSeasonResults(null);
    setLineup({});
    setCaptainId(null);
    setViceCaptainId(null);
    setSpunTeam(null);
    setImpactSubAvailable(true);
  };

  const activePicksCount = Object.values(lineup).filter(Boolean).length;

  if (isMultiplayer) {
    return (
      <MultiplayerMode
        onExitMultiplayer={() => setIsMultiplayer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Top Navbar */}
      <Header
        activeLeague={activeLeague}
        setActiveLeague={handleLeagueChange}
        isProMode={isProMode}
        setIsProMode={setIsProMode}
        bestRecord={bestRecord}
        currentStreak={currentStreak}
        onOpenRules={() => setShowRulesModal(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isMultiplayer={isMultiplayer}
        setIsMultiplayer={setIsMultiplayer}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Sub-header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{activeLeague === 'ALL_STARS' ? 'Global Cricket Draft' : activeLeague.replace('_', ' ')}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal">
                {currentFixtures.length} Matches Schedule
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Roll the mechanical slot reel to draw an era. Pick 1 player into your 11. Max 4 Overseas, Captain (2.0x), VC (1.5x).
            </p>
          </div>

          <button
            onClick={handleResetSquad}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>

        {/* Layout Grid: Slot Reel + Tactical Pitch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Reel Container */}
          <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sports">
                Draft Reel
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                Pick {activePicksCount + 1} of 11
              </span>
            </div>

            <SlotReelSelector
              teams={filteredTeams}
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              disabled={activePicksCount === 11}
              currentPickNumber={activePicksCount + 1}
              totalPicks={11}
            />

            {/* Recent Eras History */}
            {draftHistory.length > 0 && (
              <div className="w-full mt-3 pt-2.5 border-t border-zinc-800 text-left">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5 font-sports">
                  Recent Drawn Eras
                </span>
                <div className="flex flex-wrap gap-1">
                  {draftHistory.slice(0, 5).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-950 border border-zinc-800 text-zinc-300"
                    >
                      {t.shortName} '{t.year.slice(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tactical Pitch Board */}
          <div className="lg:col-span-8 flex flex-col">
            <PitchBoard
              lineup={lineup}
              slots={SQUAD_SLOTS}
              captainId={captainId}
              setCaptainId={setCaptainId}
              viceCaptainId={viceCaptainId}
              setViceCaptainId={setViceCaptainId}
              onRemovePlayer={handleRemovePlayer}
              onStartSimulation={handleStartSimulation}
              onTriggerImpactSub={handleTriggerImpactSub}
              impactSubAvailable={impactSubAvailable}
              isProMode={isProMode}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {spunTeam && (
        <PlayerDrawer
          team={spunTeam}
          lineup={lineup}
          slots={SQUAD_SLOTS}
          onSelectPlayer={handleSelectPlayer}
          onClose={() => setSpunTeam(null)}
          isProMode={isProMode}
        />
      )}

      {isSimulating && (
        <SimulationModal
          lineup={lineup}
          captainId={captainId}
          viceCaptainId={viceCaptainId}
          fixtures={currentFixtures}
          onCompleteSeason={handleCompleteSeason}
          onClose={() => setIsSimulating(false)}
        />
      )}

      {seasonResults && (
        <ResultsSummary
          matchResults={seasonResults}
          totalFantasyPoints={totalFantasyPoints}
          lineup={lineup}
          captainId={captainId}
          viceCaptainId={viceCaptainId}
          onResetSeason={handleResetSeason}
        />
      )}

      {showRulesModal && (
        <RulesAndOddsModal onClose={() => setShowRulesModal(false)} />
      )}
    </div>
  );
}
