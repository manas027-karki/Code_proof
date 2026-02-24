import Link from "next/link";

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400&display=swap');

        .footer-section {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid rgba(0,0,0,0.06);
          background:
            radial-gradient(ellipse 100% 70% at 10% 120%, rgba(134,239,172,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 90% 110%, rgba(147,210,255,0.14) 0%, transparent 52%),
            #f8fbf9;
        }

        .footer-headline {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.6rem, 5vw, 2.6rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .footer-headline em {
          font-style: italic;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-install-card {
          background: rgba(255,255,255,0.60);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95);
          width: 100%;
          max-width: 26rem;
          box-sizing: border-box;
          min-width: 0;
        }

        .footer-link {
          font-size: 13px;
          font-weight: 400;
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s ease;
          white-space: nowrap;
        }
        .footer-link:hover { color: #0f172a; }

        .footer-cta {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          text-decoration: none;
          padding: 8px 20px;
          border-radius: 100px;
          background: linear-gradient(135deg, #1d6ef5, #0ea5e9);
          box-shadow: 0 2px 12px rgba(29,110,245,0.28);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .footer-cta:hover {
          box-shadow: 0 4px 20px rgba(29,110,245,0.40);
          transform: translateY(-1px);
        }

        .footer-sep {
          width: 1px;
          height: 12px;
          background: rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
      `}</style>

      <footer className="footer-section">
        <div
          className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-20 sm:py-24"
          style={{ boxSizing: "border-box", width: "100%" }}
        >
          {/* Headline + subtext */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="footer-headline">
              Ship <em>secure</em> commits today
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 300,
                color: "#94a3b8",
                fontSize: "14px",
                maxWidth: "28rem",
                lineHeight: 1.7,
              }}
            >
              Keep sensitive data out of your repositories. Enforcement stays
              local, reporting stays in your control.
            </p>
          </div>

          {/* Install card */}
          <div className="footer-install-card rounded-2xl p-4">
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: "#94a3b8",
                marginBottom: "8px",
              }}
            >
              Quick install
            </p>
            <div
              className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3"
              style={{ minWidth: 0, boxSizing: "border-box" }}
            >
              <code
                style={{
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                  fontSize: "12.5px",
                  letterSpacing: "0.03em",
                }}
              >
                <span style={{ color: "#475569" }}>$</span>{" "}
                <span style={{ color: "#34d399" }}>npm</span>{" "}
                <span style={{ color: "#e2e8f0" }}>codeproof init</span>
              </code>
              <span
                style={{
                  color: "#34d399",
                  opacity: 0.4,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                ▊
              </span>
            </div>
          </div>

          {/* Nav row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="footer-sep hidden sm:block" />
            <Link
              href="https://github.com/Nithin0620/code_proof"
              className="footer-link"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
            <Link
              href="https://www.npmjs.com/package/codeproof"
              className="footer-link"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </Link>
            <Link href="/#how-it-works" className="footer-link">
              How It Works
            </Link>
            <Link href="/#features" className="footer-link">
              Features
            </Link>
          </div>

          {/* Bottom rule + copyright */}
          <div
            style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          >
            <div
              style={{
                height: "1px",
                background: "rgba(0,0,0,0.06)",
                marginBottom: "20px",
              }}
            />
            <div
              className="flex flex-wrap items-center justify-between gap-4"
              style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 300 }}
            >
              <span style={{ fontFamily: "'DM Sans',sans-serif" }}>
                © {new Date().getFullYear()} CodeProof
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: "13px",
                  color: "#cbd5e1",
                }}
              >
                Secure by default.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
