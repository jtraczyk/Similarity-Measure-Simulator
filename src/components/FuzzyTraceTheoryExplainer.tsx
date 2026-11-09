import React, { useState } from 'react';
import { BookOpen, Check, X, Award, Brain, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { NUMERACY_QUESTIONS } from '../data/paperData';

export const FuzzyTraceTheoryExplainer: React.FC = () => {
  // Numeracy quiz state
  const [userAnswers, setUserAnswers] = useState<{ [id: string]: string }>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSelectOption = (qId: string, option: string) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    NUMERACY_QUESTIONS.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const totalScore = calculateScore();
  const isHighNumeracy = totalScore >= 4;

  return (
    <div className="space-y-6">
      {/* Theoretical Framework Overview */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">
                Cognitive Architecture
              </span>
              <span className="text-xs font-mono text-slate-300">
                Reyna &amp; Brainerd (1995) · Broniatowski &amp; Reyna (2018)
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1">
              Fuzzy Trace Theory (FTT) &amp; Numeracy
            </h2>
            <p className="text-slate-300 text-sm mt-1.5 max-w-3xl leading-relaxed">
              Fuzzy Trace Theory posits that decision makers simultaneously encode three parallel memory representations:
              <strong> categorical gist</strong>, <strong>ordinal gist</strong>, and <strong>precise verbatim representations</strong>.
              The deliberation intervention bridges the gap by providing the structured sampling needed to transform crude gist into veridical verbatim calculations.
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-center shrink-0 min-w-[140px]">
            <Brain className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
            <span className="text-xs font-semibold block text-slate-200">Parallel Traces</span>
            <span className="text-[10px] text-slate-400">Gist → Verbatim</span>
          </div>
        </div>
      </div>

      {/* The 3 Representation Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level 1: Categorical Gist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Level 1</span>
              <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Simplest Gist</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-2">Categorical Gist</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Binary qualitative states: <em>"Win something vs. win nothing"</em> or <em>"Gain vs. loss"</em>.
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 mb-1">Classic Example:</div>
              A: 50% chance of €200 vs.<br />
              B: €90 for sure<br />
              <span className="text-slate-500 text-[11px] block mt-1">
                People choose B because "some win is better than possibly nothing".
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Less numerate individuals often default here due to computational interference.
          </div>
        </div>

        {/* Level 2: Ordinal Gist */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Level 2</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Relative Trade-offs</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-2">Ordinal Gist</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Relative magnitude ranking without arithmetic: <em>"Higher reward with lower probability vs. smaller reward with higher probability"</em>.
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 mb-1">Loss-Bet Paradox:</div>
              7/36 win $9, 29/36 lose $0.05 is rated MORE attractive than 7/36 win $9, 29/36 win $0 because losing gives an affective contrast.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Enables heuristic weighing when exact probabilities cannot be multiplied.
          </div>
        </div>

        {/* Level 3: Verbatim Representation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Level 3</span>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Normative EV</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-2">Verbatim Representation</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Energy-intensive exact arithmetic: multiplying probabilities by outcomes to calculate true Expected Value <span className="font-mono text-indigo-600 font-bold">EV = ∑ p_i · x_i</span>.
            </p>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-100">
              <div className="text-[10px] uppercase text-slate-400 mb-1">Normative Calculation:</div>
              EV(A) = 0.50 × 200 = 100€<br />
              EV(B) = 1.00 × 90 = 90€<br />
              <span className="text-emerald-700 font-bold block mt-1">
                Option A is objectively superior!
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Facilitated by High Deliberation (90% similarity threshold).
          </div>
        </div>
      </div>

      {/* Interactive 7-Item Numeracy Battery */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-indigo-600 font-semibold">
                Individual Difference Battery
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-600">
                Schwartz et al. (1997) + Berlin Numeracy Test (Cokely et al., 2012)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Empirical Statistical Numeracy Assessment (Score: 0–7)
            </h3>
            <p className="text-xs text-slate-500">
              In Study 1, participants with score ≥ 4 were classified as Highly Numerate (N = 110), and score &lt; 4 as Less Numerate (N = 82).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!showResults ? (
              <button
                onClick={() => setShowResults(true)}
                disabled={Object.keys(userAnswers).length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Submit Answers &amp; Check Score
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowResults(false);
                  setUserAnswers({});
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                Retake Assessment
              </button>
            )}
          </div>
        </div>

        {/* Score Summary Box if Submitted */}
        {showResults && (
          <div className="my-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 block font-semibold">
                Your Assessment Result
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">{totalScore}</span>
                <span className="text-slate-400 text-sm">/ 7 items correct</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Classification: <strong className={isHighNumeracy ? 'text-amber-400' : 'text-sky-400'}>
                  {isHighNumeracy ? 'Highly Numerate (Median Split ≥ 4)' : 'Less Numerate (Median Split < 4)'}
                </strong>
              </p>
            </div>

            <div className="text-xs text-slate-300 max-w-sm bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              {isHighNumeracy ? (
                <span>
                  High statistical numeracy allows faster extraction of verbatim trade-offs, yet deliberate exploration still maximized EV consistency up to 79%.
                </span>
              ) : (
                <span>
                  The paper proves that structured deliberation (δ = 90%) elevates decision accuracy to <strong>75%</strong>, completely equalizing decision quality!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Questions Grid */}
        <div className="space-y-5 mt-4">
          {NUMERACY_QUESTIONS.map((q, idx) => {
            const selected = userAnswers[q.id];
            const isCorrect = selected === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  showResults
                    ? isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-mono text-slate-400 uppercase font-semibold">
                      Item {idx + 1} ({q.source} Scale)
                    </span>
                    <h5 className="text-sm font-semibold text-slate-900 mt-1 leading-snug">
                      {q.question}
                    </h5>
                  </div>

                  {showResults && (
                    <span className={`shrink-0 flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>

                {/* Options */}
                {q.options && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    {q.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        disabled={showResults}
                        className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-colors ${
                          selected === opt
                            ? showResults
                              ? opt === q.correctAnswer
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                : 'bg-rose-600 text-white border-rose-600 font-bold'
                              : 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : showResults && opt === q.correctAnswer
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Explanation on Show Results */}
                {showResults && (
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
