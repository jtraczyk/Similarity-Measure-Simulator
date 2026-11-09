import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Check, HelpCircle, ArrowRight, Award, Zap, Shuffle } from 'lucide-react';
import { ChoiceProblem, DeliberationLevel } from '../types/decision';
import { TABLE_3_CHOICE_PROBLEMS, ATTENTION_CHECK_PROBLEMS } from '../data/paperData';
import { drawFromGamble, calculateDeltaN } from '../utils/simulation';

export const ExperimentTaskRunner: React.FC = () => {
  // Problem selection
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [studyMode, setStudyMode] = useState<'study1_voluntary' | 'study2_piecewise' | 'study3_dpe'>('study1_voluntary');

  const currentProblem: ChoiceProblem = TABLE_3_CHOICE_PROBLEMS[selectedProblemIndex];

  // Experiment state
  // Phase: 'viewing' (exploration) | 'decision' | 'feedback'
  const [phase, setPhase] = useState<'viewing' | 'decision' | 'feedback'>('viewing');

  // Sampling counters
  const [drawsA, setDrawsA] = useState<number>(0);
  const [drawsB, setDrawsB] = useState<number>(0);
  const [switchesCount, setSwitchesCount] = useState<number>(0);
  const [lastOptionDrawn, setLastOptionDrawn] = useState<'A' | 'B' | null>(null);

  // Real-time flash outcome
  const [flashedOutcome, setFlashedOutcome] = useState<{ option: 'A' | 'B'; val: number } | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Accumulated points in exploration
  const [accumulatedPoints, setAccumulatedPoints] = useState<number>(0);

  // Running sample means and similarities
  const [samplesHistoryA, setSamplesHistoryA] = useState<number[]>([]);
  const [samplesHistoryB, setSamplesHistoryB] = useState<number[]>([]);

  // Decision & Confidence
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<number>(5);
  const [finalDecisionOutcome, setFinalDecisionOutcome] = useState<number | null>(null);

  // Piecewise auto-player for Study 2
  const [isAutoPlayingPiecewise, setIsAutoPlayingPiecewise] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Target required exploration limits
  const targetA = currentProblem.explorationA;
  const targetB = currentProblem.explorationB;
  const totalTarget = currentProblem.totalExploration;
  const currentTotalDraws = drawsA + drawsB;
  const isTargetReached = drawsA >= targetA && drawsB >= targetB;

  // Running mean & delta calculations
  const meanA = samplesHistoryA.length > 0
    ? samplesHistoryA.reduce((a, b) => a + b, 0) / samplesHistoryA.length
    : 0;
  const meanB = samplesHistoryB.length > 0
    ? samplesHistoryB.reduce((a, b) => a + b, 0) / samplesHistoryB.length
    : 0;

  const prevMeanA = samplesHistoryA.length > 1
    ? samplesHistoryA.slice(0, -1).reduce((a, b) => a + b, 0) / (samplesHistoryA.length - 1)
    : 0;
  const prevMeanB = samplesHistoryB.length > 1
    ? samplesHistoryB.slice(0, -1).reduce((a, b) => a + b, 0) / (samplesHistoryB.length - 1)
    : 0;

  const currentDeltaA = samplesHistoryA.length > 1 ? calculateDeltaN(prevMeanA, meanA) : 0.5;
  const currentDeltaB = samplesHistoryB.length > 1 ? calculateDeltaN(prevMeanB, meanB) : 0.5;

  // Reset trial state when problem changes or upon manual reset
  const resetTrial = () => {
    setPhase('viewing');
    setDrawsA(0);
    setDrawsB(0);
    setSwitchesCount(0);
    setLastOptionDrawn(null);
    setFlashedOutcome(null);
    setIsFlashing(false);
    setAccumulatedPoints(0);
    setSamplesHistoryA([]);
    setSamplesHistoryB([]);
    setSelectedChoice(null);
    setConfidenceRating(5);
    setFinalDecisionOutcome(null);
    setIsAutoPlayingPiecewise(false);
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
  };

  useEffect(() => {
    resetTrial();
  }, [selectedProblemIndex, studyMode]);

  // Execute a draw from Option A or B
  const handleDraw = (option: 'A' | 'B') => {
    if (phase !== 'viewing' || isFlashing) return;

    if (option === 'A' && drawsA >= targetA && studyMode !== 'study1_voluntary') return;
    if (option === 'B' && drawsB >= targetB && studyMode !== 'study1_voluntary') return;

    // Track switching ratio (Study 1 & 2 metric)
    if (lastOptionDrawn && lastOptionDrawn !== option) {
      setSwitchesCount(prev => prev + 1);
    }
    setLastOptionDrawn(option);

    const outcome = option === 'A'
      ? drawFromGamble(currentProblem.optionA)
      : drawFromGamble(currentProblem.optionB);

    setIsFlashing(true);
    setFlashedOutcome({ option, val: outcome });
    setAccumulatedPoints(prev => prev + outcome);

    if (option === 'A') {
      setDrawsA(prev => prev + 1);
      setSamplesHistoryA(prev => [...prev, outcome]);
    } else {
      setDrawsB(prev => prev + 1);
      setSamplesHistoryB(prev => [...prev, outcome]);
    }

    // 400ms flash display duration as specified in the paper (page 13)
    setTimeout(() => {
      setIsFlashing(false);
    }, 400);
  };

  // Check if both quotas reached to transition to Decision Phase
  useEffect(() => {
    if (phase === 'viewing' && drawsA >= targetA && drawsB >= targetB) {
      const timer = setTimeout(() => {
        setPhase('decision');
        setIsAutoPlayingPiecewise(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [drawsA, drawsB, targetA, targetB, phase]);

  // Automated piecewise streamer for Study 2
  useEffect(() => {
    if (isAutoPlayingPiecewise && phase === 'viewing') {
      autoPlayTimerRef.current = window.setInterval(() => {
        if (drawsA < targetA && (drawsA <= drawsB || drawsB >= targetB)) {
          handleDraw('A');
        } else if (drawsB < targetB) {
          handleDraw('B');
        } else {
          setIsAutoPlayingPiecewise(false);
        }
      }, 700);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlayingPiecewise, phase, drawsA, drawsB, targetA, targetB]);

  // Final choice submission
  const handleSubmitChoice = (choice: 'A' | 'B') => {
    setSelectedChoice(choice);
  };

  const handleConfirmDecision = () => {
    if (!selectedChoice) return;
    const finalOutcome = selectedChoice === 'A'
      ? drawFromGamble(currentProblem.optionA)
      : drawFromGamble(currentProblem.optionB);
    setFinalDecisionOutcome(finalOutcome);
    setAccumulatedPoints(prev => prev + finalOutcome);
    setPhase('feedback');
  };

  const isEVConsistent = selectedChoice === currentProblem.evMaximizingOption;
  const switchingRatio = currentTotalDraws > 1 ? switchesCount / (currentTotalDraws - 1) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                Participant Experience Simulator
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-mono">
                400ms Payoff Presentation (DfE)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Decision from Experience (DfE) Experimental Task
            </h3>
            <p className="text-xs text-slate-500">
              Experience the identical task administered to N = 600 participants across Study 1, Study 2, and Study 3
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={resetTrial}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Problem</span>
            </button>

            <button
              onClick={() => {
                setSelectedProblemIndex((prev) => (prev + 1) % TABLE_3_CHOICE_PROBLEMS.length);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors"
            >
              <span>Next Problem</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Parameters Selector */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Problem (Table 3)
            </label>
            <select
              value={selectedProblemIndex}
              onChange={(e) => setSelectedProblemIndex(Number(e.target.value))}
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {TABLE_3_CHOICE_PROBLEMS.map((p, idx) => (
                <option key={p.id} value={idx}>
                  Problem {p.problemNumber}: {p.domain} Domain ({p.deliberation} Deliberation)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Experimental Paradigm Format
            </label>
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as any)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="study1_voluntary">Study 1: Voluntary Exploration (Click &amp; Switch Freely)</option>
              <option value="study2_piecewise">Study 2: Piecewise Involuntary (Computer Stream)</option>
              <option value="study3_dpe">Study 3: Description plus Experience (Explicit Probs + Samples)</option>
            </select>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Required Sampling</span>
              <span className="font-mono font-bold text-slate-900">
                A: {targetA} draws · B: {targetB} draws (Total: {totalTarget})
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              currentProblem.deliberation === 'High' ? 'bg-indigo-100 text-indigo-700' : currentProblem.deliberation === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
            }`}>
              {currentProblem.deliberation} (δ = {currentProblem.deliberation === 'High' ? '90%' : currentProblem.deliberation === 'Moderate' ? '80%' : '70%'})
            </span>
          </div>
        </div>
      </div>

      {/* Experimental Screen Container */}
      <div className="bg-slate-900 rounded-xl p-8 text-white relative shadow-md min-h-[460px] flex flex-col justify-between">
        {/* Screen Header Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-300">
              Problem {currentProblem.problemNumber} of 18
            </span>
            <span>·</span>
            <span className={`font-medium ${currentProblem.domain === 'Gain' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentProblem.domain} Domain
            </span>
          </div>

          <div className="font-mono text-xs">
            Phase: <span className="font-bold text-indigo-400 uppercase tracking-wider">{phase}</span>
          </div>
        </div>

        {/* PHASE 1: VIEWING & EXPLORATION PHASE */}
        {phase === 'viewing' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-6">
            <div className="text-center max-w-lg">
              <h4 className="text-base font-semibold text-slate-100">
                {studyMode === 'study2_piecewise'
                  ? 'Please observe the stream of outcomes until sampling limits are met'
                  : 'Please explore Option A and Option B by clicking on the boxes below'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {studyMode === 'study3_dpe'
                  ? 'Both explicit probabilities and exploration outcomes are provided.'
                  : 'Outcomes will flash for 400 milliseconds to simulate visual sensory encoding.'}
              </p>
            </div>

            {/* Study 3 DpE Explicit Probabilities Header (if active) */}
            {studyMode === 'study3_dpe' && (
              <div className="grid grid-cols-2 gap-8 w-full max-w-lg text-center text-xs font-mono bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <div>
                  <div className="text-slate-400 mb-1">Option A Description:</div>
                  <div className="text-slate-200">
                    {currentProblem.optionA.prob1 * 100}% chance of {currentProblem.optionA.outcome1} pts
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {currentProblem.optionA.prob2 * 100}% chance of 0 pts
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Option B Description:</div>
                  <div className="text-slate-200">
                    {currentProblem.optionB.prob1 * 100}% chance of {currentProblem.optionB.outcome1} pts
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {currentProblem.optionB.prob2 * 100}% chance of 0 pts
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Gamble Boxes */}
            <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
              {/* Box A */}
              <button
                onClick={() => handleDraw('A')}
                disabled={studyMode === 'study2_piecewise' || isFlashing || drawsA >= targetA}
                className={`h-40 rounded-xl border-2 flex flex-col items-center justify-center p-4 transition-all relative ${
                  flashedOutcome?.option === 'A' && isFlashing
                    ? 'bg-indigo-600 border-indigo-400 scale-102 shadow-lg'
                    : drawsA >= targetA
                    ? 'bg-slate-800/40 border-slate-700 text-slate-500 opacity-80 cursor-default'
                    : 'bg-slate-800/90 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 cursor-pointer shadow-sm'
                }`}
              >
                {flashedOutcome?.option === 'A' && isFlashing ? (
                  <div className="text-center animate-pulse">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {flashedOutcome.val > 0 ? `+${flashedOutcome.val}` : flashedOutcome.val}
                    </span>
                    <span className="text-[10px] block text-indigo-200 font-mono mt-1">pts</span>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-bold text-slate-200">Option A</span>
                    <div className="mt-2 text-xs font-mono text-slate-400">
                      Sampled: <span className="text-indigo-400 font-bold">{drawsA}</span> / {targetA}
                    </div>
                    {drawsA >= targetA && (
                      <span className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Target Complete
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Box B */}
              <button
                onClick={() => handleDraw('B')}
                disabled={studyMode === 'study2_piecewise' || isFlashing || drawsB >= targetB}
                className={`h-40 rounded-xl border-2 flex flex-col items-center justify-center p-4 transition-all relative ${
                  flashedOutcome?.option === 'B' && isFlashing
                    ? 'bg-indigo-600 border-indigo-400 scale-102 shadow-lg'
                    : drawsB >= targetB
                    ? 'bg-slate-800/40 border-slate-700 text-slate-500 opacity-80 cursor-default'
                    : 'bg-slate-800/90 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 cursor-pointer shadow-sm'
                }`}
              >
                {flashedOutcome?.option === 'B' && isFlashing ? (
                  <div className="text-center animate-pulse">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {flashedOutcome.val > 0 ? `+${flashedOutcome.val}` : flashedOutcome.val}
                    </span>
                    <span className="text-[10px] block text-indigo-200 font-mono mt-1">pts</span>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-bold text-slate-200">Option B</span>
                    <div className="mt-2 text-xs font-mono text-slate-400">
                      Sampled: <span className="text-indigo-400 font-bold">{drawsB}</span> / {targetB}
                    </div>
                    {drawsB >= targetB && (
                      <span className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Target Complete
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* Study 2 Piecewise Involuntary Controller */}
            {studyMode === 'study2_piecewise' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoPlayingPiecewise(!isAutoPlayingPiecewise)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isAutoPlayingPiecewise ? 'Pause Stream' : 'Start Involuntary Piecewise Stream'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: DECISION PHASE */}
        {phase === 'decision' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-6">
            <div className="text-center max-w-lg">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                Sampling Limits Met
              </span>
              <h4 className="text-lg font-bold text-slate-100 mt-1">
                Which gamble do you prefer?
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Select one gamble based on the outcomes you experienced during exploration.
              </p>
            </div>

            {/* Choice Selection Cards */}
            <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
              <button
                onClick={() => handleSubmitChoice('A')}
                className={`p-6 rounded-xl border-2 transition-all text-center ${
                  selectedChoice === 'A'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-xl font-bold">Option A</div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Sample Mean: {meanA.toFixed(1)} pts
                </div>
              </button>

              <button
                onClick={() => handleSubmitChoice('B')}
                className={`p-6 rounded-xl border-2 transition-all text-center ${
                  selectedChoice === 'B'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-xl font-bold">Option B</div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Sample Mean: {meanB.toFixed(1)} pts
                </div>
              </button>
            </div>

            {/* Confidence Slider (0 - 10) matching paper page 11 */}
            {selectedChoice && (
              <div className="w-full max-w-md bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    How confident are you that you made the right decision?
                  </span>
                  <span className="text-indigo-400 font-mono font-bold text-sm">
                    {confidenceRating} / 10
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={confidenceRating}
                  onChange={(e) => setConfidenceRating(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 - Not at all confident</span>
                  <span>5 - Moderately confident</span>
                  <span>10 - Extremely confident</span>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={handleConfirmDecision}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Submit Decision &amp; View Outcome Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: TRIAL FEEDBACK & EV CONSISTENCY */}
        {phase === 'feedback' && (
          <div className="py-6 flex flex-col items-center justify-center space-y-6">
            <div className="text-center max-w-lg">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold">
                Trial Complete
              </span>
              <h4 className="text-xl font-bold text-slate-100 mt-1">
                Realized Decision Outcome: {finalDecisionOutcome && finalDecisionOutcome > 0 ? `+${finalDecisionOutcome}` : finalDecisionOutcome} pts
              </h4>
            </div>

            {/* Normative Consistency Analysis */}
            <div className="w-full max-w-lg bg-slate-800/90 rounded-xl p-5 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-xs text-slate-300">Normative Choice Consistency:</span>
                <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                  isEVConsistent ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {isEVConsistent ? '✓ EV-Maximizing Choice' : '✗ Suboptimal Choice'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Option A True EV</span>
                  <span className="text-slate-100 font-bold">{currentProblem.evA.toFixed(2)} pts</span>
                  <span className="text-[10px] text-slate-500 block">Experienced: {meanA.toFixed(1)}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Option B True EV</span>
                  <span className="text-slate-100 font-bold">{currentProblem.evB.toFixed(2)} pts</span>
                  <span className="text-[10px] text-slate-500 block">Experienced: {meanB.toFixed(1)}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-3 rounded">
                The normative superior option was <strong className="text-indigo-300">Option {currentProblem.evMaximizingOption}</strong> (difference of {currentProblem.evDifference.toFixed(2)} pts).
                You deliberated for {totalTarget} total samples in the <span className="font-semibold text-slate-200">{currentProblem.deliberation} Deliberation</span> condition.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={resetTrial}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                >
                  Play Again or Try Another Problem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Screen Footer Live Metrics */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-500">Accumulated Points: </span>
              <span className="text-emerald-400 font-bold">
                {accumulatedPoints > 0 ? `+${accumulatedPoints}` : accumulatedPoints}
              </span>
            </div>
            <span>·</span>
            <div>
              <span className="text-slate-500">Switches: </span>
              <span className="text-slate-300 font-bold">{switchesCount}</span>
              <span className="text-slate-500 text-[10px]"> (ratio: {switchingRatio.toFixed(2)})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Running δ_A: <strong className="text-slate-200">{(currentDeltaA * 100).toFixed(0)}%</strong></span>
            <span>·</span>
            <span>Running δ_B: <strong className="text-slate-200">{(currentDeltaB * 100).toFixed(0)}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
