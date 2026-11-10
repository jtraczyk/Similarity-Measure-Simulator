import React from 'react';
import {
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Target,
  Compass,
  Brain
} from 'lucide-react';

interface ReadmeTabProps {
  onGoToSimulator: () => void;
  onGoToRTable: () => void;
}

export const ReadmeTab: React.FC<ReadmeTabProps> = ({ onGoToSimulator, onGoToRTable }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-white to-[#f0f4f7] border border-[#dce3e8] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl font-bold text-[#344b57] tracking-tight">
              Development &amp; Meaning of the Similarity Measure δ(n)
            </h2>
            <p className="text-sm text-[#617986] leading-relaxed">
              This guide explains how sampling serves as a quantitative proxy for deliberation in Decisions from Experience (DfE), reduces epistemic uncertainty, and facilitates gist and verbatim representations under Fuzzy Trace Theory.
            </p>
          </div>

          <button
            onClick={onGoToSimulator}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#ef9421] hover:bg-[#d87f13] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>Open Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP SECTION: How to Use the Simulator (Step-by-Step) */}
      <div className="bg-white border border-[#dce3e8] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-base font-bold text-[#344b57]">
          <Compass className="w-5 h-5 text-[#ef9421]" />
          <h3>How to Use this Scientific Simulator</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#344b57] text-white font-bold text-xs shrink-0 mt-0.5">
              1
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#344b57] uppercase tracking-wide">
                Choose a Decision Environment
              </h4>
              <p className="text-xs text-[#617986] leading-relaxed">
                Select from <strong>Figure 1 Benchmark</strong> (60% vs. 30%), the <strong>18 Empirical Decision Gambles</strong> from Table 3 of the paper, or test custom problems in the <strong>Custom Gamble &amp; CSV Batch Tool</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#344b57] text-white font-bold text-xs shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#344b57] uppercase tracking-wide">
                Simulate Decisions from Experience (DfE) Sampling
              </h4>
              <p className="text-xs text-[#617986] leading-relaxed">
                Click <span className="font-semibold text-[#ef9421]">+1 Draw</span>, <span className="font-semibold text-[#344b57]">Stream Draws</span>, or <span className="font-semibold text-[#344b57]">+10 Draws</span>.
                Notice how drawing zeros or wins shifts <code className="font-mono text-[#344b57]">μ(n)</code> and triggers corresponding reactions in the similarity measure <code className="font-mono text-[#ef9421]">δ(n)</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#344b57] text-white font-bold text-xs shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#344b57] uppercase tracking-wide">
                Observe Similarity Threshold Unlocking
              </h4>
              <p className="text-xs text-[#617986] leading-relaxed">
                Observe the sample counts required to cross <strong>Low (70%)</strong>, <strong>Moderate (80%)</strong>, and <strong>High (90%)</strong>.
                Notice that higher uncertainty gambles take noticeably longer to unlock the 90% badge.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#344b57] text-white font-bold text-xs shrink-0 mt-0.5">
              4
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#344b57] uppercase tracking-wide">
                Replicate with the 18 Choice Problems or Your Own Research CSV
              </h4>
              <p className="text-xs text-[#617986] leading-relaxed">
                Switch to the <strong>18 Empirical Decision Gambles (R Pipeline)</strong> tab to see the exact sample limits and nsample distribution histogram.
                In the Custom section, upload your own choice problems to compute <span className="font-mono">n_low</span>, <span className="font-mono">n_mod</span>, and <span className="font-mono">n_high</span> for your experiments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: The Core Scientific Concept */}
      <div className="bg-white border border-[#dce3e8] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[#344b57]">
          <Lightbulb className="w-5 h-5 text-[#ef9421]" />
          <h3>1. Sampling as a Quantitative Proxy for Deliberation</h3>
        </div>

        <p className="text-sm text-[#344b57] leading-relaxed">
          How do we measure how deeply someone deliberates when facing an uncertain gamble?
          In <strong>Decisions from Experience (DfE)</strong>, participants explore alternatives by clicking on boxes to sample outcomes from hidden probability distributions.
        </p>

        <p className="text-sm text-[#344b57] leading-relaxed">
          The central insight of the model is that <strong className="text-[#344b57]">sampling quantity acts as an objective, measurable proxy for deliberation</strong>.
          Participants who deliberate more will sample more outcomes.
          By collecting more samples, their experienced payoff distribution converges closer and closer to the true mathematical distribution of the choice problem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-2">
          <div className="bg-[#f8fafb] border border-[#dce3e8] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#344b57]">
              <span className="w-2 h-2 rounded-full bg-[#ef9421]"></span>
              <span>Successive Means: μ(n) and μ(n−1)</span>
            </div>
            <p className="text-xs text-[#617986] leading-relaxed">
              <code className="font-mono font-bold text-[#344b57]">μ(n)</code> is the sample average after <span className="font-mono">n</span> draws.
              When exploration begins, every new outcome causes a large shift between <code className="font-mono text-[#344b57]">μ(n)</code> and <code className="font-mono text-[#344b57]">μ(n−1)</code>.
              As sample size increases, this difference diminishes, proving that the sample mean is locking onto the true Expected Value (EV).
            </p>
          </div>

          <div className="bg-[#f8fafb] border border-[#dce3e8] rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#344b57]">
              <span className="w-2 h-2 rounded-full bg-[#344b57]"></span>
              <span>The Metric: δ(n) in Percentage Terms</span>
            </div>
            <p className="text-xs text-[#617986] leading-relaxed">
              <strong className="text-[#344b57]">δ(n)</strong> calculates the degree of similarity between the current and preceding running means.
              When the difference between successive means becomes negligibly small, <strong className="text-[#344b57]">δ(n) reaches 0.90 (90% similarity)</strong> or higher, indicating that the participant has formed a stable estimate of the gamble&apos;s true value.
            </p>
          </div>
        </div>

        {/* Piecewise Formula Callout */}
        <div className="p-4 bg-[#fff8ee] border border-[#fcd9a8] rounded-lg text-xs text-[#344b57] space-y-1.5 mt-2">
          <div className="font-semibold text-xs text-[#ef9421] flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span>Piecewise Formulation of Equation (1)</span>
          </div>
          <p className="text-[#617986] leading-relaxed font-sans">
            <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-[#fcd9a8] text-[#344b57]">δ(n) = 1 − |μ(n) − μ(n−1)| / μ(n−1)</code> when <span className="font-mono">μ(n−1) &gt; 0</span>.
            Special edge cases ensure mathematical continuity: if the first non-zero outcome appears after initial zeroes (<span className="font-mono">μ(n−1)=0 &amp; μ(n)&gt;0</span>), similarity is <span className="font-mono font-bold">0</span>; if consecutive zeroes are drawn (<span className="font-mono">μ(n−1)=0 &amp; μ(n)=0</span>), similarity is <span className="font-mono font-bold">1</span>.
          </p>
        </div>
      </div>

      {/* SECTION 2: Aleatory vs. Epistemic Uncertainty */}
      <div className="bg-white border border-[#dce3e8] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[#344b57]">
          <Brain className="w-5 h-5 text-[#ef9421]" />
          <h3>2. Aleatory vs. Epistemic Uncertainty in Decisions from Experience</h3>
        </div>

        <p className="text-sm text-[#344b57] leading-relaxed">
          The theoretical framework distinguishes between two fundamental forms of uncertainty that people encounter:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border border-[#dce3e8] rounded-lg p-4 bg-[#f8fafb] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#708a98]"></span>
              <h4 className="font-bold text-xs uppercase tracking-wide text-[#344b57]">
                Aleatory Uncertainty (Intrinsic Randomness)
              </h4>
            </div>
            <p className="text-xs text-[#617986] leading-relaxed">
              Refers to inherent chance in the physical world. For instance, a <strong>50% chance</strong> carries greater unpredictability than a <strong>30% chance</strong>, because a 30% event is heavily skewed toward non-occurrence (70% zeros).
            </p>
            <p className="text-xs text-[#344b57] font-medium bg-white p-2.5 rounded border border-[#dce3e8]">
              However, human decision makers rarely perform formal mathematical variance equations when weighing risk.
            </p>
          </div>

          <div className="border border-[#fcd9a8] rounded-lg p-4 bg-[#fff8ee] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef9421]"></span>
              <h4 className="font-bold text-xs uppercase tracking-wide text-[#d87f13]">
                Epistemic Uncertainty (Lack of Familiarity)
              </h4>
            </div>
            <p className="text-xs text-[#617986] leading-relaxed">
              Refers to the decision maker&apos;s <em>unfamiliarity</em> with the payoff distribution. In a DfE environment where probabilities are not explicitly stated on screen, individuals must sample to eliminate this lack of knowledge.
            </p>
            <p className="text-xs text-[#344b57] font-medium bg-white p-2.5 rounded border border-[#fcd9a8]">
              <strong className="text-[#ef9421]">δ(n) captures epistemic uncertainty reduction:</strong> each extra sample brings the explored estimate closer to the true EV.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Citation & Institutional Context */}
      <div className="bg-[#f0f4f7] border border-[#dce3e8] rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#344b57]">Scientific Citation</span>
          <a
            href="https://cridm.edu.pl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#ef9421] font-semibold hover:underline"
          >
            <span>cridm.edu.pl</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-[#344b57] leading-relaxed">
          <strong>Center for Research on Improving Decision Making (CRIDM)</strong> · SWPS University, Poland.
          <br />
          <strong>Authors:</strong> Mondal &amp; Traczyk
          <br />
          <strong>Paper:</strong> <em>Closing the Numeracy Gap: Using Deliberation-Based Interventions to Equalize Decision Quality</em>
        </p>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={onGoToSimulator}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#ef9421] hover:bg-[#d87f13] rounded-md transition-colors"
          >
            <span>Launch Live Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGoToRTable}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#344b57] bg-white hover:bg-slate-50 border border-[#dce3e8] rounded-md transition-colors"
          >
            <span>View 18 Empirical Decision Gambles (R Pipeline)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
