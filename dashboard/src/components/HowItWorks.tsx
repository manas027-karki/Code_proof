import type { ReactNode } from "react";
import React from "react";

const steps: {
  title: string;
  description: string;
  icon: ReactNode;
  cmd?: string;
}[] = [
  {
    title: "Initialize",
    cmd: "codeproof init",
    description: "Add CodeProof to your repo and wire the pre-commit hook.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M4 6h16M4 12h10M4 18h7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Hook runs",
    description:
      "Every commit is intercepted and scanned automatically before it leaves your machine.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M7 6l5 5-5 5M13 6h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "AI analysis",
    description:
      "Regex baseline detection with AI escalation for high-confidence findings.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 5h6v6H5zM13 13h6v6h-6z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    title: "Report",
    description:
      "Findings are logged locally with clear, actionable remediation steps.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M6 4h9l3 3v13H6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Dashboard",
    description:
      "Track trends, risks, and team compliance across all your projects.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 19V9m7 10V5m7 14v-7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .hiw-section {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          overflow: hidden;
        }

        .hiw-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
        }

        .hiw-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .hiw-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Connector line between cards on desktop */
        .hiw-grid {
          position: relative;
        }

        .hiw-card {
          background: rgba(255,255,255,0.70);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: box-shadow 0.22s ease, transform 0.22s ease;
          min-width: 0;
          box-sizing: border-box;
        }
        .hiw-card:hover {
          box-shadow: 0 6px 28px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9);
          transform: translateY(-2px);
        }

        .hiw-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(29,110,245,0.10) 0%, rgba(5,150,105,0.10) 100%);
          border: 1px solid rgba(29,110,245,0.12);
          flex-shrink: 0;
          color: #1d6ef5;
        }

        .hiw-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 11px;
          font-weight: 400;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }

        .hiw-card-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .hiw-cmd {
          display: inline-block;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 11px;
          color: #34d399;
          background: #0f172a;
          padding: 2px 8px;
          border-radius: 6px;
          margin-top: 4px;
          letter-spacing: 0.02em;
        }

        .hiw-card-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #64748b;
          line-height: 1.6;
        }

        /* Arrow between steps — desktop only */
        .hiw-arrow {
          display: none;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          flex-shrink: 0;
          align-self: center;
        }
        @media (min-width: 1024px) {
          .hiw-arrow { display: flex; }
        }
      `}</style>

      <section
        id="how-it-works"
        className="hiw-section mx-auto max-w-6xl px-6 py-20"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="hiw-title">
            Security checks built into <em>every commit</em>
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 300,
              fontSize: "14px",
              color: "#64748b",
              maxWidth: "32rem",
              lineHeight: 1.7,
            }}
          >
            CodeProof runs before code leaves your machine, producing
            high-signal reports for every team.
          </p>
        </div>

        {/* Steps — desktop: single row with arrows, mobile: 2-col grid */}
        <div className="mt-12 flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-stretch lg:gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={step.title}>
              <div
                key={step.title}
                className="hiw-card flex flex-col gap-4 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="hiw-icon-wrap">{step.icon}</div>
                  <span className="hiw-step-num">0{i + 1}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="hiw-card-title">{step.title}</p>
                  {step.cmd && <span className="hiw-cmd">{step.cmd}</span>}
                  <p className="hiw-card-desc mt-2">{step.description}</p>
                </div>
              </div>

              {/* Arrow connector — only between cards, not after last */}
              {i < steps.length - 1 && (
                <div key={`arrow-${i}`} className="hiw-arrow">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    </>
  );
}
