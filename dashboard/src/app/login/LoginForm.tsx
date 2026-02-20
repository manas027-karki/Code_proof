"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { config } from "../../lib/config";
import { decodeJwtPayload, setToken } from "../../lib/auth";

type LoginResponse = {
  success: boolean;
  accessToken?: string;
  message?: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = searchParams.get("next") ?? "/dashboard";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!clientId.trim()) {
      setError("Client ID is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        new URL("/api/auth/login", config.apiUrl).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: clientId.trim() }),
        },
      );

      const rawText = await response.text();
      const data = rawText
        ? (JSON.parse(rawText) as LoginResponse & { error?: string })
        : null;

      if (!response.ok || !data?.accessToken) {
        const message =
          data?.message ??
          data?.error ??
          rawText ??
          "Login failed. Please try again.";
        setError(message);
        console.error("Login failed", {
          status: response.status,
          body: rawText,
        });
        return;
      }

      const payload = decodeJwtPayload(data.accessToken);
      const expires = payload?.exp ? new Date(payload.exp * 1000) : undefined;

      setToken(data.accessToken, expires ? { expires } : undefined);
      if (typeof window !== "undefined") {
        window.location.href = nextPath;
        return;
      }
      router.replace(nextPath);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .login-card {
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
          width: 100%;
          max-width: 420px;
          box-sizing: border-box;
        }

        .login-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1d6ef5 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 12px rgba(29,110,245,0.35);
          margin: 0 auto 16px;
        }

        .login-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 2rem;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .login-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(130deg, #1d6ef5 0%, #06b6d4 55%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          display: block;
          margin-bottom: 8px;
        }

        .login-input {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12.5px;
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.80);
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 12px;
          padding: 12px 16px;
          color: #0f172a;
          letter-spacing: 0.02em;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04) inset;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          outline: none;
        }
        .login-input::placeholder {
          color: #cbd5e1;
          font-size: 11px;
        }
        .login-input:focus {
          border-color: rgba(29,110,245,0.35);
          box-shadow: 0 0 0 3px rgba(29,110,245,0.08), 0 1px 3px rgba(0,0,0,0.04) inset;
        }

        .login-error {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 400;
          color: #e11d48;
          background: rgba(255,241,242,0.85);
          border: 1px solid rgba(225,29,72,0.15);
          border-radius: 10px;
          padding: 10px 14px;
          line-height: 1.5;
        }

        .login-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          width: 100%;
          padding: 12px 20px;
          border-radius: 100px;
          border: none;
          background: linear-gradient(135deg, #1d6ef5, #0ea5e9);
          box-shadow: 0 4px 18px rgba(29,110,245,0.30), inset 0 1px 0 rgba(255,255,255,0.18);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(29,110,245,0.40);
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-divider {
          height: 1px;
          background: rgba(0,0,0,0.06);
          margin: 24px 0;
        }
      `}</style>

      <div className="login-card rounded-2xl p-8">
        {/* Logo mark */}
        <div className="text-center">
          <div className="login-logo-mark">
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L8 4.5H11L8.5 6.8 9.5 10.5 6 8.2 2.5 10.5 3.5 6.8 1 4.5H4L6 1Z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
              borderRadius: "100px",
              padding: "4px 12px",
              marginBottom: "14px",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                fill="#10b981"
              />
            </svg>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "10px",
                fontWeight: 400,
                letterSpacing: "0.07em",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              CodeProof
            </span>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 0l1.12 3.88H10L6.94 6.28 8.09 10 5 7.64 1.91 10l1.15-3.72L0 3.88h3.88z"
                fill="#10b981"
              />
            </svg>
          </div>

          <h1 className="login-title">
            Client <em>login</em>
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontWeight: 300,
              fontSize: "13px",
              color: "#64748b",
              marginTop: "8px",
              lineHeight: 1.6,
            }}
          >
            Enter your clientId to access the security dashboard.
          </p>
        </div>

        <div className="login-divider" />

        <form
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          onSubmit={handleSubmit}
        >
          <div>
            <label className="login-label" htmlFor="clientId">
              Client ID (UUID)
            </label>
            <input
              id="clientId"
              type="text"
              name="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              className="login-input"
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-btn"
            disabled={isSubmitting}
            suppressHydrationWarning
          >
            {isSubmitting ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 300,
            fontSize: "11px",
            color: "#94a3b8",
            textAlign: "center",
            marginTop: "20px",
            lineHeight: 1.6,
          }}
        >
          Run{" "}
          <span
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: "10px",
              background: "#f1f5f9",
              padding: "1px 6px",
              borderRadius: "4px",
              color: "#64748b",
            }}
          >
            npx codeproof whoami
          </span>{" "}
          to find your clientId.
        </p>
      </div>
    </>
  );
}
