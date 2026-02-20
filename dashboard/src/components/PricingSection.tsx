export default function PricingSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .pricing-section {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          overflow: hidden;
        }

        .pricing-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .pricing-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Shared card base ── */
        .pricing-card {
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          padding: 28px;
          min-width: 0;
          box-sizing: border-box;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        /* Free */
        .pricing-card-free {
          background: rgba(255,255,255,0.70);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .pricing-card-free:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        /* Premium — dark featured card */
        .pricing-card-premium {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.04) inset;
          position: relative;
          overflow: hidden;
        }
        .pricing-card-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 48px rgba(0,0,0,0.24);
        }
        /* Subtle gradient sheen inside premium card */
        .pricing-card-premium::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(29,110,245,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 110%, rgba(5,150,105,0.14) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Enterprise */
        .pricing-card-enterprise {
          background: rgba(255,255,255,0.70);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .pricing-card-enterprise:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        /* Tier label */
        .pricing-tier {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* Price */
        .pricing-price {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 2.6rem;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        /* Feature list item */
        .pricing-feature {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.5;
        }
        .pricing-feature-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        /* Buttons */
        .pricing-btn-dark {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #0f172a;
          background: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 100px;
          width: 100%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          transition: all 0.2s ease;
        }
        .pricing-btn-dark:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }

        .pricing-btn-light {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: linear-gradient(135deg, #1d6ef5, #0ea5e9);
          border: none;
          padding: 10px 20px;
          border-radius: 100px;
          width: 100%;
          cursor: pointer;
          box-shadow: 0 3px 14px rgba(29,110,245,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
          transition: all 0.2s ease;
        }
        .pricing-btn-light:hover {
          box-shadow: 0 5px 20px rgba(29,110,245,0.40);
          transform: translateY(-1px);
        }

        .pricing-btn-outline {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #374151;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.1);
          padding: 10px 20px;
          border-radius: 100px;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pricing-btn-outline:hover {
          background: rgba(0,0,0,0.03);
          border-color: rgba(0,0,0,0.18);
        }

        /* "Most popular" badge on premium */
        .pricing-popular-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(52,211,153,0.15);
          border: 1px solid rgba(52,211,153,0.25);
          border-radius: 100px;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #34d399;
        }
      `}</style>

      <section className="pricing-section mx-auto max-w-6xl px-6 pb-20">
        {/* Header */}
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
              Pricing
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                fill="#10b981"
              />
            </svg>
          </div>

          <h2 className="pricing-title">
            Start <em>free,</em> scale to enterprise
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
            Choose the right level of enforcement for your team — from local VS
            Code usage to organization-wide CI/CD integration.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {/* Free */}
          <div className="pricing-card pricing-card-free">
            <span className="pricing-tier" style={{ color: "#94a3b8" }}>
              Free
            </span>
            <h3
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#0f172a",
                marginTop: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              VS Code extension
            </h3>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                fontWeight: 300,
                color: "#64748b",
                marginTop: "6px",
                lineHeight: 1.6,
              }}
            >
              Local pre-commit enforcement for individual developers.
            </p>
            <div style={{ marginTop: "20px" }}>
              <span className="pricing-price" style={{ color: "#0f172a" }}>
                $0
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  fontWeight: 300,
                  color: "#94a3b8",
                  marginLeft: "4px",
                }}
              >
                {" "}
                / developer
              </span>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "4px",
                fontWeight: 300,
              }}
            >
              Generous rate limit for most personal use.
            </p>
            <div
              style={{
                height: "1px",
                background: "rgba(0,0,0,0.06)",
                margin: "20px 0",
              }}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                "VS Code extension access",
                "Local scans with sensible rate limits",
                "Basic report history on this device",
              ].map((f) => (
                <div
                  key={f}
                  className="pricing-feature"
                  style={{ color: "#64748b" }}
                >
                  <span
                    className="pricing-feature-dot"
                    style={{ background: "rgba(29,110,245,0.3)" }}
                  />
                  {f}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="pricing-btn-light"
              style={{ marginTop: "24px" }}
            >
              Install extension
            </button>
          </div>

          {/* Premium */}
          <div
            className="pricing-card pricing-card-premium"
            style={{ position: "relative" }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="pricing-tier" style={{ color: "#34d399" }}>
                  Premium
                </span>
                <span className="pricing-popular-badge">
                  <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                      fill="#34d399"
                    />
                  </svg>
                  Most popular
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#fff",
                  marginTop: "12px",
                  letterSpacing: "-0.01em",
                }}
              >
                Unlimited usage
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "13px",
                  fontWeight: 300,
                  color: "#94a3b8",
                  marginTop: "6px",
                  lineHeight: 1.6,
                }}
              >
                Full access for growing teams that need aggressive enforcement.
              </p>
              <div style={{ marginTop: "20px" }}>
                <span className="pricing-price" style={{ color: "#fff" }}>
                  $9.99
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    fontWeight: 300,
                    color: "#64748b",
                    marginLeft: "4px",
                  }}
                >
                  {" "}
                  / dev / mo
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "4px",
                  fontWeight: 300,
                }}
              >
                Unlimited projects, reports, and findings.
              </p>
              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.07)",
                  margin: "20px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "Unlimited VS Code and CLI usage",
                  "Unlimited projects and report retention",
                  "Priority support and onboarding",
                ].map((f) => (
                  <div
                    key={f}
                    className="pricing-feature"
                    style={{ color: "#cbd5e1" }}
                  >
                    <span
                      className="pricing-feature-dot"
                      style={{ background: "#34d399", opacity: 0.7 }}
                    />
                    {f}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="pricing-btn-dark"
                style={{ marginTop: "24px" }}
              >
                Talk to sales
              </button>
            </div>
          </div>

          {/* Enterprise */}
          <div className="pricing-card pricing-card-enterprise">
            <span className="pricing-tier" style={{ color: "#94a3b8" }}>
              Enterprise
            </span>
            <h3
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#0f172a",
                marginTop: "12px",
                letterSpacing: "-0.01em",
              }}
            >
              Corporate API
            </h3>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "13px",
                fontWeight: 300,
                color: "#64748b",
                marginTop: "6px",
                lineHeight: 1.6,
              }}
            >
              Hardened API for large organizations to integrate into CI/CD.
            </p>
            <div style={{ marginTop: "20px" }}>
              <span className="pricing-price" style={{ color: "#0f172a" }}>
                Custom
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  fontWeight: 300,
                  color: "#94a3b8",
                  marginLeft: "4px",
                }}
              >
                {" "}
                / contract
              </span>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "4px",
                fontWeight: 300,
              }}
            >
              High-volume pipelines, multiple business units, strict compliance.
            </p>
            <div
              style={{
                height: "1px",
                background: "rgba(0,0,0,0.06)",
                margin: "20px 0",
              }}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                "Signed corporate API with SLAs",
                "CI/CD pipeline integration examples",
                "SSO, audit exports, and dedicated support",
              ].map((f) => (
                <div
                  key={f}
                  className="pricing-feature"
                  style={{ color: "#64748b" }}
                >
                  <span
                    className="pricing-feature-dot"
                    style={{ background: "rgba(29,110,245,0.3)" }}
                  />
                  {f}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="pricing-btn-outline"
              style={{ marginTop: "24px" }}
            >
              Contact enterprise team
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
