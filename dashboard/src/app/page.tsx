import type { Metadata } from "next";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import CliDocsSection from "../components/CliDocsSection";
import FeatureCard from "../components/FeatureCard";
import MetricCard from "../components/MetricCard";
import PricingSection from "../components/PricingSection";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "CodeProof | Pre-commit Security Enforcement",
  description:
    "CodeProof is an AI-powered pre-commit security enforcement tool that blocks secrets, generates reports, and surfaces audit-ready insights.",
  openGraph: {
    title: "CodeProof | Pre-commit Security Enforcement",
    description:
      "Prevent secrets and risky patterns before they reach your repository with enforced hooks and audit-ready reporting.",
    type: "website",
    url: "https://codeproof.dev",
  },
};

const features = [
  {
    title: "Git Pre-commit Enforcement",
    description:
      "Hard-stop risky changes before they ever reach a remote repository.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 12h14M12 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Regex Baseline + AI Escalation",
    description:
      "Layer deterministic patterns with contextual analysis for higher confidence.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 7h16M8 12h12M10 17h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Persistent Audit Logs",
    description:
      "Every report is preserved for compliance and forensic review.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7 4h8l4 4v12H7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Safe Secret Remediation",
    description: "Guided actions to rotate, revoke, and verify fixes quickly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 3l7 4v5c0 4.4-3.1 7.9-7 9-3.9-1.1-7-4.6-7-9V7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Dashboard Analytics",
    description: "Understand risk trends, offenders, and remediation velocity.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 19V9m7 10V5m7 14v-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Fail-Open Architecture",
    description:
      "Developer workflows stay online even during degraded AI service states.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7 12h10M12 7v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const metrics = [
  { label: "Reports Analyzed", value: "124" },
  { label: "Blocked Commits", value: "18" },
  { label: "Secrets Detected", value: "42" },
  { label: "High-Risk Findings", value: "8" },
];

export default function Home() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <Hero />
      <HowItWorks />
      <PricingSection />
      {/* <CliDocsSection /> */}
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

          .feat-title {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-weight: 300;
            font-size: clamp(1.8rem, 4vw, 2.8rem);
            line-height: 1.08;
            letter-spacing: -0.02em;
            color: #0f172a;
          }
          .feat-title em {
            font-style: italic;
            font-weight: 400;
            background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .feat-card {
            background: rgba(255,255,255,0.70);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(0,0,0,0.07);
            box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
            transition: box-shadow 0.22s ease, transform 0.22s ease;
            min-width: 0;
            box-sizing: border-box;
          }
          .feat-card:hover {
            box-shadow: 0 6px 28px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9);
            transform: translateY(-2px);
          }

          .feat-icon-wrap {
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

          /* Security philosophy outer card */
          .sec-card {
            background: rgba(255,255,255,0.65);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(0,0,0,0.07);
            box-shadow: 0 2px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95);
            min-width: 0;
            box-sizing: border-box;
          }

          /* Security inner items */
          .sec-item {
            background: rgba(255,255,255,0.55);
            border: 1px solid rgba(0,0,0,0.06);
            box-shadow: 0 1px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8);
            min-width: 0;
            box-sizing: border-box;
            transition: box-shadow 0.2s ease, transform 0.2s ease;
          }
          .sec-item:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.07);
            transform: translateY(-1px);
          }

          .sec-item-num {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 10px;
            color: #94a3b8;
            letter-spacing: 0.04em;
            flex-shrink: 0;
          }
        `}</style>

        {/* ── Features ── */}
        <section
          id="features"
          className="mx-auto max-w-6xl px-6 py-20"
          style={{ overflow: "hidden" }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow:
                  "0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
                borderRadius: "100px",
                padding: "5px 14px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                  fill="#10b981"
                />
              </svg>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  letterSpacing: "0.07em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Core features
              </span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                  fill="#10b981"
                />
              </svg>
            </div>

            <h2 className="feat-title">
              Enforcement with <em>context,</em> designed for security teams
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
              A balance of automation and clarity so developers can fix issues
              fast.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feat-card rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="feat-icon-wrap">{feature.icon}</div>
                <div>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      color: "#0f172a",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {feature.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "13px",
                      fontWeight: 300,
                      color: "#64748b",
                      lineHeight: 1.6,
                      marginTop: "6px",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Security philosophy ── */}
      </>
      {/* <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Example metrics
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Visibility that scales across teams
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            A snapshot of what CodeProof reports look like in practice.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section> */}
      <Footer />
    </main>
  );
}
