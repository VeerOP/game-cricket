import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  X,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Share2,
  Radio
} from 'lucide-react';
import SlotReelSelector from './SlotReelSelector';
import PlayerDrawer from './PlayerDrawer';
import { SQUAD_SLOTS, ALL_CRICKET_TEAMS, CRICKET_LEAGUES } from '../data/franchises';
import { calculateSquadSynergy, simulateHeadToHeadMatch } from '../engine/simulationEngine';
import { sound } from '../engine/soundEffects';
import confetti from 'canvas-confetti';

// Generate a memorable 6-character match code e.g. CRIC-7842
function generateMatchCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = 'CRIC';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randNum}`;
}

export default function MultiplayerMode({ onExitMultiplayer }) {
  // Lobby Flow State: 'LOBBY_SELECT' | 'HOST_WAITING' | 'JOIN_INPUT' | 'DRAFTING' | 'BATTING_ORDER' | 'MATCH_ARENA'
  const [lobbyStep, setLobbyStep] = useState('LOBBY_SELECT');
  const [matchCode, setMatchCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // Manager profiles
  const [myRole, setMyRole] = useState('P1'); // 'P1' (Host), 'P2' (Challenger), or 'LOCAL_BOTH'
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
  const [liveOverIndex, setLiveOverIndex] = useState(0);

  // Broadcast Channel for live multi-tab syncing
  const broadcastRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastRef.current = new BroadcastChannel('cricket_h2h_match_channel');
        broadcastRef.current.onmessage = (event) => {
          const { type, data, code } = event.data;
          if (code && matchCode && code !== matchCode) return;

          if (type === 'PLAYER_JOINED') {
            setP2Name(data.p2Name || 'Challenger');
            setLobbyStep('DRAFTING');
            sound.playVictory();
          } else if (type === 'DRAFT_UPDATE') {
            setP1Lineup(data.p1Lineup || {});
            setP2Lineup(data.p2Lineup || {});
            setP1CapId(data.p1CapId);
            setP1VcId(data.p1VcId);
            setP2CapId(data.p2CapId);
            setP2VcId(data.p2VcId);
            setActiveTurn(data.activeTurn);
            setDraftRound(data.draftRound);
            if (data.isComplete) {
              setLobbyStep('BATTING_ORDER');
            }
          } else if (type === 'START_MATCH') {
            setMatchResult(data.matchResult);
            setIsSimulatingMatch(true);
            setLobbyStep('MATCH_ARENA');
          }
        };
      }
    } catch {
      // Fallback if BroadcastChannel not supported
    }

    return () => {
      if (broadcastRef.current) {
        broadcastRef.current.close();
      }
    };
  }, [matchCode]);

  const filteredTeams = useMemo(() => {
    return activeLeague === 'ALL_STARS'
      ? ALL_CRICKET_TEAMS
      : ALL_CRICKET_TEAMS.filter(t => t.league === activeLeague);
  }, [activeLeague]);

  const p1Count = Object.values(p1Lineup).filter(Boolean).length;
  const p2Count = Object.values(p2Lineup).filter(Boolean).length;
  const isDraftComplete = p1Count === 11 && p2Count === 11;

  const p1Synergy = calculateSquadSynergy(p1Lineup, p1CapId, p1VcId);
  const p2Synergy = calculateSquadSynergy(p2Lineup, p2CapId, p2VcId);

  // Host a new match with code
  const handleHostMatch = () => {
    const code = generateMatchCode();
    setMatchCode(code);
    setMyRole('P1');

    // Save room in localStorage
    const roomData = {
      code,
      hostName: p1Name,
      league: activeLeague,
      status: 'WAITING',
      createdAt: Date.now()
    };
    try {
      localStorage.setItem(`cric_room_${code}`, JSON.stringify(roomData));
    } catch {}

    setLobbyStep('HOST_WAITING');
  };

  // Join an existing match via code
  const handleJoinMatch = () => {
    setJoinError('');
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a valid Match Code.');
      return;
    }

    try {
      const roomRaw = localStorage.getItem(`cric_room_${cleanCode}`);
      if (!roomRaw) {
        // Fallback simulate finding active room if cross-tab or test
        if (cleanCode.length >= 4) {
          setMatchCode(cleanCode);
          setMyRole('P2');
          setLobbyStep('DRAFTING');
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({
              type: 'PLAYER_JOINED',
              code: cleanCode,
              data: { p2Name }
            });
          }
          return;
        }
        setJoinError('Match code not found. Check with the host and try again.');
        return;
      }

      const room = JSON.parse(roomRaw);
      if (room.status === 'STARTED' || room.status === 'FINISHED') {
        setJoinError('This match is already in progress or completed.');
        return;
      }

      setMatchCode(cleanCode);
      setActiveLeague(room.league || 'ALL_STARS');
      setP1Name(room.hostName || 'Host Manager');
      setMyRole('P2');
      setLobbyStep('DRAFTING');

      // Notify Host via BroadcastChannel
      if (broadcastRef.current) {
        broadcastRef.current.postMessage({
          type: 'PLAYER_JOINED',
          code: cleanCode,
          data: { p2Name }
        });
      }
    } catch {
      setJoinError('Failed to join room. Please check code.');
    }
  };

  const handleCopyCode = () => {
    if (!matchCode) return;
    navigator.clipboard.writeText(matchCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Handle Slot Reel Landed
  const handleSpinComplete = (team) => {
    setCurrentSpunTeam(team);
  };

  // Handle Player Selected into active manager's lineup
  const handleSelectPlayer = (player, slotId) => {
    let nextP1Lineup = { ...p1Lineup };
    let nextP2Lineup = { ...p2Lineup };
    let nextP1Cap = p1CapId;
    let nextP1Vc = p1VcId;
    let nextP2Cap = p2CapId;
    let nextP2Vc = p2VcId;
    let nextTurn = activeTurn;
    let nextRound = draftRound;

    if (activeTurn === 1) {
      nextP1Lineup[slotId] = player;
      if (!nextP1Cap) nextP1Cap = player.id;
      else if (!nextP1Vc && nextP1Cap !== player.id) nextP1Vc = player.id;

      setP1Lineup(nextP1Lineup);
      setP1CapId(nextP1Cap);
      setP1VcId(nextP1Vc);

      nextTurn = 2;
      setActiveTurn(2);
      setViewingTeam(2);
    } else {
      nextP2Lineup[slotId] = player;
      if (!nextP2Cap) nextP2Cap = player.id;
      else if (!nextP2Vc && nextP2Cap !== player.id) nextP2Vc = player.id;

      setP2Lineup(nextP2Lineup);
      setP2CapId(nextP2Cap);
      setP2VcId(nextP2Vc);

      nextRound = draftRound + 1;
      setDraftRound(nextRound);
      nextTurn = 1;
      setActiveTurn(1);
      setViewingTeam(1);
    }

    setCurrentSpunTeam(null);

    const isFinished = Object.values(nextP1Lineup).filter(Boolean).length === 11 &&
                       Object.values(nextP2Lineup).filter(Boolean).length === 11;

    if (isFinished) {
      setLobbyStep('BATTING_ORDER');
    }

    // Broadcast draft update
    if (broadcastRef.current && matchCode) {
      broadcastRef.current.postMessage({
        type: 'DRAFT_UPDATE',
        code: matchCode,
        data: {
          p1Lineup: nextP1Lineup,
          p2Lineup: nextP2Lineup,
          p1CapId: nextP1Cap,
          p1VcId: nextP1Vc,
          p2CapId: nextP2Cap,
          p2VcId: nextP2Vc,
          activeTurn: nextTurn,
          draftRound: nextRound,
          isComplete: isFinished
        }
      });
    }
  };

  // Batting Order adjustments for Player 1
  const handleP1MoveUp = (slotId) => {
    const idx = SQUAD_SLOTS.findIndex(s => s.id === slotId);
    if (idx <= 0) return;
    const prevSlotId = SQUAD_SLOTS[idx - 1].id;
    setP1Lineup(prev => {
      const copy = { ...prev };
      const temp = copy[slotId];
      copy[slotId] = copy[prevSlotId];
      copy[prevSlotId] = temp;
      return copy;
    });
  };

  const handleP1MoveDown = (slotId) => {
    const idx = SQUAD_SLOTS.findIndex(s => s.id === slotId);
    if (idx >= 10) return;
    const nextSlotId = SQUAD_SLOTS[idx + 1].id;
    setP1Lineup(prev => {
      const copy = { ...prev };
      const temp = copy[slotId];
      copy[slotId] = copy[nextSlotId];
      copy[nextSlotId] = temp;
      return copy;
    });
  };

  // Batting Order adjustments for Player 2
  const handleP2MoveUp = (slotId) => {
    const idx = SQUAD_SLOTS.findIndex(s => s.id === slotId);
    if (idx <= 0) return;
    const prevSlotId = SQUAD_SLOTS[idx - 1].id;
    setP2Lineup(prev => {
      const copy = { ...prev };
      const temp = copy[slotId];
      copy[slotId] = copy[prevSlotId];
      copy[prevSlotId] = temp;
      return copy;
    });
  };

  const handleP2MoveDown = (slotId) => {
    const idx = SQUAD_SLOTS.findIndex(s => s.id === slotId);
    if (idx >= 10) return;
    const nextSlotId = SQUAD_SLOTS[idx + 1].id;
    setP2Lineup(prev => {
      const copy = { ...prev };
      const temp = copy[slotId];
      copy[slotId] = copy[nextSlotId];
      copy[nextSlotId] = temp;
      return copy;
    });
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
    setLobbyStep('MATCH_ARENA');

    if (broadcastRef.current && matchCode) {
      broadcastRef.current.postMessage({
        type: 'START_MATCH',
        code: matchCode,
        data: { matchResult: result }
      });
    }

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleResetMultiplayer = () => {
    if (!window.confirm('Reset the multiplayer match?')) return;
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
    setLobbyStep('LOBBY_SELECT');
    setMatchCode('');
    setInputCode('');
  };

  // ================= RENDER 1: LOBBY SELECT & JOIN CODES =================
  if (lobbyStep === 'LOBBY_SELECT') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
        {/* Top Bar */}
        <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-sports font-bold text-sm">
                PvP
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight font-sports">
                  Head-to-Head Multiplayer Arena
                </h1>
                <p className="text-xs text-zinc-400">
                  Challenge your friends with unique Match Codes or Pass-and-Play
                </p>
              </div>
            </div>

            <button
              onClick={onExitMultiplayer}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 transition-colors cursor-pointer"
            >
              Back to Solo
            </button>
          </div>
        </header>

        {/* Main Lobby Selection Cards */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center gap-6">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-sports uppercase tracking-tight">
              Create or Join a Cricket Clash
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Select your tournament format, draft 11 legendary cricketers turn-by-turn, set your batting order, and battle in a live 20-over match.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Host a Match */}
            <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-sports uppercase">
                  Host New Match
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Create a match room, choose tournament league, and get a shareable Match Code for your opponent.
                </p>

                {/* Host Options */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Your Manager Name
                    </label>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      placeholder="e.g. Captain Rohit"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Tournament League
                    </label>
                    <select
                      value={activeLeague}
                      onChange={(e) => setActiveLeague(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:border-amber-400 focus:outline-none"
                    >
                      {CRICKET_LEAGUES.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleHostMatch}
                className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-sports uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Create Match & Get Code</span>
              </button>
            </div>

            {/* Card 2: Join with Match Code */}
            <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-sports uppercase">
                  Join with Match Code
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Got a challenge from a friend? Enter their 6-character match code to enter the draft lobby.
                </p>

                {/* Join Inputs */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Match Code
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value.toUpperCase());
                        setJoinError('');
                      }}
                      placeholder="e.g. CRIC-7842"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono uppercase tracking-wider focus:border-sky-400 focus:outline-none text-center font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Your Challenger Name
                    </label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      placeholder="e.g. King Kohli"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  {joinError && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleJoinMatch}
                className="mt-6 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold font-sports uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Join Match Room</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= RENDER 2: HOST WAITING LOBBY =================
  if (lobbyStep === 'HOST_WAITING') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
        <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="font-sports font-bold text-sm text-white">Match Lobby</span>
            <button
              onClick={() => setLobbyStep('LOBBY_SELECT')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 flex flex-col justify-center items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
            <Radio className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white font-sports uppercase tracking-tight">
              Match Room Ready
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Share this Match Code with your friend to start drafting
            </p>
          </div>

          {/* Match Code Banner */}
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center gap-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-sports">
              Match Room Code
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-400 bg-zinc-950 px-6 py-3 rounded-xl border border-zinc-800 select-all">
              {matchCode}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isCopiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedCode ? 'Copied to Clipboard!' : 'Copy Match Code'}</span>
            </button>
          </div>

          {/* Waiting animation or local single-device bypass */}
          <div className="w-full flex flex-col gap-2.5">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Waiting for Challenger to enter code...</span>
            </div>

            <button
              onClick={() => {
                setMyRole('LOCAL_BOTH');
                setLobbyStep('DRAFTING');
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Play on this Device (Pass-and-Play)
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ================= RENDER 3: PRE-MATCH BATTING ORDER MANAGEMENT =================
  if (lobbyStep === 'BATTING_ORDER') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
        <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-amber-400" />
              <span className="font-sports font-bold text-sm text-white uppercase">
                Tactical Batting Order Strategy
              </span>
            </div>
            <button
              onClick={handleStartHeadToHead}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sports font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Ready for Match Showdown
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-white font-sports uppercase tracking-tight">
              Arrange Starting Batting Order
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Position 1 is Opening Batter down to Position 11 Strike Bowler. Use the ▲ / ▼ arrows to fine-tune your tactics before the 20-over clash!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player 1 Lineup Order */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <span className="font-sports font-bold text-blue-400 text-sm">{p1Name}'s Batting XI</span>
                <span className="text-xs text-zinc-400 font-sports">OVR {p1Synergy.overallRating}</span>
              </div>

              <div className="space-y-1.5">
                {SQUAD_SLOTS.map((slot, idx) => {
                  const p = p1Lineup[slot.id];
                  return (
                    <div
                      key={slot.id}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-zinc-800 text-amber-400 font-sports font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white truncate">{p?.name || 'Empty'}</span>
                        {p?.isOverseas && <span className="text-[9px] px-1 bg-zinc-800 text-sky-300 rounded">OS</span>}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleP1MoveUp(slot.id)}
                          disabled={idx === 0}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleP1MoveDown(slot.id)}
                          disabled={idx === 10}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player 2 Lineup Order */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <span className="font-sports font-bold text-amber-400 text-sm">{p2Name}'s Batting XI</span>
                <span className="text-xs text-zinc-400 font-sports">OVR {p2Synergy.overallRating}</span>
              </div>

              <div className="space-y-1.5">
                {SQUAD_SLOTS.map((slot, idx) => {
                  const p = p2Lineup[slot.id];
                  return (
                    <div
                      key={slot.id}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-zinc-800 text-amber-400 font-sports font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white truncate">{p?.name || 'Empty'}</span>
                        {p?.isOverseas && <span className="text-[9px] px-1 bg-zinc-800 text-sky-300 rounded">OS</span>}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleP2MoveUp(slot.id)}
                          disabled={idx === 0}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleP2MoveDown(slot.id)}
                          disabled={idx === 10}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <button
              onClick={handleStartHeadToHead}
              className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sports font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-xl flex items-center gap-2"
            >
              <Swords className="w-5 h-5" />
              <span>Launch 20-Over Head-to-Head Simulation</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ================= RENDER 4: MAIN DRAFTING INTERFACE =================
  if (!isSimulatingMatch) {
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
                  {matchCode && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      ROOM: {matchCode}
                    </span>
                  )}
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
                Exit
              </button>
            </div>
          </div>
        </header>

        {/* Main Drafting Interface */}
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
                    ? 'Both Starting XIs are locked! Ready for Batting Order Strategy!'
                    : `Spin reel for Pick ${activeTurn === 1 ? p1Count + 1 : p2Count + 1} (${activeTurn === 1 ? p1Name : p2Name})`}
                </h3>
              </div>
            </div>

            {/* Ready to Fight CTA */}
            {isDraftComplete && (
              <button
                onClick={() => setLobbyStep('BATTING_ORDER')}
                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sports font-black text-xs uppercase tracking-wider border border-emerald-400 shadow-lg shadow-emerald-950/80 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Adjust Batting Orders</span>
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
            </div>

            {/* Right: Dual Lineup Pitch Cards */}
            <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-4">
              {/* Pitch Switcher Tabs */}
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-2 gap-2">
                <button
                  onClick={() => setViewingTeam(1)}
                  className={`flex-1 py-2 px-3 rounded-xl font-sports text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    viewingTeam === 1
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{p1Name} ({p1Count}/11)</span>
                  <span className="text-[10px] opacity-80">OVR {p1Synergy.overallRating}</span>
                </button>

                <button
                  onClick={() => setViewingTeam(2)}
                  className={`flex-1 py-2 px-3 rounded-xl font-sports text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    viewingTeam === 2
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{p2Name} ({p2Count}/11)</span>
                  <span className="text-[10px] opacity-80">OVR {p2Synergy.overallRating}</span>
                </button>
              </div>

              {/* Display Viewing Lineup Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                {SQUAD_SLOTS.map((slot, index) => {
                  const lineupToView = viewingTeam === 1 ? p1Lineup : p2Lineup;
                  const player = lineupToView[slot.id];

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-xl p-3 border transition-all flex flex-col justify-between min-h-[120px] ${
                        player
                          ? 'bg-zinc-900/90 border-zinc-800 shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-800/80 border-dashed'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/60">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-zinc-800 text-zinc-400 font-sports font-bold text-[9px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider font-sports uppercase truncate">
                            {slot.posCode}
                          </span>
                        </div>
                      </div>

                      {player ? (
                        <div className="pt-2 flex flex-col justify-between flex-1">
                          <div>
                            <h4 className="font-bold text-xs text-zinc-100 truncate">
                              {player.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                              <span>{player.country}</span>
                              {player.isOverseas && (
                                <span className="text-[9px] px-1 bg-zinc-800 text-sky-300 rounded font-semibold">
                                  OS
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/40 flex items-center justify-between mt-1">
                            <span className="truncate text-zinc-300">{player.role.replace('_', ' ')}</span>
                            <span className="text-amber-400 font-sports font-bold">{player.overall}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <span className="text-xs text-zinc-500 font-medium">{slot.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Player Selection Drawer */}
        {currentSpunTeam && (
          <PlayerDrawer
            team={currentSpunTeam}
            lineup={activeTurn === 1 ? p1Lineup : p2Lineup}
            slots={SQUAD_SLOTS}
            onSelectPlayer={handleSelectPlayer}
            onClose={() => setCurrentSpunTeam(null)}
            isProMode={false}
          />
        )}
      </div>
    );
  }

  // ================= RENDER 5: MATCH SIMULATION SHOWDOWN ARENA =================
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-sports font-black text-sm text-white uppercase">
              Head-to-Head Match Arena
            </span>
          </div>
          <button
            onClick={handleResetMultiplayer}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 transition-colors cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Match Result Banner */}
        {matchResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center shadow-xl">
            <span className="text-xs uppercase font-bold text-amber-400 font-sports tracking-widest block mb-1">
              Match Result
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-sports uppercase tracking-tight">
              {matchResult.marginText}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {matchResult.toss.text}
            </p>

            {/* Score Comparison Display */}
            <div className="grid grid-cols-2 gap-4 my-5 max-w-xl mx-auto">
              <div className={`p-4 rounded-xl border ${
                matchResult.winnerNumber === 1
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-lg'
                  : 'bg-zinc-950 border-zinc-800'
              }`}>
                <span className="text-xs font-bold text-blue-400 uppercase font-sports block">
                  {p1Name}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-sports text-white mt-1">
                  {matchResult.team1.score}
                </div>
                <span className="text-[11px] text-zinc-400">
                  {matchResult.team1.totalFantasy} Fantasy Points
                </span>
              </div>

              <div className={`p-4 rounded-xl border ${
                matchResult.winnerNumber === 2
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-lg'
                  : 'bg-zinc-950 border-zinc-800'
              }`}>
                <span className="text-xs font-bold text-amber-400 uppercase font-sports block">
                  {p2Name}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-sports text-white mt-1">
                  {matchResult.team2.score}
                </div>
                <span className="text-[11px] text-zinc-400">
                  {matchResult.team2.totalFantasy} Fantasy Points
                </span>
              </div>
            </div>

            {/* Match MVP Award */}
            {matchResult.matchMVP && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-400">Player of the Match:</span>
                <strong className="text-amber-300 font-sports font-bold">{matchResult.matchMVP.player.name}</strong>
                <span className="text-zinc-500 font-medium">({matchResult.matchMVP.fantasy.finalPoints} pts)</span>
              </div>
            )}
          </div>
        )}

        {/* Detailed Dual Scorecards */}
        {matchResult && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-white font-sports uppercase mb-3">
              Full Match Scorecard
            </h3>

            {/* Innings 1 */}
            <div className="mb-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-sports font-bold text-xs text-zinc-200">
                  1st Innings: {matchResult.innings1.battingTeamName} ({matchResult.innings1.scoreFormatted})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[340px] mt-2">
                  <thead>
                    <tr className="text-zinc-500 font-sports border-b border-zinc-800/80">
                      <th className="py-1">Batter</th>
                      <th className="py-1">Dismissal</th>
                      <th className="py-1 text-right">R</th>
                      <th className="py-1 text-right">B</th>
                      <th className="py-1 text-right">4s</th>
                      <th className="py-1 text-right">6s</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {matchResult.innings1.batters.map((b, idx) => (
                      <tr key={idx} className="text-zinc-300">
                        <td className="py-1 font-medium">{b.player.name}</td>
                        <td className="py-1 text-zinc-500 text-[11px]">{b.dismissal}</td>
                        <td className="py-1 text-right font-bold text-white">{b.runs}</td>
                        <td className="py-1 text-right text-zinc-400">{b.ballsFaced}</td>
                        <td className="py-1 text-right text-zinc-400">{b.fours}</td>
                        <td className="py-1 text-right text-zinc-400">{b.sixes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Innings 2 */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-sports font-bold text-xs text-zinc-200">
                  2nd Innings: {matchResult.innings2.battingTeamName} ({matchResult.innings2.scoreFormatted})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[340px] mt-2">
                  <thead>
                    <tr className="text-zinc-500 font-sports border-b border-zinc-800/80">
                      <th className="py-1">Batter</th>
                      <th className="py-1">Dismissal</th>
                      <th className="py-1 text-right">R</th>
                      <th className="py-1 text-right">B</th>
                      <th className="py-1 text-right">4s</th>
                      <th className="py-1 text-right">6s</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {matchResult.innings2.batters.map((b, idx) => (
                      <tr key={idx} className="text-zinc-300">
                        <td className="py-1 font-medium">{b.player.name}</td>
                        <td className="py-1 text-zinc-500 text-[11px]">{b.dismissal}</td>
                        <td className="py-1 text-right font-bold text-white">{b.runs}</td>
                        <td className="py-1 text-right text-zinc-400">{b.ballsFaced}</td>
                        <td className="py-1 text-right text-zinc-400">{b.fours}</td>
                        <td className="py-1 text-right text-zinc-400">{b.sixes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
