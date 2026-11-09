/**
 * Types for the Decision-Making Deliberation & Similarity Measure Simulator
 * Grounded in Mondal & Traczyk (SWPS University) research paper.
 */

export type DeliberationLevel = 'Low' | 'Moderate' | 'High';

export type DomainType = 'Gain' | 'Loss';

export interface GambleOption {
  outcome1: number;
  prob1: number;
  outcome2: number;
  prob2: number;
  ev: number;
}

export interface ChoiceProblem {
  id: string;
  problemNumber: number;
  domain: DomainType;
  optionA: GambleOption;
  optionB: GambleOption;
  deliberation: DeliberationLevel;
  explorationA: number;
  explorationB: number;
  totalExploration: number;
  evA: number;
  evB: number;
  evMaximizingOption: 'A' | 'B';
  evDifference: number; // |EV(A) - EV(B)|
}

export interface PretestedGamble {
  id: string;
  domain: DomainType;
  lowDelA: number;
  modDelA: number;
  highDelA: number;
  lowDelB: number;
  modDelB: number;
  highDelB: number;
  optionADesc?: string;
  optionBDesc?: string;
}

export interface AlgorithmicAssignmentRow {
  rowNum: number;
  id: string;
  domain: DomainType;
  deliberation: DeliberationLevel;
  similarityA: number;
  similarityB: number;
  nsample: number;
  evA?: number;
  evB?: number;
  bestOption?: 'A' | 'B';
}

export interface DrawStep {
  step: number;
  outcome: number;
  sampleMean: number;
  prevMean: number;
  deltaPercent: number;
  similarity: number; // delta(n)
}

export interface SimulationTrajectory {
  runId: number;
  steps: DrawStep[];
  reachedLowAt: number | null;
  reachedModAt: number | null;
  reachedHighAt: number | null;
  finalMean: number;
  trueEV: number;
}

export interface BatchCalculatedProblem {
  id: string;
  domain: DomainType;
  optionA: GambleOption;
  optionB: GambleOption;
  lowLimitA: number;
  modLimitA: number;
  highLimitA: number;
  lowLimitB: number;
  modLimitB: number;
  highLimitB: number;
  totalLow: number;
  totalMod: number;
  totalHigh: number;
  evA: number;
  evB: number;
  evMaximizingOption: 'A' | 'B';
}

export interface NumeracyQuestion {
  id: string;
  source: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}
