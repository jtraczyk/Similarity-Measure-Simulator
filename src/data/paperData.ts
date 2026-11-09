import { ChoiceProblem, PretestedGamble, NumeracyQuestion } from '../types/decision';

/**
 * 18 Empirical Choice Problems from Table 3 in Mondal & Traczyk (page 37)
 * 9 Gain Problems & 9 Loss Problems
 * Stratified into 6 High, 6 Moderate, 6 Low Deliberation
 */
export const TABLE_3_CHOICE_PROBLEMS: ChoiceProblem[] = [
  {
    id: "-72041-26046",
    problemNumber: 1,
    domain: "Loss",
    optionA: { outcome1: -72, prob1: 0.41, outcome2: 0, prob2: 0.59, ev: -29.52 },
    optionB: { outcome1: -26, prob1: 0.46, outcome2: 0, prob2: 0.54, ev: -11.96 },
    deliberation: "Moderate",
    explorationA: 7,
    explorationB: 7,
    totalExploration: 14,
    evA: -29.52,
    evB: -11.96,
    evMaximizingOption: "B",
    evDifference: 17.56,
  },
  {
    id: "-65041-58072",
    problemNumber: 2,
    domain: "Loss",
    optionA: { outcome1: -65, prob1: 0.41, outcome2: 0, prob2: 0.59, ev: -26.65 },
    optionB: { outcome1: -58, prob1: 0.72, outcome2: 0, prob2: 0.28, ev: -41.76 },
    deliberation: "High",
    explorationA: 11,
    explorationB: 8,
    totalExploration: 19,
    evA: -26.65,
    evB: -41.76,
    evMaximizingOption: "A",
    evDifference: 15.11,
  },
  {
    id: "5803648074",
    problemNumber: 3,
    domain: "Gain",
    optionA: { outcome1: 58, prob1: 0.36, outcome2: 0, prob2: 0.64, ev: 20.88 },
    optionB: { outcome1: 48, prob1: 0.74, outcome2: 0, prob2: 0.26, ev: 35.52 },
    deliberation: "Low",
    explorationA: 4,
    explorationB: 3,
    totalExploration: 7,
    evA: 20.88,
    evB: 35.52,
    evMaximizingOption: "B",
    evDifference: 14.64,
  },
  {
    id: "2907213074",
    problemNumber: 4,
    domain: "Gain",
    optionA: { outcome1: 29, prob1: 0.72, outcome2: 0, prob2: 0.28, ev: 20.88 },
    optionB: { outcome1: 13, prob1: 0.74, outcome2: 0, prob2: 0.26, ev: 9.62 },
    deliberation: "Low",
    explorationA: 2,
    explorationB: 2,
    totalExploration: 4,
    evA: 20.88,
    evB: 9.62,
    evMaximizingOption: "A",
    evDifference: 11.26,
  },
  {
    id: "4904720064",
    problemNumber: 5,
    domain: "Gain",
    optionA: { outcome1: 49, prob1: 0.47, outcome2: 0, prob2: 0.53, ev: 23.03 },
    optionB: { outcome1: 20, prob1: 0.64, outcome2: 0, prob2: 0.36, ev: 12.8 },
    deliberation: "Moderate",
    explorationA: 7,
    explorationB: 5,
    totalExploration: 12,
    evA: 23.03,
    evB: 12.8,
    evMaximizingOption: "A",
    evDifference: 10.23,
  },
  {
    id: "430752037",
    problemNumber: 6,
    domain: "Gain",
    optionA: { outcome1: 43, prob1: 0.7, outcome2: 0, prob2: 0.3, ev: 30.1 },
    optionB: { outcome1: 52, prob1: 0.37, outcome2: 0, prob2: 0.63, ev: 19.24 },
    deliberation: "Low",
    explorationA: 2,
    explorationB: 4,
    totalExploration: 6,
    evA: 30.1,
    evB: 19.24,
    evMaximizingOption: "A",
    evDifference: 10.86,
  },
  {
    id: "2705950056",
    problemNumber: 7,
    domain: "Gain",
    optionA: { outcome1: 27, prob1: 0.59, outcome2: 0, prob2: 0.41, ev: 15.93 },
    optionB: { outcome1: 50, prob1: 0.56, outcome2: 0, prob2: 0.44, ev: 28.0 },
    deliberation: "High",
    explorationA: 8,
    explorationB: 8,
    totalExploration: 16,
    evA: 15.93,
    evB: 28.0,
    evMaximizingOption: "B",
    evDifference: 12.07,
  },
  {
    id: "-73043-24061",
    problemNumber: 8,
    domain: "Loss",
    optionA: { outcome1: -73, prob1: 0.43, outcome2: 0, prob2: 0.57, ev: -31.39 },
    optionB: { outcome1: -24, prob1: 0.61, outcome2: 0, prob2: 0.39, ev: -14.64 },
    deliberation: "Moderate",
    explorationA: 5,
    explorationB: 4,
    totalExploration: 9,
    evA: -31.39,
    evB: -14.64,
    evMaximizingOption: "B",
    evDifference: 16.75,
  },
  {
    id: "-5003-36071",
    problemNumber: 9,
    domain: "Loss",
    optionA: { outcome1: -50, prob1: 0.3, outcome2: 0, prob2: 0.7, ev: -15.0 },
    optionB: { outcome1: -36, prob1: 0.71, outcome2: 0, prob2: 0.29, ev: -25.56 },
    deliberation: "Low",
    explorationA: 3,
    explorationB: 3,
    totalExploration: 6,
    evA: -15.0,
    evB: -25.56,
    evMaximizingOption: "A",
    evDifference: 10.56,
  },
  {
    id: "170460031",
    problemNumber: 10,
    domain: "Gain",
    optionA: { outcome1: 17, prob1: 0.4, outcome2: 0, prob2: 0.6, ev: 6.8 },
    optionB: { outcome1: 60, prob1: 0.31, outcome2: 0, prob2: 0.69, ev: 18.6 },
    deliberation: "Moderate",
    explorationA: 7,
    explorationB: 4,
    totalExploration: 11,
    evA: 6.8,
    evB: 18.6,
    evMaximizingOption: "B",
    evDifference: 11.8,
  },
  {
    id: "1506142057",
    problemNumber: 11,
    domain: "Gain",
    optionA: { outcome1: 15, prob1: 0.61, outcome2: 0, prob2: 0.39, ev: 9.15 },
    optionB: { outcome1: 42, prob1: 0.57, outcome2: 0, prob2: 0.43, ev: 23.94 },
    deliberation: "High",
    explorationA: 10,
    explorationB: 9,
    totalExploration: 19,
    evA: 9.15,
    evB: 23.94,
    evMaximizingOption: "B",
    evDifference: 14.79,
  },
  {
    id: "-5403-44071",
    problemNumber: 12,
    domain: "Loss",
    optionA: { outcome1: -54, prob1: 0.3, outcome2: 0, prob2: 0.7, ev: -16.2 },
    optionB: { outcome1: -44, prob1: 0.71, outcome2: 0, prob2: 0.29, ev: -31.24 },
    deliberation: "Low",
    explorationA: 5,
    explorationB: 3,
    totalExploration: 8,
    evA: -16.2,
    evB: -31.24,
    evMaximizingOption: "A",
    evDifference: 15.04,
  },
  {
    id: "-36075-39043",
    problemNumber: 13,
    domain: "Loss",
    optionA: { outcome1: -36, prob1: 0.75, outcome2: 0, prob2: 0.25, ev: -27.0 },
    optionB: { outcome1: -39, prob1: 0.43, outcome2: 0, prob2: 0.57, ev: -16.77 },
    deliberation: "Moderate",
    explorationA: 3,
    explorationB: 6,
    totalExploration: 9,
    evA: -27.0,
    evB: -16.77,
    evMaximizingOption: "B",
    evDifference: 10.23,
  },
  {
    id: "7004661071",
    problemNumber: 14,
    domain: "Gain",
    optionA: { outcome1: 70, prob1: 0.46, outcome2: 0, prob2: 0.54, ev: 32.2 },
    optionB: { outcome1: 61, prob1: 0.71, outcome2: 0, prob2: 0.29, ev: 43.31 },
    deliberation: "Moderate",
    explorationA: 5,
    explorationB: 3,
    totalExploration: 8,
    evA: 32.2,
    evB: 43.31,
    evMaximizingOption: "B",
    evDifference: 11.11,
  },
  {
    id: "-24059-69047",
    problemNumber: 15,
    domain: "Loss",
    optionA: { outcome1: -24, prob1: 0.59, outcome2: 0, prob2: 0.41, ev: -14.16 },
    optionB: { outcome1: -69, prob1: 0.47, outcome2: 0, prob2: 0.53, ev: -32.43 },
    deliberation: "High",
    explorationA: 10,
    explorationB: 12,
    totalExploration: 22,
    evA: -14.16,
    evB: -32.43,
    evMaximizingOption: "A",
    evDifference: 18.27,
  },
  {
    id: "-21059-40056",
    problemNumber: 16,
    domain: "Loss",
    optionA: { outcome1: -21, prob1: 0.59, outcome2: 0, prob2: 0.41, ev: -12.39 },
    optionB: { outcome1: -40, prob1: 0.56, outcome2: 0, prob2: 0.44, ev: -22.4 },
    deliberation: "High",
    explorationA: 10,
    explorationB: 10,
    totalExploration: 20,
    evA: -12.39,
    evB: -22.4,
    evMaximizingOption: "A",
    evDifference: 10.01,
  },
  {
    id: "-26073-69043",
    problemNumber: 17,
    domain: "Loss",
    optionA: { outcome1: -26, prob1: 0.73, outcome2: 0, prob2: 0.27, ev: -18.98 },
    optionB: { outcome1: -69, prob1: 0.43, outcome2: 0, prob2: 0.57, ev: -29.67 },
    deliberation: "Low",
    explorationA: 3,
    explorationB: 4,
    totalExploration: 7,
    evA: -18.98,
    evB: -29.67,
    evMaximizingOption: "A",
    evDifference: 10.69,
  },
  {
    id: "1807337072",
    problemNumber: 18,
    domain: "Gain",
    optionA: { outcome1: 18, prob1: 0.73, outcome2: 0, prob2: 0.27, ev: 13.14 },
    optionB: { outcome1: 37, prob1: 0.72, outcome2: 0, prob2: 0.28, ev: 26.64 },
    deliberation: "High",
    explorationA: 7,
    explorationB: 6,
    totalExploration: 13,
    evA: 13.14,
    evB: 26.64,
    evMaximizingOption: "B",
    evDifference: 13.5,
  },
];

/**
 * 3 Attention-check problems from Table 4 (page 37)
 */
export const ATTENTION_CHECK_PROBLEMS = [
  {
    id: "ATTN-1",
    domain: "Loss" as const,
    optionA: { outcome1: -45, prob1: 0.7, outcome2: 0, prob2: 0.3, ev: -31.5 },
    optionB: { outcome1: 0, prob1: 1.0, outcome2: 0, prob2: 0.0, ev: 0 },
    deliberation: "Attention Check",
    explorationA: 8,
    explorationB: 8,
    totalExploration: 16,
    evMaximizingOption: "B" as const, // 0 is better than -31.5
    dominantExplanation: "Option B yields 0 for sure, while Option A risks losing 45 points with 70% probability."
  },
  {
    id: "ATTN-2",
    domain: "Gain" as const,
    optionA: { outcome1: 20, prob1: 0.2, outcome2: 0, prob2: 0.8, ev: 4.0 },
    optionB: { outcome1: 30, prob1: 1.0, outcome2: 0, prob2: 0.0, ev: 30.0 },
    deliberation: "Attention Check",
    explorationA: 8,
    explorationB: 8,
    totalExploration: 16,
    evMaximizingOption: "B" as const, // 30 for sure is strictly superior to 20 with 20%
    dominantExplanation: "Option B gives 30 points with 100% certainty, dominating Option A."
  },
  {
    id: "ATTN-3",
    domain: "Loss" as const,
    optionA: { outcome1: 0, prob1: 1.0, outcome2: 0, prob2: 0.0, ev: 0 },
    optionB: { outcome1: -30, prob1: 0.5, outcome2: 0, prob2: 0.5, ev: -15.0 },
    deliberation: "Attention Check",
    explorationA: 8,
    explorationB: 8,
    totalExploration: 16,
    evMaximizingOption: "A" as const, // 0 for sure is strictly superior to losing 30 with 50%
    dominantExplanation: "Option A gives 0 for sure, while Option B has 50% chance of losing 30 points."
  }
];

/**
 * 30 Pretested Gambles from Gamble_A_Deliberation & Gamble_B_Deliberation CSV files
 * (15 Gain problems and 15 Loss problems)
 */
export const PRETESTED_GAMBLES: PretestedGamble[] = [
  { id: "1807337072", domain: "Gain", lowDelA: 2, modDelA: 3, highDelA: 7, lowDelB: 2, modDelB: 4, highDelB: 6 },
  { id: "1506142057", domain: "Gain", lowDelA: 4, modDelA: 6, highDelA: 10, lowDelB: 4, modDelB: 4, highDelB: 9 },
  { id: "170460031", domain: "Gain", lowDelA: 4, modDelA: 7, highDelA: 16, lowDelB: 3, modDelB: 4, highDelB: 17 },
  { id: "2907213074", domain: "Gain", lowDelA: 2, modDelA: 3, highDelA: 6, lowDelB: 2, modDelB: 4, highDelB: 5 },
  { id: "3407539039", domain: "Gain", lowDelA: 3, modDelA: 4, highDelA: 6, lowDelB: 4, modDelB: 7, highDelB: 12 },
  { id: "2705950056", domain: "Gain", lowDelA: 3, modDelA: 6, highDelA: 8, lowDelB: 3, modDelB: 5, highDelB: 8 },
  { id: "2805769055", domain: "Gain", lowDelA: 4, modDelA: 5, highDelA: 9, lowDelB: 4, modDelB: 6, highDelB: 12 },
  { id: "4904720064", domain: "Gain", lowDelA: 4, modDelA: 7, highDelA: 12, lowDelB: 2, modDelB: 5, highDelB: 9 },
  { id: "5505728074", domain: "Gain", lowDelA: 3, modDelA: 6, highDelA: 9, lowDelB: 2, modDelB: 4, highDelB: 7 },
  { id: "430752037", domain: "Gain", lowDelA: 2, modDelA: 3, highDelA: 5, lowDelB: 4, modDelB: 7, highDelB: 16 },
  { id: "4406173054", domain: "Gain", lowDelA: 3, modDelA: 5, highDelA: 11, lowDelB: 3, modDelB: 6, highDelB: 11 },
  { id: "630723073", domain: "Gain", lowDelA: 3, modDelA: 4, highDelA: 6, lowDelB: 2, modDelB: 3, highDelB: 8 },
  { id: "7104529046", domain: "Gain", lowDelA: 4, modDelA: 7, highDelA: 12, lowDelB: 4, modDelB: 5, highDelB: 11 },
  { id: "5803648074", domain: "Gain", lowDelA: 4, modDelA: 9, highDelA: 15, lowDelB: 3, modDelB: 4, highDelB: 7 },
  { id: "7004661071", domain: "Gain", lowDelA: 3, modDelA: 5, highDelA: 12, lowDelB: 2, modDelB: 3, highDelB: 7 },
  { id: "-21059-40056", domain: "Loss", lowDelA: 4, modDelA: 4, highDelA: 10, lowDelB: 3, modDelB: 5, highDelB: 10 },
  { id: "-17062-54041", domain: "Loss", lowDelA: 3, modDelA: 6, highDelA: 10, lowDelB: 5, modDelB: 7, highDelB: 12 },
  { id: "-24059-69047", domain: "Loss", lowDelA: 2, modDelA: 5, highDelA: 10, lowDelB: 4, modDelB: 6, highDelB: 12 },
  { id: "-36065-18071", domain: "Loss", lowDelA: 3, modDelA: 4, highDelA: 7, lowDelB: 3, modDelB: 4, highDelB: 5 },
  { id: "-36075-39043", domain: "Loss", lowDelA: 2, modDelA: 3, highDelA: 6, lowDelB: 4, modDelB: 6, highDelB: 10 },
  { id: "-33074-4803", domain: "Loss", lowDelA: 2, modDelA: 2, highDelA: 5, lowDelB: 5, modDelB: 7, highDelB: 17 },
  { id: "-26073-69043", domain: "Loss", lowDelA: 3, modDelA: 3, highDelA: 6, lowDelB: 4, modDelB: 6, highDelB: 12 },
  { id: "-50069-2407", domain: "Loss", lowDelA: 2, modDelA: 3, highDelA: 6, lowDelB: 4, modDelB: 4, highDelB: 7 },
  { id: "-5003-36071", domain: "Loss", lowDelA: 3, modDelA: 4, highDelA: 17, lowDelB: 3, modDelB: 4, highDelB: 7 },
  { id: "-5403-44071", domain: "Loss", lowDelA: 5, modDelA: 5, highDelA: 14, lowDelB: 3, modDelB: 3, highDelB: 9 },
  { id: "-55069-66034", domain: "Loss", lowDelA: 2, modDelA: 3, highDelA: 7, lowDelB: 5, modDelB: 8, highDelB: 14 },
  { id: "-73043-24061", domain: "Loss", lowDelA: 4, modDelA: 5, highDelA: 15, lowDelB: 3, modDelB: 4, highDelB: 8 },
  { id: "-72041-26046", domain: "Loss", lowDelA: 4, modDelA: 7, highDelA: 12, lowDelB: 4, modDelB: 7, highDelB: 11 },
  { id: "-57031-41071", domain: "Loss", lowDelA: 4, modDelA: 5, highDelA: 13, lowDelB: 3, modDelB: 4, highDelB: 6 },
  { id: "-65041-58072", domain: "Loss", lowDelA: 4, modDelA: 6, highDelA: 11, lowDelB: 2, modDelB: 4, highDelB: 8 },
];

/**
 * Empirical Findings reported across the three studies in the paper
 */
export const EMPIRICAL_STUDIES_RESULTS = {
  study1: {
    title: "Study 1: Voluntary Exploration (DfE)",
    description: "Participants freely chose which gamble to explore and when to switch until sampling limits were met (N = 192).",
    participants: 192,
    highNumeracyN: 110,
    lowNumeracyN: 82,
    rmAnova: {
      f: "25.57",
      df: "1.96, 373.42",
      p: "< .001",
      etaP2: 0.12,
      correction: "Huynh-Feldt"
    },
    linearTrend: {
      t: "-7.52",
      df: 190,
      p: "< .001",
      d: -0.69,
      contrastEst: -0.14,
      contrastSE: 0.02
    },
    accuracyByGroup: [
      { deliberation: "Low", HighNumeracy: 0.65, LowNumeracy: 0.62, Overall: 0.64, seHigh: 0.02, seLow: 0.02 },
      { deliberation: "Moderate", HighNumeracy: 0.69, LowNumeracy: 0.64, Overall: 0.67, seHigh: 0.02, seLow: 0.02 },
      { deliberation: "High", HighNumeracy: 0.79, LowNumeracy: 0.75, Overall: 0.77, seHigh: 0.016, seLow: 0.022 }
    ],
    pairwiseComparisons: [
      { comparison: "High – Low", diff: 0.132, se: 0.018, t: 7.292, d: 0.650, pBonf: "< .001" },
      { comparison: "High – Moderate", diff: 0.107, se: 0.019, t: 5.512, d: 0.528, pBonf: "< .001" },
      { comparison: "Moderate – Low", diff: 0.025, se: 0.021, t: 1.169, d: 0.122, pBonf: ".732" }
    ],
    confidence: {
      high: 6.41,
      mod: 6.22,
      low: 6.39,
      corrWithExperiencedProb: 0.19,
      corrP: "< .001",
      takeaway: "Confidence did not differ across deliberation conditions, but was driven by experienced outcome certainty (r = .19)."
    }
  },
  study2: {
    title: "Study 2: Involuntary Piecewise Exploration (DfE)",
    description: "Replication with predetermined sequential outcome streams to rule out search strategy / switching confounds (N = 123).",
    participants: 123,
    highNumeracyN: 63,
    lowNumeracyN: 60,
    rmAnova: {
      f: "22.62",
      df: "2, 244",
      p: "< .001",
      etaP2: 0.16,
      correction: "Huynh-Feldt"
    },
    linearTrend: {
      t: "-5.82",
      df: 121,
      p: "< .001",
      d: -0.67,
      contrastEst: -0.12,
      contrastSE: 0.02
    },
    accuracyByGroup: [
      { deliberation: "Low", HighNumeracy: 0.66, LowNumeracy: 0.63, Overall: 0.65, seHigh: 0.021, seLow: 0.022 },
      { deliberation: "Moderate", HighNumeracy: 0.64, LowNumeracy: 0.66, Overall: 0.65, seHigh: 0.025, seLow: 0.023 },
      { deliberation: "High", HighNumeracy: 0.75, LowNumeracy: 0.79, Overall: 0.77, seHigh: 0.020, seLow: 0.021 }
    ],
    pairwiseComparisons: [
      { comparison: "High – Low", diff: 0.128, se: 0.023, t: 5.688, d: 0.733, pBonf: "< .001" },
      { comparison: "High – Moderate", diff: 0.127, se: 0.020, t: 6.323, d: 0.724, pBonf: "< .001" },
      { comparison: "Moderate – Low", diff: -0.001, se: 0.023, t: -0.064, d: -0.008, pBonf: "1.000" }
    ]
  },
  study3: {
    title: "Study 3: Decision from Description (DfD) vs. Description plus Experience (DpE)",
    description: "Disentangling deliberation time from exploration experience across N = 285 participants (149 DfD vs. 136 DpE).",
    participants: 285,
    dfdCount: 149,
    dpeCount: 136,
    rmAnova: {
      f: "40.76",
      df: "1.96, 555.27",
      p: "< .001",
      etaP2: 0.13,
      correction: "Huynh-Feldt"
    },
    accuracyByFormat: [
      { deliberation: "Low", DfD: 0.86, DpE: 0.83 },
      { deliberation: "Moderate", DfD: 0.82, DpE: 0.81 },
      { deliberation: "High", DfD: 0.92, DpE: 0.89 }
    ],
    interactionLinear: {
      t: "-5.60",
      df: 283,
      p: "< .001",
      estimate: -0.063,
      note: "Significantly steeper linear accuracy boost in DpE condition than in DfD."
    }
  }
};

/**
 * 7 Numeracy Test Items (Schwartz 3-item + Berlin Numeracy Test 4-item)
 */
export const NUMERACY_QUESTIONS: NumeracyQuestion[] = [
  {
    id: "schwartz-1",
    source: "Schwartz",
    question: "Imagine that we roll a fair, six-sided die 1,000 times. Out of 1,000 rolls, how many times on average would you expect to roll an even number (2, 4, or 6)?",
    options: ["250", "333", "500", "600"],
    correctAnswer: "500",
    explanation: "A standard die has 3 even numbers out of 6 sides (50% probability). 0.50 * 1,000 = 500."
  },
  {
    id: "schwartz-2",
    source: "Schwartz",
    question: "In the BIG BUCKS LOTTERY, the chances of winning a $10.00 prize are 1%. What is your best guess about how many people would win a $10.00 prize if 1,000 people each buy a single ticket?",
    options: ["1 person", "10 people", "100 people", "1000 people"],
    correctAnswer: "10 people",
    explanation: "1% of 1,000 is 0.01 * 1000 = 10 people."
  },
  {
    id: "schwartz-3",
    source: "Schwartz",
    question: "In the ACME PUBLISHING SWEEPSTAKES, the chance of winning a car is 1 in 1,000. What percent of tickets to ACME PUBLISHING SWEEPSTAKES win a car?",
    options: ["0.01%", "0.1%", "1.0%", "10%"],
    correctAnswer: "0.1%",
    explanation: "1 in 1,000 = 1/1000 = 0.001 = 0.1%."
  },
  {
    id: "bnt-1",
    source: "BNT",
    question: "Imagine we are tossing a loaded die (6 sides). The probability that the die lands on 6 is twice as high as for each of the other 5 numbers. Out of 70 throws, how many times would you expect the die to land on 6?",
    options: ["10 times", "14 times", "20 times", "24 times"],
    correctAnswer: "20 times",
    explanation: "Let p be probability of each number 1-5. Probability of 6 is 2p. Total probability = 5p + 2p = 7p = 1 => p = 1/7. Probability of 6 is 2/7. In 70 throws: 70 * (2/7) = 20."
  },
  {
    id: "bnt-2",
    source: "BNT",
    question: "In a forest, 20% of mushrooms are red, 50% are brown, and 30% are white. A red mushroom is poisonous with a probability of 20%. A mushroom that is not red is poisonous with a probability of 5%. What is the probability that a poisonous mushroom in the forest is red?",
    options: ["20%", "40%", "50%", "60%"],
    correctAnswer: "50%",
    explanation: "P(Red) = 0.20, P(Poisonous|Red) = 0.20 => P(Red & Poison) = 0.04. P(Not Red) = 0.80, P(Poisonous|Not Red) = 0.05 => P(Not Red & Poison) = 0.04. Total poisonous = 0.04 + 0.04 = 0.08. P(Red | Poison) = 0.04 / 0.08 = 50%."
  },
  {
    id: "bnt-3",
    source: "BNT",
    question: "An infection affects 10 out of every 1,000 people in a population. A test detects the infection in 99% of people who have it, but has a 5% false-positive rate. If a randomly tested person tests positive, what is the best estimate of their actual chance of being infected?",
    options: ["About 95%", "About 50%", "About 17%", "About 2%"],
    correctAnswer: "About 17%",
    explanation: "In 10,000 people: 100 infected, 9,900 healthy. True positives = 99% of 100 = 99. False positives = 5% of 9,900 = 495. Total positives = 594. P(Infected | Positive) = 99 / 594 ≈ 16.7%."
  },
  {
    id: "bnt-4",
    source: "BNT",
    question: "In a town with 105 inhabitants, each person is infected with a bacterium. A cure works with a 30% probability after one pill. If every resident takes 1 pill, on average how many will remain sick?",
    options: ["31 or 32", "73 or 74", "35", "70"],
    correctAnswer: "73 or 74",
    explanation: "If 30% are cured, 70% remain sick. 0.70 * 105 = 73.5 people (approx 73 or 74)."
  }
];
