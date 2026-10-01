// High-Fidelity Cricket Simulation Engine

export function calculateSquadSynergy(lineup, captainId, viceCaptainId) {
  const activePlayers = Object.values(lineup).filter(Boolean);
  const totalCount = activePlayers.length;

  if (totalCount === 0) {
    return {
      overallRating: 0,
      batPower: 0,
      bowlPower: 0,
      overseasCount: 0,
      isOverseasValid: true,
      hasWicketkeeper: false,
      pacerCount: 0,
      spinnerCount: 0,
      penaltyApplied: 0
    };
  }

  const overseasCount = activePlayers.filter(p => p.isOverseas).length;
  const isOverseasValid = overseasCount <= 4;

  const wkCount = activePlayers.filter(p => p.role === 'WK').length;
  const pacerCount = activePlayers.filter(p => p.role === 'PACER' || p.role === 'PACE_ALL').length;
  const spinnerCount = activePlayers.filter(p => p.role === 'SPINNER' || p.role === 'SPIN_ALL').length;

  let batSum = 0;
  let bowlSum = 0;
  let totalRatingSum = 0;

  activePlayers.forEach(p => {
    let multiplier = 1.0;
    if (p.id === captainId) multiplier = 1.10; // Captain boost
    else if (p.id === viceCaptainId) multiplier = 1.05; // VC boost

    batSum += p.batRating * multiplier;
    bowlSum += p.bowlRating * multiplier;
    totalRatingSum += p.overall * multiplier;
  });

  const avgBat = Math.round(batSum / totalCount);
  const avgBowl = Math.round(bowlSum / totalCount);
  const avgOverall = Math.round(totalRatingSum / totalCount);

  let penalty = 0;
  if (!isOverseasValid) penalty += 15;
  if (totalCount === 11 && wkCount === 0) penalty += 10;
  if (totalCount === 11 && pacerCount < 2) penalty += 8;
  if (totalCount === 11 && spinnerCount < 1) penalty += 5;

  const effectiveOverall = Math.max(50, avgOverall - penalty);

  return {
    overallRating: effectiveOverall,
    rawOverall: avgOverall,
    batPower: avgBat,
    bowlPower: avgBowl,
    overseasCount,
    isOverseasValid,
    hasWicketkeeper: wkCount > 0,
    pacerCount,
    spinnerCount,
    penaltyApplied: penalty
  };
}

// Fantasy Point Calculator (Dream11 Rules)
export function calculatePlayerFantasyPoints(stats, isCaptain, isViceCaptain) {
  let pts = 0;

  pts += (stats.runs || 0) * 1;
  pts += (stats.fours || 0) * 1;
  pts += (stats.sixes || 0) * 2;

  if (stats.runs >= 100) pts += 16;
  else if (stats.runs >= 50) pts += 8;
  else if (stats.runs >= 30) pts += 4;

  if (stats.runs === 0 && stats.ballsFaced > 0 && stats.isOut && stats.battingOrder <= 7) {
    pts -= 2;
  }

  if (stats.ballsFaced >= 10) {
    const sr = (stats.runs / stats.ballsFaced) * 100;
    if (sr > 170) pts += 6;
    else if (sr >= 150) pts += 4;
    else if (sr >= 130) pts += 2;
    else if (sr < 90) pts -= 2;
  }

  pts += (stats.wickets || 0) * 25;
  pts += (stats.bowledOrLbw || 0) * 8;
  pts += (stats.maidens || 0) * 12;

  if (stats.wickets >= 5) pts += 16;
  else if (stats.wickets >= 4) pts += 8;
  else if (stats.wickets >= 3) pts += 4;

  if (stats.ballsBowled >= 12) {
    const overs = stats.ballsBowled / 6;
    const econ = stats.runsConceded / overs;
    if (econ < 5.0) pts += 6;
    else if (econ < 6.0) pts += 4;
    else if (econ < 7.0) pts += 2;
    else if (econ > 11.0) pts -= 4;
    else if (econ > 10.0) pts -= 2;
  }

  pts += (stats.catches || 0) * 8;
  pts += (stats.stumpings || 0) * 12;

  let finalPts = pts;
  if (isCaptain) finalPts = Math.round(pts * 2.0);
  else if (isViceCaptain) finalPts = Math.round(pts * 1.5);

  return {
    rawPoints: pts,
    finalPoints: finalPts,
    multiplier: isCaptain ? 2.0 : isViceCaptain ? 1.5 : 1.0
  };
}

export function calculateMatchOdds(userSynergy, opponent) {
  const ratingDiff = userSynergy.overallRating - opponent.threatRating;
  const baseWinProb = 1 / (1 + Math.exp(-ratingDiff / 6.5));
  const clampedProb = Math.min(0.94, Math.max(0.12, baseWinProb));

  const userOdds = Number((1 / clampedProb).toFixed(2));
  const oppOdds = Number((1 / (1 - clampedProb)).toFixed(2));

  return {
    winProbabilityPercent: Math.round(clampedProb * 100),
    userOdds,
    opponentOdds: oppOdds,
    isFavorite: clampedProb >= 0.50
  };
}

// Shot descriptions
const SHOT_TYPES_FOUR = [
  'gorgeous cover drive pierced through extra cover',
  'ferocious pull shot bisects deep midwicket and square leg',
  'crisp straight drive past the bowler down the ground',
  'delicate late cut beating third man to the rope',
  'flamboyant lofted on-drive over mid-on',
  'clever reverse sweep beats short third man'
];

const SHOT_TYPES_SIX = [
  'monstrous helicopter shot dispatched into the top tier!',
  'massive pull over deep square leg into the 120m zone!',
  'clean lofted straight hit sailing 105 meters over long-off!',
  'spectacular pickup flick over fine leg into the stands!',
  'dance down the track and bludgeoned over wide long-on!'
];

const WICKET_TYPES = [
  'clean bowled! Yorker shatters middle and off stumps!',
  'edged and taken! Brilliant catch behind the stumps!',
  'holes out to deep midwicket! High in the air and safely held.',
  'trapped plumb in front! Huge appeal and given LBW!',
  'misjudged slower ball, caught and bowled!'
];

// Generate Over-by-Over & Ball-by-Ball Match Simulation against Opponent
export function simulateCricketMatch(userLineup, opponent, captainId, viceCaptainId) {
  const players = Object.values(userLineup).filter(Boolean);
  const synergy = calculateSquadSynergy(userLineup, captainId, viceCaptainId);
  const odds = calculateMatchOdds(synergy, opponent);

  const isUserBattingFirst = Math.random() > 0.5;

  let parScore = 175;
  let wicketModifier = 1.0;
  let boundaryFreq = 0.18;

  if (opponent.pitchType === 'FLAT_BATTER') {
    parScore = 205;
    boundaryFreq = 0.25;
    wicketModifier = 0.82;
  } else if (opponent.pitchType === 'SPIN_TURNING') {
    parScore = 155;
    boundaryFreq = 0.13;
    wicketModifier = 1.28;
  } else if (opponent.pitchType === 'PACE_GREEN') {
    parScore = 165;
    wicketModifier = 1.22;
    boundaryFreq = 0.15;
  }

  // Generate Opponent Target / Score
  const oppBatRating = opponent.batPower;
  const oppBowlRating = opponent.bowlPower;
  const oppVariance = (Math.random() - 0.5) * 34;
  const oppTargetBaseline = Math.round(parScore * (oppBatRating / 90) + oppVariance);
  const opponentTotalRuns = Math.max(125, oppTargetBaseline);
  const opponentWickets = Math.min(10, Math.floor(4 + Math.random() * 6 * (synergy.bowlPower / 85)));

  // Opponent over-by-over progression
  const opponentOverScores = [];
  let oppAcc = 0;
  for (let o = 1; o <= 20; o++) {
    const runsInOver = Math.round(opponentTotalRuns / 20 + (Math.random() - 0.5) * 6);
    oppAcc += runsInOver;
    opponentOverScores.push({
      over: o,
      runs: Math.min(opponentTotalRuns, oppAcc)
    });
  }

  // User Batting Cards
  const userBattingStats = players.map((p, idx) => ({
    player: p,
    battingOrder: idx + 1,
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    dismissal: 'not out',
    wickets: 0,
    bowledOrLbw: 0,
    ballsBowled: 0,
    runsConceded: 0,
    maidens: 0,
    catches: 0,
    stumpings: 0
  }));

  // Distribute bowling among top bowlers
  const bowlers = userBattingStats
    .filter(b => b.player.bowlRating >= 65 || b.player.role.includes('BOWL') || b.player.role.includes('ALL'))
    .sort((a, b) => b.player.bowlRating - a.player.bowlRating)
    .slice(0, 5);

  if (bowlers.length < 5) {
    const remaining = userBattingStats.filter(b => !bowlers.includes(b)).sort((a, b) => b.player.bowlRating - a.player.bowlRating);
    bowlers.push(...remaining.slice(0, 5 - bowlers.length));
  }

  let wicketsLeft = opponentWickets;
  bowlers.forEach(b => {
    b.ballsBowled = 24;
    const econ = (opponentTotalRuns / 20) * (90 / b.player.bowlRating);
    b.runsConceded = Math.round(econ * 4 + (Math.random() - 0.5) * 8);

    const share = Math.min(wicketsLeft, Math.floor(Math.random() * 3));
    b.wickets = share;
    b.bowledOrLbw = Math.floor(share * 0.4);
    wicketsLeft -= share;
  });
  if (wicketsLeft > 0 && bowlers[0]) {
    bowlers[0].wickets += wicketsLeft;
  }

  // Ball by ball simulation
  let userRuns = 0;
  let userWickets = 0;
  let strikerIndex = 0;
  let nonStrikerIndex = 1;
  const ballByBallEvents = [];
  const overGraph = [];

  for (let over = 1; over <= 20; over++) {
    let overRuns = 0;
    let overWickets = 0;

    const currentOpponentBowler = opponent.keyPlayers[Math.floor(Math.random() * opponent.keyPlayers.length)];

    for (let ball = 1; ball <= 6; ball++) {
      const striker = userBattingStats[strikerIndex];
      const nonStriker = userBattingStats[nonStrikerIndex];
      if (!striker) break;

      striker.ballsFaced++;

      // Wicket probability
      const wicketProb = 0.046 * wicketModifier * (oppBowlRating / striker.player.batRating);
      const isWicket = Math.random() < wicketProb;

      let eventType = 'DOT';
      let ballRuns = 0;
      let commentary = '';

      if (isWicket) {
        striker.isOut = true;
        const wDesc = WICKET_TYPES[Math.floor(Math.random() * WICKET_TYPES.length)];
        striker.dismissal = `b ${currentOpponentBowler}`;
        userWickets++;
        overWickets++;
        eventType = 'WICKET';
        commentary = `WICKET! ${striker.player.name} (${striker.runs} off ${striker.ballsFaced}b) is OUT! ${wDesc}`;

        // Next batsman
        const nextIn = userBattingStats.findIndex((b, idx) => idx > Math.max(strikerIndex, nonStrikerIndex) && !b.isOut && b.ballsFaced === 0);
        if (nextIn !== -1 && userWickets < 10) {
          strikerIndex = nextIn;
        }
      } else {
        const rand = Math.random();
        const batSkill = striker.player.batRating / 100;

        if (rand < 0.36 - (batSkill * 0.1)) {
          ballRuns = 0;
          eventType = 'DOT';
          commentary = `Dot ball. Good length delivery defended back to ${currentOpponentBowler}.`;
        } else if (rand < 0.68) {
          ballRuns = 1;
          eventType = 'SINGLE';
          commentary = `1 run. Tucked into the gap on the on-side for a brisk single.`;
        } else if (rand < 0.82) {
          ballRuns = 2;
          eventType = 'DOUBLE';
          commentary = `2 runs. Driven into the deep cover gap; good hard running between the wickets.`;
        } else if (rand < 0.92 + (boundaryFreq * 0.15)) {
          ballRuns = 4;
          striker.fours++;
          eventType = 'FOUR';
          const shotDesc = SHOT_TYPES_FOUR[Math.floor(Math.random() * SHOT_TYPES_FOUR.length)];
          commentary = `FOUR! ${striker.player.name} plays a ${shotDesc}!`;
        } else {
          ballRuns = 6;
          striker.sixes++;
          eventType = 'SIX';
          const sixDesc = SHOT_TYPES_SIX[Math.floor(Math.random() * SHOT_TYPES_SIX.length)];
          commentary = `SIX! ENORMOUS! ${striker.player.name} with a ${sixDesc}`;
        }

        striker.runs += ballRuns;
        userRuns += ballRuns;
        overRuns += ballRuns;

        if (ballRuns === 1 || ballRuns === 3) {
          const temp = strikerIndex;
          strikerIndex = nonStrikerIndex;
          nonStrikerIndex = temp;
        }
      }

      ballByBallEvents.push({
        over: `${over}.${ball}`,
        overNum: over,
        ballNum: ball,
        strikerName: striker.player.name,
        nonStrikerName: nonStriker?.player.name || '',
        bowlerName: currentOpponentBowler,
        runs: ballRuns,
        totalRuns: userRuns,
        wickets: userWickets,
        eventType,
        commentary
      });

      // If chasing and crossed target
      if (!isUserBattingFirst && userRuns > opponentTotalRuns) {
        break;
      }
      if (userWickets >= 10) {
        break;
      }
    }

    // End of over strike rotation
    const temp = strikerIndex;
    strikerIndex = nonStrikerIndex;
    nonStrikerIndex = temp;

    overGraph.push({
      over,
      overRuns,
      totalRuns: userRuns,
      wickets: userWickets,
      oppRuns: opponentOverScores[over - 1]?.runs || Math.round((opponentTotalRuns / 20) * over)
    });

    if (!isUserBattingFirst && userRuns > opponentTotalRuns) {
      break;
    }
    if (userWickets >= 10) {
      break;
    }
  }

  // Outcome
  let isWin = false;
  let marginText = '';

  if (isUserBattingFirst) {
    if (userRuns > opponentTotalRuns) {
      isWin = true;
      marginText = `Won by ${userRuns - opponentTotalRuns} runs`;
    } else if (userRuns === opponentTotalRuns) {
      isWin = synergy.overallRating > opponent.threatRating;
      marginText = isWin ? 'Won via Super Over Thriller!' : 'Lost in Super Over Heartbreak';
    } else {
      isWin = false;
      marginText = `Lost by ${10 - opponentWickets} wickets`;
    }
  } else {
    if (userRuns > opponentTotalRuns) {
      isWin = true;
      const ballsLeft = 120 - ballByBallEvents.length;
      marginText = `Won by ${10 - userWickets} wickets (${ballsLeft} balls left)`;
    } else if (userRuns === opponentTotalRuns) {
      isWin = synergy.overallRating > opponent.threatRating;
      marginText = isWin ? 'Won via Super Over Thriller!' : 'Lost in Super Over Heartbreak';
    } else {
      isWin = false;
      marginText = `Lost by ${opponentTotalRuns - userRuns} runs`;
    }
  }

  let totalTeamFantasyPoints = 0;
  const playerFantasySummary = userBattingStats.map(stat => {
    const isCap = stat.player.id === captainId;
    const isVc = stat.player.id === viceCaptainId;
    const fPoints = calculatePlayerFantasyPoints(stat, isCap, isVc);
    totalTeamFantasyPoints += fPoints.finalPoints;

    return {
      player: stat.player,
      stats: stat,
      fantasy: fPoints
    };
  });

  const sortedPerformers = [...playerFantasySummary].sort((a, b) => b.fantasy.finalPoints - a.fantasy.finalPoints);
  const matchMVP = sortedPerformers[0];

  return {
    matchNumber: opponent.matchNumber,
    opponent,
    isWin,
    isUserBattingFirst,
    userScore: `${userRuns}/${userWickets} (${(ballByBallEvents.length / 6).toFixed(1)} ov)`,
    userRuns,
    userWickets,
    userOvers: (ballByBallEvents.length / 6).toFixed(1),
    opponentScore: `${opponentTotalRuns}/${opponentWickets} (20.0 ov)`,
    opponentRuns: opponentTotalRuns,
    opponentWickets,
    marginText,
    totalTeamFantasyPoints,
    playerFantasySummary,
    matchMVP,
    overGraph,
    ballByBallEvents,
    odds
  };
}

// ================= MULTIPLAYER HEAD-TO-HEAD SIMULATOR =================
// Full 20-Over simulation between Player 1's Starting XI vs Player 2's Starting XI
export function simulateHeadToHeadMatch(
  lineup1,
  lineup2,
  captainId1,
  viceCaptainId1,
  captainId2,
  viceCaptainId2,
  p1Name = 'Player 1',
  p2Name = 'Player 2'
) {
  const p1Players = Object.values(lineup1).filter(Boolean);
  const p2Players = Object.values(lineup2).filter(Boolean);

  const synergy1 = calculateSquadSynergy(lineup1, captainId1, viceCaptainId1);
  const synergy2 = calculateSquadSynergy(lineup2, captainId2, viceCaptainId2);

  // Coin Toss
  const tossWinner = Math.random() > 0.5 ? 1 : 2;
  const tossChoice = Math.random() > 0.5 ? 'BAT' : 'BOWL';

  const team1BatsFirst = (tossWinner === 1 && tossChoice === 'BAT') || (tossWinner === 2 && tossChoice === 'BOWL');
  const batTeamName1 = team1BatsFirst ? p1Name : p2Name;
  const batTeamName2 = team1BatsFirst ? p2Name : p1Name;

  // Set up batting & bowling stats trackers for Team 1
  const t1Stats = p1Players.map((p, idx) => ({
    player: p,
    teamNumber: 1,
    battingOrder: idx + 1,
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    dismissal: 'not out',
    wickets: 0,
    bowledOrLbw: 0,
    ballsBowled: 0,
    runsConceded: 0,
    maidens: 0,
    catches: 0,
    stumpings: 0
  }));

  // Set up batting & bowling stats trackers for Team 2
  const t2Stats = p2Players.map((p, idx) => ({
    player: p,
    teamNumber: 2,
    battingOrder: idx + 1,
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    dismissal: 'not out',
    wickets: 0,
    bowledOrLbw: 0,
    ballsBowled: 0,
    runsConceded: 0,
    maidens: 0,
    catches: 0,
    stumpings: 0
  }));

  // Assign top 5 bowlers for each team
  const getTopBowlers = (stats) => {
    const list = stats
      .filter(s => s.player.bowlRating >= 60 || s.player.role.includes('BOWL') || s.player.role.includes('ALL'))
      .sort((a, b) => b.player.bowlRating - a.player.bowlRating)
      .slice(0, 5);

    if (list.length < 5) {
      const remainder = stats.filter(s => !list.includes(s)).sort((a, b) => b.player.bowlRating - a.player.bowlRating);
      list.push(...remainder.slice(0, 5 - list.length));
    }
    return list;
  };

  const t1Bowlers = getTopBowlers(t1Stats);
  const t2Bowlers = getTopBowlers(t2Stats);

  // Helper to simulate a single 20-over innings
  const simulateSingleInnings = (battingStats, bowlingList, targetToBeat = null) => {
    let totalRuns = 0;
    let wickets = 0;
    let strikerIdx = 0;
    let nonStrikerIdx = 1;
    const events = [];
    const overList = [];

    // Each bowler can bowl up to 4 overs (total 20 overs)
    const bowlerRotation = [
      bowlingList[0], bowlingList[1], bowlingList[0], bowlingList[1],
      bowlingList[2], bowlingList[3], bowlingList[4], bowlingList[2],
      bowlingList[3], bowlingList[4], bowlingList[2], bowlingList[3],
      bowlingList[4], bowlingList[0], bowlingList[1], bowlingList[4],
      bowlingList[2], bowlingList[0], bowlingList[1], bowlingList[0]
    ];

    for (let over = 1; over <= 20; over++) {
      let overRuns = 0;
      let overWickets = 0;
      const bowler = bowlerRotation[over - 1] || bowlingList[0];

      for (let ball = 1; ball <= 6; ball++) {
        const striker = battingStats[strikerIdx];
        const nonStriker = battingStats[nonStrikerIdx];
        if (!striker) break;

        striker.ballsFaced++;
        bowler.ballsBowled++;

        // Wicket odds based on bowler's rating vs batsman's rating
        const batSkill = (striker.player.batRating || 80) / 100;
        const bowlSkill = (bowler.player.bowlRating || 80) / 100;
        const wicketProb = 0.045 * (bowlSkill / batSkill);
        const isWicket = Math.random() < wicketProb;

        let eventType = 'DOT';
        let ballRuns = 0;
        let commentary = '';

        if (isWicket) {
          striker.isOut = true;
          wickets++;
          overWickets++;
          bowler.wickets++;
          if (Math.random() < 0.4) bowler.bowledOrLbw++;

          const wDesc = WICKET_TYPES[Math.floor(Math.random() * WICKET_TYPES.length)];
          striker.dismissal = `b ${bowler.player.name}`;
          eventType = 'WICKET';
          commentary = `WICKET! ${striker.player.name} (${striker.runs} off ${striker.ballsFaced}b) is OUT! ${wDesc}`;

          // Next batsman
          const nextIn = battingStats.findIndex((b, idx) => idx > Math.max(strikerIdx, nonStrikerIdx) && !b.isOut && b.ballsFaced === 0);
          if (nextIn !== -1 && wickets < 10) {
            strikerIdx = nextIn;
          }
        } else {
          const rand = Math.random();
          if (rand < 0.35 - (batSkill * 0.08)) {
            ballRuns = 0;
            eventType = 'DOT';
            commentary = `Dot ball. Good length delivery defended back to ${bowler.player.name}.`;
          } else if (rand < 0.68) {
            ballRuns = 1;
            eventType = 'SINGLE';
            commentary = `1 run. Tucked through midwicket for a sharp single.`;
          } else if (rand < 0.81) {
            ballRuns = 2;
            eventType = 'DOUBLE';
            commentary = `2 runs. Driven into the deep cover pocket; good running.`;
          } else if (rand < 0.93) {
            ballRuns = 4;
            striker.fours++;
            eventType = 'FOUR';
            const sDesc = SHOT_TYPES_FOUR[Math.floor(Math.random() * SHOT_TYPES_FOUR.length)];
            commentary = `FOUR! ${striker.player.name} strikes a ${sDesc}!`;
          } else {
            ballRuns = 6;
            striker.sixes++;
            eventType = 'SIX';
            const sDesc = SHOT_TYPES_SIX[Math.floor(Math.random() * SHOT_TYPES_SIX.length)];
            commentary = `SIX! MASSIVE HIT! ${striker.player.name} with a ${sDesc}`;
          }

          striker.runs += ballRuns;
          totalRuns += ballRuns;
          overRuns += ballRuns;
          bowler.runsConceded += ballRuns;

          if (ballRuns === 1 || ballRuns === 3) {
            const temp = strikerIdx;
            strikerIdx = nonStrikerIdx;
            nonStrikerIdx = temp;
          }
        }

        events.push({
          over: `${over}.${ball}`,
          overNum: over,
          ballNum: ball,
          strikerName: striker.player.name,
          nonStrikerName: nonStriker?.player.name || '',
          bowlerName: bowler.player.name,
          runs: ballRuns,
          totalRuns,
          wickets,
          eventType,
          commentary
        });

        // Chase threshold check
        if (targetToBeat !== null && totalRuns > targetToBeat) {
          break;
        }
        if (wickets >= 10) {
          break;
        }
      }

      if (overRuns === 0) {
        bowler.maidens++;
      }

      // Over end strike change
      const temp = strikerIdx;
      strikerIdx = nonStrikerIdx;
      nonStrikerIdx = temp;

      overList.push({
        over,
        overRuns,
        totalRuns,
        wickets
      });

      if (targetToBeat !== null && totalRuns > targetToBeat) {
        break;
      }
      if (wickets >= 10) {
        break;
      }
    }

    return {
      totalRuns,
      wickets,
      oversBowled: (events.length / 6).toFixed(1),
      events,
      overList
    };
  };

  // Simulating 1st Innings
  const firstInningsBatters = team1BatsFirst ? t1Stats : t2Stats;
  const firstInningsBowlers = team1BatsFirst ? t2Bowlers : t1Bowlers;
  const innings1Result = simulateSingleInnings(firstInningsBatters, firstInningsBowlers);

  // Simulating 2nd Innings
  const secondInningsBatters = team1BatsFirst ? t2Stats : t1Stats;
  const secondInningsBowlers = team1BatsFirst ? t1Bowlers : t2Bowlers;
  const innings2Result = simulateSingleInnings(secondInningsBatters, secondInningsBowlers, innings1Result.totalRuns);

  // Match Result & Margins
  let winner = null;
  let marginText = '';
  const team1TotalRuns = team1BatsFirst ? innings1Result.totalRuns : innings2Result.totalRuns;
  const team2TotalRuns = team1BatsFirst ? innings2Result.totalRuns : innings1Result.totalRuns;

  const team1Wickets = team1BatsFirst ? innings1Result.wickets : innings2Result.wickets;
  const team2Wickets = team1BatsFirst ? innings2Result.wickets : innings1Result.wickets;

  if (team1TotalRuns > team2TotalRuns) {
    winner = 1;
    if (team1BatsFirst) {
      marginText = `${p1Name} won by ${team1TotalRuns - team2TotalRuns} runs`;
    } else {
      marginText = `${p1Name} won by ${10 - team1Wickets} wickets`;
    }
  } else if (team2TotalRuns > team1TotalRuns) {
    winner = 2;
    if (!team1BatsFirst) {
      marginText = `${p2Name} won by ${team2TotalRuns - team1TotalRuns} runs`;
    } else {
      marginText = `${p2Name} won by ${10 - team2Wickets} wickets`;
    }
  } else {
    // Super Over tie breaker
    winner = synergy1.overallRating >= synergy2.overallRating ? 1 : 2;
    marginText = `Tied! ${winner === 1 ? p1Name : p2Name} won the Super Over Thriller!`;
  }

  // Calculate Fantasy Points for all 22 players
  let p1TotalFantasy = 0;
  const p1FantasyList = t1Stats.map(stat => {
    const isCap = stat.player.id === captainId1;
    const isVc = stat.player.id === viceCaptainId1;
    const f = calculatePlayerFantasyPoints(stat, isCap, isVc);
    p1TotalFantasy += f.finalPoints;
    return { player: stat.player, stats: stat, fantasy: f };
  });

  let p2TotalFantasy = 0;
  const p2FantasyList = t2Stats.map(stat => {
    const isCap = stat.player.id === captainId2;
    const isVc = stat.player.id === viceCaptainId2;
    const f = calculatePlayerFantasyPoints(stat, isCap, isVc);
    p2TotalFantasy += f.finalPoints;
    return { player: stat.player, stats: stat, fantasy: f };
  });

  // Calculate Overall Match MVP
  const allPerformers = [...p1FantasyList, ...p2FantasyList].sort((a, b) => b.fantasy.finalPoints - a.fantasy.finalPoints);
  const matchMVP = allPerformers[0];

  return {
    toss: {
      winner: tossWinner === 1 ? p1Name : p2Name,
      winnerNumber: tossWinner,
      choice: tossChoice,
      text: `${tossWinner === 1 ? p1Name : p2Name} won the toss and elected to ${tossChoice.toLowerCase()} first.`
    },
    winnerNumber: winner,
    winnerName: winner === 1 ? p1Name : p2Name,
    marginText,
    innings1: {
      battingTeamName: batTeamName1,
      battingTeamNumber: team1BatsFirst ? 1 : 2,
      runs: innings1Result.totalRuns,
      wickets: innings1Result.wickets,
      overs: innings1Result.oversBowled,
      scoreFormatted: `${innings1Result.totalRuns}/${innings1Result.wickets} (${innings1Result.oversBowled} ov)`,
      batters: firstInningsBatters,
      bowlers: firstInningsBowlers,
      events: innings1Result.events,
      overList: innings1Result.overList
    },
    innings2: {
      battingTeamName: batTeamName2,
      battingTeamNumber: team1BatsFirst ? 2 : 1,
      target: innings1Result.totalRuns + 1,
      runs: innings2Result.totalRuns,
      wickets: innings2Result.wickets,
      overs: innings2Result.oversBowled,
      scoreFormatted: `${innings2Result.totalRuns}/${innings2Result.wickets} (${innings2Result.oversBowled} ov)`,
      batters: secondInningsBatters,
      bowlers: secondInningsBowlers,
      events: innings2Result.events,
      overList: innings2Result.overList
    },
    team1: {
      name: p1Name,
      lineup: lineup1,
      synergy: synergy1,
      totalFantasy: p1TotalFantasy,
      performers: p1FantasyList,
      score: `${team1TotalRuns}/${team1Wickets}`
    },
    team2: {
      name: p2Name,
      lineup: lineup2,
      synergy: synergy2,
      totalFantasy: p2TotalFantasy,
      performers: p2FantasyList,
      score: `${team2TotalRuns}/${team2Wickets}`
    },
    matchMVP
  };
}
