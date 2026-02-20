import Link from "next/link";

export default function Hero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        /* ── Section: no overflow in any direction ── */
        .hero-section {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow: hidden; /* kills orb bleed */
          background:
            radial-gradient(ellipse 140% 90% at 15% -30%, rgba(134, 239, 172, 0.40) 0%, transparent 55%),
            radial-gradient(ellipse 90% 70% at 85% 5%,   rgba(147, 210, 255, 0.32) 0%, transparent 52%),
            radial-gradient(ellipse 70% 60% at 50% 110%, rgba(196, 181, 253, 0.20) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 70% 60%,  rgba(134, 239, 172, 0.12) 0%, transparent 50%),
            #f8fbf9;
        }

        .hero-badge {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          line-height: 1.06;
          letter-spacing: -0.025em;
          color: #0f172a;
          /* Fluid font: clamps between 42px (mobile) and 88px (desktop) */
          font-size: clamp(2.6rem, 10vw, 5.5rem);
        }

        .hero-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          color: #64748b;
          letter-spacing: 0.005em;
        }

        .btn-primary {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #1d6ef5 0%, #0ea5e9 100%);
          box-shadow: 0 4px 22px rgba(29,110,245,0.30), inset 0 1px 0 rgba(255,255,255,0.18);
          transition: all 0.22s ease;
          color: #fff;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #1558d6 0%, #0284c7 100%);
          box-shadow: 0 7px 32px rgba(29,110,245,0.40);
          transform: translateY(-1px);
        }

        .btn-secondary {
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.09);
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          transition: all 0.22s ease;
          color: #374151;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,1);
          border-color: rgba(0,0,0,0.16);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .install-card {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95);
          /* Ensure it never overflows on small screens */
          width: 100%;
          max-width: 28rem;
          box-sizing: border-box;
        }

        @keyframes floatA {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-10px) scale(1.03); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(8px) scale(0.97); }
        }

        /* Orbs: positioned within bounds so they don't cause scroll */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(72px);
          pointer-events: none;
          /* Never let an orb extend beyond the section */
          max-width: 60vw;
          max-height: 60vw;
        }
        .orb-a { animation: floatA 9s ease-in-out infinite; }
        .orb-b { animation: floatB 11s ease-in-out infinite; }
        .orb-c { animation: floatA 13s ease-in-out infinite 2s; }
      `}</style>

      <section id="hero" className="hero-section relative">
        {/* Orbs: pulled inward so they're clipped by overflow:hidden not by the page */}
        <div
          className="orb orb-a"
          style={{
            width: 380,
            height: 380,
            top: -60,
            left: -40,
            background: "rgba(134,239,172,0.28)",
          }}
        />
        <div
          className="orb orb-b"
          style={{
            width: 280,
            height: 280,
            top: 30,
            right: -40,
            background: "rgba(147,210,255,0.24)",
          }}
        />
        <div
          className="orb orb-c"
          style={{
            width: 220,
            height: 220,
            bottom: 0,
            left: "38%",
            background: "rgba(196,181,253,0.18)",
          }}
        />

        {/* Inner container: proper padding on all screen sizes */}
        <div
          className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-32 lg:py-36"
          style={{ boxSizing: "border-box", width: "100%" }}
        >
          {/* Badge */}
          <div className="hero-badge mb-10 inline-flex items-center gap-2.5 rounded-full px-5 py-2">
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
              AI-powered git security enforcement
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                fill="#10b981"
              />
            </svg>
          </div>

          {/* Headline — fluid font, never overflows */}
          <h1 className="hero-title w-full">
            <em>Protect</em> your code
            <br />
            before it ships
          </h1>

          {/* Subheadline */}
          <p className="hero-sub mt-7 max-w-lg text-base sm:text-lg leading-relaxed px-2">
            Prevent secrets and risky patterns from ever reaching your
            repository — enforced hooks, precise detection, and audit-ready
            reporting.
          </p>

          {/* CTA Buttons */}
          <div className="mt-11 flex flex-wrap justify-center gap-3 w-full px-2">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
            >
              Open Dashboard
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 6.5h9M7.5 2.5l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="https://github.com/lalitchandra00/Code_proof"
              className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </Link>
            <Link
              href="https://www.npmjs.com/package/codeproof"
              className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z" />
              </svg>
              npm
            </Link>
          </div>

          {/* Install card */}
          <div className="install-card mt-14 rounded-2xl p-5 text-left">
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: "#94a3b8",
                marginBottom: "10px",
              }}
            >
              Quick install
            </p>
            <div className="flex items-center justify-between rounded-xl bg-slate-950 px-5 py-4">
              <code
                style={{
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                  fontSize: "13px",
                  letterSpacing: "0.03em",
                }}
              >
                <span style={{ color: "#475569" }}>$</span>{" "}
                <span style={{ color: "#34d399" }}>npm</span>{" "}
                <span style={{ color: "#e2e8f0" }}>codeproof init</span>
              </code>
              <span
                style={{ color: "#34d399", opacity: 0.5, fontSize: "13px" }}
              >
                ▊
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
