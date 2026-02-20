export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

function LoginFormFallback() {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow:
          "0 4px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        width: "100%",
        maxWidth: "420px",
        borderRadius: "16px",
        padding: "32px",
        boxSizing: "border-box" as const,
        textAlign: "center" as const,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "linear-gradient(135deg, #1d6ef5 0%, #059669 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 12px rgba(29,110,245,0.35)",
          margin: "0 auto 16px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1L8 4.5H11L8.5 6.8 9.5 10.5 6 8.2 2.5 10.5 3.5 6.8 1 4.5H4L6 1Z"
            fill="white"
            fillOpacity="0.9"
          />
        </svg>
      </div>
      <p
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontWeight: 300,
          fontSize: "2rem",
          letterSpacing: "-0.02em",
          color: "#0f172a",
        }}
      >
        Client{" "}
        <em
          style={{
            fontStyle: "italic",
            fontWeight: 400,
            background:
              "linear-gradient(130deg,#1d6ef5 0%,#06b6d4 55%,#059669 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          login
        </em>
      </p>
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontWeight: 300,
          fontSize: "13px",
          color: "#94a3b8",
          marginTop: "8px",
        }}
      >
        Loading…
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .login-page {
          min-height: 100svh;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
          background:
            radial-gradient(ellipse 140% 90% at 15% -30%, rgba(134,239,172,0.38) 0%, transparent 55%),
            radial-gradient(ellipse 90% 70% at 85% 5%,   rgba(147,210,255,0.30) 0%, transparent 52%),
            radial-gradient(ellipse 70% 60% at 50% 110%, rgba(196,181,253,0.18) 0%, transparent 60%),
            #f8fbf9;
        }

        @keyframes floatA {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-12px) scale(1.03); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(10px) scale(0.97); }
        }

        .login-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(72px);
          pointer-events: none;
        }
        .login-orb-a { animation: floatA 9s ease-in-out infinite; }
        .login-orb-b { animation: floatB 11s ease-in-out infinite; }
        .login-orb-c { animation: floatA 13s ease-in-out infinite 2s; }
      `}</style>

      <main className="login-page">
        {/* Floating orbs — same as hero */}
        <div
          className="login-orb login-orb-a"
          style={{
            width: 380,
            height: 380,
            top: "-80px",
            left: "-60px",
            background: "rgba(134,239,172,0.26)",
          }}
        />
        <div
          className="login-orb login-orb-b"
          style={{
            width: 260,
            height: 260,
            top: "40px",
            right: "-50px",
            background: "rgba(147,210,255,0.22)",
          }}
        />
        <div
          className="login-orb login-orb-c"
          style={{
            width: 200,
            height: 200,
            bottom: "0",
            left: "35%",
            background: "rgba(196,181,253,0.16)",
          }}
        />

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
