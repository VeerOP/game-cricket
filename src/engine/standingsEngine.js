// Season Qualifiers & Tournament Standings Engine
// Generates, simulates and updates realistic Cricket League Points Tables and Playoff Brackets

import { getFixtureScheduleForMode } from '../data/opponents.js';

// Map each tournament mode to its genuine participating teams
export const TOURNAMENT_LEAGUE_TEAMS = {
  IPL: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 92, bowlPower: 92 },
    { id: 'csk', name: 'Chennai Super Kings', shortName: 'CSK', isUser: false, color: '#FDB913', themeColor: '#00539C', batPower: 92, bowlPower: 94 },
    { id: 'mi', name: 'Mumbai Indians', shortName: 'MI', isUser: false, color: '#004BA0', themeColor: '#D1AB3E', batPower: 96, bowlPower: 94 },
    { id: 'kkr', name: 'Kolkata Knight Riders', shortName: 'KKR', isUser: false, color: '#3A225D', themeColor: '#FFD700', batPower: 95, bowlPower: 93 },
    { id: 'srh', name: 'Sunrisers Hyderabad', shortName: 'SRH', isUser: false, color: '#FF822A', themeColor: '#000000', batPower: 98, bowlPower: 90 },
    { id: 'gt', name: 'Gujarat Titans', shortName: 'GT', isUser: false, color: '#1B2133', themeColor: '#BE9F58', batPower: 90, bowlPower: 92 },
    { id: 'rr', name: 'Rajasthan Royals', shortName: 'RR', isUser: false, color: '#254AA5', themeColor: '#FF69B4', batPower: 92, bowlPower: 91 },
    { id: 'rcb', name: 'Royal Challengers Bengaluru', shortName: 'RCB', isUser: false, color: '#EC1C24', themeColor: '#000000', batPower: 96, bowlPower: 88 },
    { id: 'dc', name: 'Delhi Capitals', shortName: 'DC', isUser: false, color: '#004C97', themeColor: '#EF3E42', batPower: 90, bowlPower: 89 },
    { id: 'lsg', name: 'Lucknow Super Giants', shortName: 'LSG', isUser: false, color: '#0057E7', themeColor: '#FF7700', batPower: 88, bowlPower: 91 }
  ],
  PSL: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 92, bowlPower: 92 },
    { id: 'lq', name: 'Lahore Qalandars', shortName: 'LQ', isUser: false, color: '#00A859', themeColor: '#E4002B', batPower: 92, bowlPower: 97 },
    { id: 'iu', name: 'Islamabad United', shortName: 'IU', isUser: false, color: '#DF1B24', themeColor: '#F58220', batPower: 95, bowlPower: 92 },
    { id: 'pz', name: 'Peshawar Zalmi', shortName: 'PZ', isUser: false, color: '#FFD100', themeColor: '#002B49', batPower: 95, bowlPower: 89 },
    { id: 'ms', name: 'Multan Sultans', shortName: 'MS', isUser: false, color: '#0A3B32', themeColor: '#C49A45', batPower: 94, bowlPower: 94 },
    { id: 'kk', name: 'Karachi Kings', shortName: 'KK', isUser: false, color: '#004BA0', themeColor: '#C8102E', batPower: 88, bowlPower: 90 },
    { id: 'qg', name: 'Quetta Gladiators', shortName: 'QG', isUser: false, color: '#4B0082', themeColor: '#FFD700', batPower: 91, bowlPower: 91 }
  ],
  SA20: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 92, bowlPower: 92 },
    { id: 'sec', name: 'Sunrisers Eastern Cape', shortName: 'SEC', isUser: false, color: '#FF6600', themeColor: '#000000', batPower: 93, bowlPower: 96 },
    { id: 'pc', name: 'Pretoria Capitals', shortName: 'PC', isUser: false, color: '#002B49', themeColor: '#00A3E0', batPower: 95, bowlPower: 94 },
    { id: 'dsg', name: 'Durban\'s Super Giants', shortName: 'DSG', isUser: false, color: '#005BA6', themeColor: '#FF6600', batPower: 98, bowlPower: 92 },
    { id: 'mict', name: 'MI Cape Town', shortName: 'MICT', isUser: false, color: '#004BA0', themeColor: '#D1AB3E', batPower: 94, bowlPower: 94 },
    { id: 'pr', name: 'Paarl Royals', shortName: 'PR', isUser: false, color: '#EA1A7E', themeColor: '#002B49', batPower: 91, bowlPower: 92 },
    { id: 'jsk', name: 'Joburg Super Kings', shortName: 'JSK', isUser: false, color: '#FDB913', themeColor: '#00539C', batPower: 92, bowlPower: 91 }
  ],
  CPL: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 92, bowlPower: 92 },
    { id: 'tkr', name: 'Trinbago Knight Riders', shortName: 'TKR', isUser: false, color: '#7B002C', themeColor: '#FFD700', batPower: 96, bowlPower: 95 },
    { id: 'gaw', name: 'Guyana Amazon Warriors', shortName: 'GAW', isUser: false, color: '#008751', themeColor: '#FFD100', batPower: 94, bowlPower: 96 },
    { id: 'br', name: 'Barbados Royals', shortName: 'BR', isUser: false, color: '#0055A5', themeColor: '#FF69B4', batPower: 92, bowlPower: 91 },
    { id: 'slk', name: 'St Lucia Kings', shortName: 'SLK', isUser: false, color: '#00A3E0', themeColor: '#002B49', batPower: 93, bowlPower: 92 },
    { id: 'abf', name: 'Antigua & Barbuda Falcons', shortName: 'ABF', isUser: false, color: '#FF6600', themeColor: '#000000', batPower: 88, bowlPower: 89 },
    { id: 'jt', name: 'Jamaica Tallawahs', shortName: 'JT', isUser: false, color: '#005A36', themeColor: '#FED100', batPower: 90, bowlPower: 90 }
  ],
  BBL: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 92, bowlPower: 92 },
    { id: 'ps', name: 'Perth Scorchers', shortName: 'PS', isUser: false, color: '#F26522', themeColor: '#000000', batPower: 93, bowlPower: 97 },
    { id: 'sys', name: 'Sydney Sixers', shortName: 'SYS', isUser: false, color: '#D81B60', themeColor: '#002B49', batPower: 94, bowlPower: 94 },
    { id: 'bh', name: 'Brisbane Heat', shortName: 'BH', isUser: false, color: '#009688', themeColor: '#000000', batPower: 93, bowlPower: 93 },
    { id: 'as', name: 'Adelaide Strikers', shortName: 'AS', isUser: false, color: '#0055A5', themeColor: '#FFD700', batPower: 92, bowlPower: 92 },
    { id: 'ms', name: 'Melbourne Stars', shortName: 'MS', isUser: false, color: '#00A859', themeColor: '#000000', batPower: 95, bowlPower: 90 },
    { id: 'syt', name: 'Sydney Thunder', shortName: 'SYT', isUser: false, color: '#76B900', themeColor: '#002B49', batPower: 88, bowlPower: 89 }
  ],
  T20_WC: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 94, bowlPower: 94 },
    { id: 'ind', name: 'India', shortName: 'IND', isUser: false, color: '#0055A5', themeColor: '#FF6600', batPower: 98, bowlPower: 99 },
    { id: 'aus', name: 'Australia', shortName: 'AUS', isUser: false, color: '#FFCD00', themeColor: '#00593B', batPower: 97, bowlPower: 95 },
    { id: 'eng', name: 'England', shortName: 'ENG', isUser: false, color: '#CE1124', themeColor: '#002B49', batPower: 96, bowlPower: 94 },
    { id: 'sa', name: 'South Africa', shortName: 'SA', isUser: false, color: '#007A3D', themeColor: '#FFB81C', batPower: 93, bowlPower: 95 },
    { id: 'pak', name: 'Pakistan', shortName: 'PAK', isUser: false, color: '#006633', themeColor: '#FFFFFF', batPower: 90, bowlPower: 97 },
    { id: 'wi', name: 'West Indies', shortName: 'WI', isUser: false, color: '#7B002C', themeColor: '#FFC72C', batPower: 96, bowlPower: 89 },
    { id: 'afg', name: 'Afghanistan', shortName: 'AFG', isUser: false, color: '#0055A5', themeColor: '#D21034', batPower: 87, bowlPower: 96 }
  ],
  ODI_WC: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 94, bowlPower: 94 },
    { id: 'ind', name: 'India', shortName: 'IND', isUser: false, color: '#0055A5', themeColor: '#FF6600', batPower: 99, bowlPower: 98 },
    { id: 'aus', name: 'Australia', shortName: 'AUS', isUser: false, color: '#00593B', themeColor: '#FFCD00', batPower: 98, bowlPower: 99 },
    { id: 'sa', name: 'South Africa', shortName: 'SA', isUser: false, color: '#007A3D', themeColor: '#FFB81C', batPower: 98, bowlPower: 93 },
    { id: 'nz', name: 'New Zealand', shortName: 'NZ', isUser: false, color: '#000000', themeColor: '#FFFFFF', batPower: 95, bowlPower: 96 },
    { id: 'pak', name: 'Pakistan', shortName: 'PAK', isUser: false, color: '#006633', themeColor: '#FFFFFF', batPower: 92, bowlPower: 96 },
    { id: 'eng', name: 'England', shortName: 'ENG', isUser: false, color: '#CE1124', themeColor: '#002B49', batPower: 96, bowlPower: 93 },
    { id: 'afg', name: 'Afghanistan', shortName: 'AFG', isUser: false, color: '#0055A5', themeColor: '#D21034', batPower: 87, bowlPower: 94 }
  ],
  ALL_STARS: [
    { id: 'user_team', name: 'Your Starting XI', shortName: 'YOU', isUser: true, color: '#10B981', themeColor: '#064E3B', batPower: 94, bowlPower: 94 },
    { id: 'csk', name: 'Chennai Super Kings (2011)', shortName: 'CSK', isUser: false, color: '#FDB913', themeColor: '#00539C', batPower: 92, bowlPower: 94 },
    { id: 'mi', name: 'Mumbai Indians (2020)', shortName: 'MI', isUser: false, color: '#004BA0', themeColor: '#D1AB3E', batPower: 97, bowlPower: 97 },
    { id: 'ps', name: 'Perth Scorchers (2022)', shortName: 'PS', isUser: false, color: '#F26522', themeColor: '#000000', batPower: 93, bowlPower: 96 },
    { id: 'lq', name: 'Lahore Qalandars (2022)', shortName: 'LQ', isUser: false, color: '#00A859', themeColor: '#E4002B', batPower: 93, bowlPower: 97 },
    { id: 'sec', name: 'Sunrisers Eastern Cape (2024)', shortName: 'SEC', isUser: false, color: '#FF6600', themeColor: '#000000', batPower: 93, bowlPower: 95 },
    { id: 'tkr', name: 'Trinbago Knight Riders (2020)', shortName: 'TKR', isUser: false, color: '#7B002C', themeColor: '#FFD700', batPower: 96, bowlPower: 95 },
    { id: 'ind_wc', name: 'India (2024 Champions)', shortName: 'IND', isUser: false, color: '#0055A5', themeColor: '#FF6600', batPower: 99, bowlPower: 99 },
    { id: 'aus_wc', name: 'Australia (2023 Champions)', shortName: 'AUS', isUser: false, color: '#00593B', themeColor: '#FFCD00', batPower: 98, bowlPower: 97 }
  ]
};

// Initialize points table for a new tournament season
export function initializeTournamentStandings(leagueId, userTeamName = 'Your Starting XI') {
  const baseTeams = TOURNAMENT_LEAGUE_TEAMS[leagueId] || TOURNAMENT_LEAGUE_TEAMS.ALL_STARS;

  const standings = baseTeams.map((t, idx) => ({
    teamId: t.id,
    name: t.isUser ? userTeamName : t.name,
    shortName: t.shortName,
    isUser: t.isUser,
    color: t.color,
    themeColor: t.themeColor,
    batPower: t.batPower || 90,
    bowlPower: t.bowlPower || 90,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    runsScored: 0,
    oversFaced: 0,
    runsConceded: 0,
    oversBowled: 0,
    nrr: 0.0,
    nrrFormatted: '+0.000',
    form: [], // last 5 results e.g. ['W', 'L', 'W']
    rank: idx + 1,
    qualificationStatus: 'IN_CONTENTION',
    statusLabel: 'In Contention',
    statusBadgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }));

  return standings;
}

// Helper to simulate a background match between two non-user teams
function simulateLeagueMatch(teamA, teamB) {
  const aBat = teamA.batPower || 90;
  const aBowl = teamA.bowlPower || 90;
  const bBat = teamB.batPower || 90;
  const bBowl = teamB.bowlPower || 90;

  const aRuns = Math.round(155 + (aBat - bBowl) * 1.5 + (Math.random() - 0.5) * 36);
  const bRuns = Math.round(155 + (bBat - aBowl) * 1.5 + (Math.random() - 0.5) * 36);

  const finalARuns = Math.max(120, aRuns);
  const finalBRuns = Math.max(120, bRuns === finalARuns ? finalARuns + (Math.random() > 0.5 ? 1 : -1) : bRuns);

  const teamAWon = finalARuns > finalBRuns;

  return {
    teamA,
    teamB,
    teamARuns: finalARuns,
    teamAOvers: 20.0,
    teamAWickets: Math.floor(4 + Math.random() * 5),
    teamBRuns: finalBRuns,
    teamBOvers: 20.0,
    teamBWickets: Math.floor(4 + Math.random() * 5),
    winnerId: teamAWon ? teamA.teamId : teamB.teamId,
    loserId: teamAWon ? teamB.teamId : teamA.teamId,
    marginText: teamAWon
      ? `${teamA.shortName} won by ${finalARuns - finalBRuns} runs`
      : `${teamB.shortName} won by ${finalBRuns - finalARuns} runs`
  };
}

// Calculate Net Run Rate: (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled)
export function calculateNRR(runsScored, oversFaced, runsConceded, oversBowled) {
  if (oversFaced <= 0 || oversBowled <= 0) return 0.0;
  const forRate = runsScored / oversFaced;
  const againstRate = runsConceded / oversBowled;
  return Number((forRate - againstRate).toFixed(3));
}

export function formatNRR(nrr) {
  if (nrr > 0) return `+${nrr.toFixed(3)}`;
  return nrr.toFixed(3);
}

// Update table after a completed match in the tournament
export function updateTournamentStandingsAfterMatch(
  currentStandings,
  userMatchResult,
  matchIndex,
  leagueId
) {
  const totalMatches = getFixtureScheduleForMode(leagueId).length;
  const totalRounds = totalMatches;
  const currentRound = matchIndex + 1;

  // Clone current standings
  const updated = currentStandings.map(item => ({ ...item, form: [...item.form] }));

  const userTeam = updated.find(t => t.isUser);
  const oppSchedule = userMatchResult.opponent;

  // Match opponent in current standings by shortName or name
  let oppTeam = updated.find(t => t.shortName === oppSchedule.shortName) ||
                updated.find(t => t.name.toLowerCase().includes(oppSchedule.shortName.toLowerCase())) ||
                updated.find(t => !t.isUser && t.played === userTeam.played);

  // Parse user match stats
  const uRuns = userMatchResult.userRuns || 170;
  const uOvers = parseFloat(userMatchResult.userOvers) || 20.0;
  const oRuns = userMatchResult.opponentRuns || 165;
  const oOvers = 20.0;
  const isUserWin = userMatchResult.isWin;

  // Update User Record
  if (userTeam) {
    userTeam.played += 1;
    if (isUserWin) {
      userTeam.won += 1;
      userTeam.points += 2;
      userTeam.form.push('W');
    } else {
      userTeam.lost += 1;
      userTeam.form.push('L');
    }
    userTeam.runsScored += uRuns;
    userTeam.oversFaced += uOvers;
    userTeam.runsConceded += oRuns;
    userTeam.oversBowled += oOvers;
    userTeam.nrr = calculateNRR(userTeam.runsScored, userTeam.oversFaced, userTeam.runsConceded, userTeam.oversBowled);
    userTeam.nrrFormatted = formatNRR(userTeam.nrr);
  }

  // Update Opponent Record
  if (oppTeam) {
    oppTeam.played += 1;
    if (!isUserWin) {
      oppTeam.won += 1;
      oppTeam.points += 2;
      oppTeam.form.push('W');
    } else {
      oppTeam.lost += 1;
      oppTeam.form.push('L');
    }
    oppTeam.runsScored += oRuns;
    oppTeam.oversFaced += oOvers;
    oppTeam.runsConceded += uRuns;
    oppTeam.oversBowled += uOvers;
    oppTeam.nrr = calculateNRR(oppTeam.runsScored, oppTeam.oversFaced, oppTeam.runsConceded, oppTeam.oversBowled);
    oppTeam.nrrFormatted = formatNRR(oppTeam.nrr);
  }

  // Simulate other matches in the league for this round
  const remainingTeams = updated.filter(t => t.teamId !== userTeam?.teamId && t.teamId !== oppTeam?.teamId);
  const roundMatches = [];

  // Pair up remaining teams in pairs of 2
  for (let i = 0; i < remainingTeams.length - 1; i += 2) {
    const tA = remainingTeams[i];
    const tB = remainingTeams[i + 1];
    if (!tA || !tB) break;

    const sim = simulateLeagueMatch(tA, tB);
    roundMatches.push(sim);

    tA.played += 1;
    tB.played += 1;

    if (sim.winnerId === tA.teamId) {
      tA.won += 1;
      tA.points += 2;
      tA.form.push('W');
      tB.lost += 1;
      tB.form.push('L');
    } else {
      tB.won += 1;
      tB.points += 2;
      tB.form.push('W');
      tA.lost += 1;
      tA.form.push('L');
    }

    tA.runsScored += sim.teamARuns;
    tA.oversFaced += sim.teamAOvers;
    tA.runsConceded += sim.teamBRuns;
    tA.oversBowled += sim.teamBOvers;
    tA.nrr = calculateNRR(tA.runsScored, tA.oversFaced, tA.runsConceded, tA.oversBowled);
    tA.nrrFormatted = formatNRR(tA.nrr);

    tB.runsScored += sim.teamBRuns;
    tB.oversFaced += sim.teamBOvers;
    tB.runsConceded += sim.teamARuns;
    tB.oversBowled += sim.teamAOvers;
    tB.nrr = calculateNRR(tB.runsScored, tB.oversFaced, tB.runsConceded, tB.oversBowled);
    tB.nrrFormatted = formatNRR(tB.nrr);
  }

  // Sort standings by: Points DESC -> Wins DESC -> NRR DESC -> Runs Scored DESC
  updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    if (b.nrr !== a.nrr) return b.nrr - a.nrr;
    return b.runsScored - a.runsScored;
  });

  // Assign Ranks and determine Qualifiers status
  const cutoffRank = (leagueId === 'T20_WC' || leagueId === 'ODI_WC') ? 4 : 4;
  const isTournamentEnd = currentRound >= totalRounds;

  updated.forEach((team, idx) => {
    team.rank = idx + 1;

    // Remaining matches that can be played
    const remainingMatches = totalRounds - team.played;
    const maxPossiblePoints = team.points + (remainingMatches * 2);

    // 4th/5th place boundary calculations
    const teamAtCutoff = updated[cutoffRank - 1];
    const teamBelowCutoff = updated[cutoffRank];

    if (isTournamentEnd) {
      if (team.rank <= 2) {
        team.qualificationStatus = 'QUALIFIED_Q1';
        team.statusLabel = 'Q (Qualifier 1)';
        team.statusBadgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 font-bold';
      } else if (team.rank <= cutoffRank) {
        team.qualificationStatus = 'QUALIFIED_ELIMINATOR';
        team.statusLabel = 'Q (Eliminator)';
        team.statusBadgeColor = 'bg-teal-950/80 text-teal-300 border-teal-700/80 font-bold';
      } else {
        team.qualificationStatus = 'ELIMINATED';
        team.statusLabel = 'E (Eliminated)';
        team.statusBadgeColor = 'bg-red-950/60 text-red-400 border-red-800/80';
      }
    } else {
      // During active tournament progression
      if (teamBelowCutoff && team.points > teamBelowCutoff.points + (remainingMatches * 2) && team.rank <= cutoffRank) {
        // Mathematically qualified
        if (team.rank <= 2) {
          team.qualificationStatus = 'QUALIFIED_Q1';
          team.statusLabel = 'Q (Top 2 Clenched)';
          team.statusBadgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 font-bold';
        } else {
          team.qualificationStatus = 'QUALIFIED_ELIMINATOR';
          team.statusLabel = 'Q (Playoff Spot)';
          team.statusBadgeColor = 'bg-teal-950/80 text-teal-300 border-teal-700/80 font-bold';
        }
      } else if (teamAtCutoff && maxPossiblePoints < teamAtCutoff.points) {
        // Mathematically eliminated
        team.qualificationStatus = 'ELIMINATED';
        team.statusLabel = 'E (Eliminated)';
        team.statusBadgeColor = 'bg-red-950/60 text-red-400 border-red-800/80';
      } else {
        team.qualificationStatus = 'IN_CONTENTION';
        team.statusLabel = team.rank <= cutoffRank ? 'Playoff Spot' : 'In Contention';
        team.statusBadgeColor = team.rank <= cutoffRank
          ? 'bg-amber-950/40 text-amber-300 border-amber-700/80'
          : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60';
      }
    }
  });

  const currentUser = updated.find(t => t.isUser);

  // Generate Playoff Bracket State
  const playoffBracket = {
    qualifier1: {
      team1: updated[0],
      team2: updated[1],
      description: 'Winner directly advances to the Grand Final. Loser moves to Qualifier 2.'
    },
    eliminator: {
      team1: updated[2],
      team2: updated[3],
      description: 'Knockout showdown! Winner moves to Qualifier 2. Loser is eliminated.'
    },
    userPlayoffPath: currentUser?.rank <= 2
      ? 'Qualifier 1 (Double Chance to reach Final)'
      : currentUser?.rank <= 4
        ? 'Eliminator (Must win 3 consecutive games for Trophy)'
        : 'Did not qualify for playoffs'
  };

  return {
    standings: updated,
    userRank: currentUser?.rank || 1,
    isUserQualified: (currentUser?.rank || 99) <= cutoffRank,
    userQualificationStatus: currentUser?.qualificationStatus || 'IN_CONTENTION',
    currentRound,
    totalRounds,
    roundMatches,
    playoffBracket
  };
}
