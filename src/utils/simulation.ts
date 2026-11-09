import { GambleOption, DrawStep, SimulationTrajectory, DeliberationLevel, AlgorithmicAssignmentRow } from '../types/decision';
import { TABLE_3_CHOICE_PROBLEMS, PRETESTED_GAMBLES } from '../data/paperData';

/**
 * Seeded PRNG (Mulberry32) for reproducible R script simulation
 */
export function createPRNG(seed: number) {
  let s = Math.floor(seed);
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle array using seeded random function
 */
export function seededShuffle<T>(array: T[], randomFn: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Similarity Measure δ(n) calculation
 * Exactly as defined in Mondal & Traczyk (Equation 1, page 9):
 * δ(n) = 1 - (|μ(n) - μ(n-1)| / |μ(n-1)|) when μ(n-1) != 0
 * δ(n) = 0 when μ(n-1) == 0 and μ(n) != 0
 * δ(n) = 1 when μ(n-1) == 0 and μ(n) == 0
 */
export function calculateDeltaN(prevMean: number, currentMean: number): number {
  if (Math.abs(prevMean) > 1e-9) {
    const relativeChange = Math.abs(currentMean - prevMean) / Math.abs(prevMean);
    const delta = 1 - relativeChange;
    // Bound between 0 and 1 for stability in visualization
    return Math.max(0, Math.min(1, delta));
  }
  if (Math.abs(currentMean) > 1e-9) {
    return 0;
  }
  return 1;
}

/**
 * Draw a single outcome from a binary gamble distribution
 */
export function drawFromGamble(option: GambleOption, randomFn = Math.random): number {
  const r = randomFn();
  return r < option.prob1 ? option.outcome1 : option.outcome2;
}

/**
 * Run a single sample trajectory of n draws
 */
export function simulateTrajectory(
  option: GambleOption,
  numDraws: number = 40,
  randomFn = Math.random
): SimulationTrajectory {
  const steps: DrawStep[] = [];
  let sum = 0;
  let prevMean = 0;

  let reachedLowAt: number | null = null;
  let reachedModAt: number | null = null;
  let reachedHighAt: number | null = null;

  for (let i = 1; i <= numDraws; i++) {
    const outcome = drawFromGamble(option, randomFn);
    sum += outcome;
    const currentMean = sum / i;

    let similarity = 0;
    let deltaPercent = 0;

    if (i === 1) {
      // First draw: benchmark against itself or initial step
      similarity = 0.4; // Base exploration origin
      deltaPercent = 1.0;
    } else {
      deltaPercent = Math.abs(prevMean) > 1e-9 
        ? Math.abs(currentMean - prevMean) / Math.abs(prevMean) 
        : (Math.abs(currentMean) > 1e-9 ? 1.0 : 0);
      similarity = calculateDeltaN(prevMean, currentMean);
    }

    if (reachedLowAt === null && similarity >= 0.70 && i >= 3) {
      reachedLowAt = i;
    }
    if (reachedModAt === null && similarity >= 0.80 && i >= 4) {
      reachedModAt = i;
    }
    if (reachedHighAt === null && similarity >= 0.90 && i >= 5) {
      reachedHighAt = i;
    }

    steps.push({
      step: i,
      outcome,
      sampleMean: currentMean,
      prevMean,
      deltaPercent,
      similarity
    });

    prevMean = currentMean;
  }

  return {
    runId: 1,
    steps,
    reachedLowAt,
    reachedModAt,
    reachedHighAt,
    finalMean: prevMean,
    trueEV: option.ev
  };
}

/**
 * Monte Carlo ensemble simulation (Figure 1 in paper)
 * Simulates multiple participants exploring the same gamble
 */
export function simulateEnsemble(
  option: GambleOption,
  runs: number = 100,
  numDraws: number = 40,
  seed?: number
) {
  const randomFn = seed !== undefined ? createPRNG(seed) : Math.random;
  const allTrajectories: SimulationTrajectory[] = [];

  for (let r = 0; r < runs; r++) {
    const traj = simulateTrajectory(option, numDraws, randomFn);
    traj.runId = r + 1;
    allTrajectories.push(traj);
  }

  // Aggregate step by step
  const aggregatedSteps = [];
  for (let stepIdx = 0; stepIdx < numDraws; stepIdx++) {
    const stepNum = stepIdx + 1;
    const means: number[] = [];
    const similarities: number[] = [];

    allTrajectories.forEach((t) => {
      const s = t.steps[stepIdx];
      if (s) {
        means.push(s.sampleMean);
        similarities.push(s.similarity);
      }
    });

    const avgMean = means.reduce((a, b) => a + b, 0) / means.length;
    const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;

    // Standard deviation and 95% CI
    const variance = similarities.reduce((acc, val) => acc + Math.pow(val - avgSimilarity, 2), 0) / (similarities.length - 1 || 1);
    const sd = Math.sqrt(variance);
    const ci95 = 1.96 * (sd / Math.sqrt(similarities.length));

    aggregatedSteps.push({
      step: stepNum,
      avgMean,
      avgSimilarity,
      ciLower: Math.max(0, avgSimilarity - ci95),
      ciUpper: Math.min(1, avgSimilarity + ci95),
      sd
    });
  }

  // Average draws to reach thresholds
  const lowSamples = allTrajectories.map(t => t.reachedLowAt).filter((v): v is number => v !== null);
  const modSamples = allTrajectories.map(t => t.reachedModAt).filter((v): v is number => v !== null);
  const highSamples = allTrajectories.map(t => t.reachedHighAt).filter((v): v is number => v !== null);

  const avgToLow = lowSamples.length ? Math.round(lowSamples.reduce((a, b) => a + b, 0) / lowSamples.length) : null;
  const avgToMod = modSamples.length ? Math.round(modSamples.reduce((a, b) => a + b, 0) / modSamples.length) : null;
  const avgToHigh = highSamples.length ? Math.round(highSamples.reduce((a, b) => a + b, 0) / highSamples.length) : null;

  return {
    aggregatedSteps,
    sampleTrajectory: allTrajectories[0],
    avgToLow,
    avgToMod,
    avgToHigh,
    trueEV: option.ev
  };
}

/**
 * Replicate the User's R Script Algorithm
 *
 * set.seed(seed)
 * Random_String_gain <- sample(rep(1:3, each = 3)) -> Low, Moderate, High
 * Random_String_loss <- sample(rep(1:3, each = 3)) -> Low, Moderate, High
 * Joins with Gamble_A and Gamble_B deliberations
 * Calculates nsample = Similarity_A + Similarity_B
 */
export function runRScriptAlgorithm(seed: number = 30): {
  rows: AlgorithmicAssignmentRow[];
  gainRows: AlgorithmicAssignmentRow[];
  lossRows: AlgorithmicAssignmentRow[];
  summary: {
    totalHigh: number;
    totalMod: number;
    totalLow: number;
    meanNsampleHigh: number;
    meanNsampleMod: number;
    meanNsampleLow: number;
  };
} {
  const prng = createPRNG(seed);

  // We have 9 Gain problems and 9 Loss problems from Table 3 (or 15 each in pretested gambles)
  // Matching the R script: 18 problems, with 9 gain and 9 loss
  const gainProblems = TABLE_3_CHOICE_PROBLEMS.filter(p => p.domain === 'Gain');
  const lossProblems = TABLE_3_CHOICE_PROBLEMS.filter(p => p.domain === 'Loss');

  // Deliberation levels to assign: rep(1:3, each = 3) -> [Low, Low, Low, Mod, Mod, Mod, High, High, High]
  const deliberationPool: DeliberationLevel[] = [
    'Low', 'Low', 'Low',
    'Moderate', 'Moderate', 'Moderate',
    'High', 'High', 'High'
  ];

  const shuffledGains = seededShuffle(deliberationPool, prng);
  const shuffledLosses = seededShuffle(deliberationPool, prng);

  const gainAssignments: AlgorithmicAssignmentRow[] = gainProblems.map((prob, idx) => {
    const assignedDelib = shuffledGains[idx];
    const pretest = PRETESTED_GAMBLES.find(g => g.id === prob.id) || {
      lowDelA: prob.explorationA,
      modDelA: prob.explorationA,
      highDelA: prob.explorationA,
      lowDelB: prob.explorationB,
      modDelB: prob.explorationB,
      highDelB: prob.explorationB
    };

    let simA = pretest.lowDelA;
    let simB = pretest.lowDelB;

    if (assignedDelib === 'Moderate') {
      simA = pretest.modDelA;
      simB = pretest.modDelB;
    } else if (assignedDelib === 'High') {
      simA = pretest.highDelA;
      simB = pretest.highDelB;
    }

    return {
      rowNum: idx + 1,
      id: prob.id,
      domain: 'Gain',
      deliberation: assignedDelib,
      similarityA: simA,
      similarityB: simB,
      nsample: simA + simB,
      evA: prob.evA,
      evB: prob.evB,
      bestOption: prob.evMaximizingOption
    };
  });

  const lossAssignments: AlgorithmicAssignmentRow[] = lossProblems.map((prob, idx) => {
    const assignedDelib = shuffledLosses[idx];
    const pretest = PRETESTED_GAMBLES.find(g => g.id === prob.id) || {
      lowDelA: prob.explorationA,
      modDelA: prob.explorationA,
      highDelA: prob.explorationA,
      lowDelB: prob.explorationB,
      modDelB: prob.explorationB,
      highDelB: prob.explorationB
    };

    let simA = pretest.lowDelA;
    let simB = pretest.lowDelB;

    if (assignedDelib === 'Moderate') {
      simA = pretest.modDelA;
      simB = pretest.modDelB;
    } else if (assignedDelib === 'High') {
      simA = pretest.highDelA;
      simB = pretest.highDelB;
    }

    return {
      rowNum: gainProblems.length + idx + 1,
      id: prob.id,
      domain: 'Loss',
      deliberation: assignedDelib,
      similarityA: simA,
      similarityB: simB,
      nsample: simA + simB,
      evA: prob.evA,
      evB: prob.evB,
      bestOption: prob.evMaximizingOption
    };
  });

  const allRows = [...gainAssignments, ...lossAssignments];

  const highRows = allRows.filter(r => r.deliberation === 'High');
  const modRows = allRows.filter(r => r.deliberation === 'Moderate');
  const lowRows = allRows.filter(r => r.deliberation === 'Low');

  const meanNsampleHigh = highRows.reduce((a, b) => a + b.nsample, 0) / (highRows.length || 1);
  const meanNsampleMod = modRows.reduce((a, b) => a + b.nsample, 0) / (modRows.length || 1);
  const meanNsampleLow = lowRows.reduce((a, b) => a + b.nsample, 0) / (lowRows.length || 1);

  return {
    rows: allRows,
    gainRows: gainAssignments,
    lossRows: lossAssignments,
    summary: {
      totalHigh: highRows.length,
      totalMod: modRows.length,
      totalLow: lowRows.length,
      meanNsampleHigh: parseFloat(meanNsampleHigh.toFixed(1)),
      meanNsampleMod: parseFloat(meanNsampleMod.toFixed(1)),
      meanNsampleLow: parseFloat(meanNsampleLow.toFixed(1))
    }
  };
}

/**
 * Generate CSV text and trigger download
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert Assignment Rows to CSV matching Similarity_measure.csv
 */
export function exportSimilarityMeasureCSV(rows: AlgorithmicAssignmentRow[]): string {
  const header = `"",".id","Similarity_Condition","Similarity_A","Similarity_B","nsample"`;
  const body = rows.map((r, i) => `"${i + 1}","${r.id}","${r.deliberation}",${r.similarityA},${r.similarityB},${r.nsample}`).join('\n');
  return `${header}\n${body}`;
}

/**
 * Compute the average exploration sample limits for an arbitrary gamble
 * across the three similarity conditions: Low (70%), Moderate (80%), High (90%)
 */
export function computeGambleThresholds(
  option: GambleOption,
  runs = 120,
  maxDraws = 45,
  seed = 42
): { low: number; mod: number; high: number } {
  const prng = createPRNG(seed);
  const simSums = new Float64Array(maxDraws);

  for (let r = 0; r < runs; r++) {
    let sum = 0;
    let prev = 0;
    for (let n = 1; n <= maxDraws; n++) {
      const outcome = (prng() < option.prob1) ? option.outcome1 : option.outcome2;
      sum += outcome;
      const m = sum / n;
      const sim = n === 1 ? 0.40 : calculateDeltaN(prev, m);
      simSums[n - 1] += sim;
      prev = m;
    }
  }

  const avgSim = Array.from(simSums).map(s => s / runs);

  const findThresholdN = (threshold: number, minStep = 2) => {
    for (let i = minStep - 1; i < maxDraws; i++) {
      if (avgSim[i] >= threshold) return i + 1;
    }
    return maxDraws;
  };

  const rawLow = findThresholdN(0.70, 2);
  const rawMod = findThresholdN(0.80, Math.max(3, rawLow + 1));
  const rawHigh = findThresholdN(0.90, Math.max(4, rawMod + 1));

  return {
    low: Math.max(2, rawLow),
    mod: Math.max(rawLow + 1, rawMod),
    high: Math.max(rawMod + 1, rawHigh)
  };
}

import { BatchCalculatedProblem } from '../types/decision';

/**
 * Process a single choice problem to determine sample limits for both options
 */
export function calculateProblemLimits(
  id: string,
  optionA: GambleOption,
  optionB: GambleOption,
  seedOffset = 0
): BatchCalculatedProblem {
  const limitsA = computeGambleThresholds(optionA, 120, 45, 100 + seedOffset);
  const limitsB = computeGambleThresholds(optionB, 120, 45, 200 + seedOffset);

  const evA = optionA.outcome1 * optionA.prob1 + optionA.outcome2 * optionA.prob2;
  const evB = optionB.outcome1 * optionB.prob1 + optionB.outcome2 * optionB.prob2;
  const domain = (evA >= 0 && evB >= 0) ? 'Gain' : 'Loss';
  const evMaximizingOption = evA >= evB ? 'A' : 'B';

  return {
    id,
    domain,
    optionA: { ...optionA, ev: evA },
    optionB: { ...optionB, ev: evB },
    lowLimitA: limitsA.low,
    modLimitA: limitsA.mod,
    highLimitA: limitsA.high,
    lowLimitB: limitsB.low,
    modLimitB: limitsB.mod,
    highLimitB: limitsB.high,
    totalLow: limitsA.low + limitsB.low,
    totalMod: limitsA.mod + limitsB.mod,
    totalHigh: limitsA.high + limitsB.high,
    evA,
    evB,
    evMaximizingOption
  };
}

/**
 * Parse an uploaded CSV of choice problems and compute sample limits
 */
export function parseChoiceProblemsCSV(csvText: string): BatchCalculatedProblem[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const separator = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(separator).map(h => h.replace(/["'\s]/g, '').toLowerCase());

  const getCol = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const idx = headers.indexOf(name.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getCol(['id', 'problemid', 'problem', 'name', 'item']);
  const oA1Idx = getCol(['oa1', 'outcomea', 'outcomea1', 'wina', 'outcome_a']);
  const pA1Idx = getCol(['pa1', 'proba', 'probabilitya', 'prob_a', 'pa']);
  const oA2Idx = getCol(['oa2', 'outcomea2', 'losea']);
  const pA2Idx = getCol(['pa2', 'proba2']);

  const oB1Idx = getCol(['ob1', 'outcomeb', 'outcomeb1', 'winb', 'outcome_b']);
  const pB1Idx = getCol(['pb1', 'probb', 'probabilityb', 'prob_b', 'pb']);
  const oB2Idx = getCol(['ob2', 'outcomeb2', 'loseb']);
  const pB2Idx = getCol(['pb2', 'probb2']);

  const results: BatchCalculatedProblem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue;

    const id = idIdx !== -1 && cols[idIdx] ? cols[idIdx] : `Problem_${i}`;

    const outcomeA1 = oA1Idx !== -1 ? parseFloat(cols[oA1Idx]) : parseFloat(cols[1]);
    let probA1 = pA1Idx !== -1 ? parseFloat(cols[pA1Idx]) : parseFloat(cols[2]);
    if (probA1 > 1.0 && probA1 <= 100) probA1 /= 100;

    const outcomeA2 = oA2Idx !== -1 && cols[oA2Idx] ? parseFloat(cols[oA2Idx]) : 0;
    const probA2 = pA2Idx !== -1 && cols[pA2Idx] ? parseFloat(cols[pA2Idx]) : parseFloat((1 - probA1).toFixed(3));

    const outcomeB1 = oB1Idx !== -1 ? parseFloat(cols[oB1Idx]) : parseFloat(cols[3] || cols[1]);
    let probB1 = pB1Idx !== -1 ? parseFloat(cols[pB1Idx]) : parseFloat(cols[4] || cols[2]);
    if (probB1 > 1.0 && probB1 <= 100) probB1 /= 100;

    const outcomeB2 = oB2Idx !== -1 && cols[oB2Idx] ? parseFloat(cols[oB2Idx]) : 0;
    const probB2 = pB2Idx !== -1 && cols[pB2Idx] ? parseFloat(cols[pB2Idx]) : parseFloat((1 - probB1).toFixed(3));

    if (isNaN(outcomeA1) || isNaN(probA1) || isNaN(outcomeB1) || isNaN(probB1)) continue;

    const optionA: GambleOption = {
      outcome1: outcomeA1,
      prob1: probA1,
      outcome2: outcomeA2,
      prob2: probA2,
      ev: outcomeA1 * probA1 + outcomeA2 * probA2
    };

    const optionB: GambleOption = {
      outcome1: outcomeB1,
      prob1: probB1,
      outcome2: outcomeB2,
      prob2: probB2,
      ev: outcomeB1 * probB1 + outcomeB2 * probB2
    };

    results.push(calculateProblemLimits(id, optionA, optionB, i * 7));
  }

  return results;
}

/**
 * Return a downloadable CSV template for custom gamble batch calculation
 */
export function getChoiceProblemsCSVTemplate(): string {
  return `id,outcomeA,probA,outcomeB,probB
Prob_G1,45,0.60,75,0.35
Prob_G2,30,0.80,60,0.40
Prob_G3,55,0.50,90,0.30
Prob_L1,-40,0.60,-70,0.35
Prob_L2,-25,0.75,-50,0.40
Prob_L3,-50,0.50,-85,0.30`;
}

/**
 * 6 Default Replication Problems ready to test with 1-click
 */
export const DEFAULT_REPLICATION_PROBLEMS = parseChoiceProblemsCSV(getChoiceProblemsCSVTemplate());

/**
 * Export calculated limits to a downloadable research CSV
 */
export function exportCalculatedLimitsCSV(problems: BatchCalculatedProblem[]): string {
  const header = [
    'problem_id',
    'domain',
    'outcomeA',
    'probA',
    'outcomeB',
    'probB',
    'EV_A',
    'EV_B',
    'normative_best',
    'Low_Sim_A_70pct',
    'Low_Sim_B_70pct',
    'Total_Low_nsample',
    'Mod_Sim_A_80pct',
    'Mod_Sim_B_80pct',
    'Total_Mod_nsample',
    'High_Sim_A_90pct',
    'High_Sim_B_90pct',
    'Total_High_nsample'
  ].join(',');

  const rows = problems.map(p => [
    `"${p.id}"`,
    p.domain,
    p.optionA.outcome1,
    p.optionA.prob1,
    p.optionB.outcome1,
    p.optionB.prob1,
    p.evA.toFixed(2),
    p.evB.toFixed(2),
    p.evMaximizingOption,
    p.lowLimitA,
    p.lowLimitB,
    p.totalLow,
    p.modLimitA,
    p.modLimitB,
    p.totalMod,
    p.highLimitA,
    p.highLimitB,
    p.totalHigh
  ].join(','));

  return `${header}\n${rows.join('\n')}`;
}

