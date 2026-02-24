"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');

        /* ── Fixed outer shell: full width, padded so pill never bleeds ── */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          /* Critical: padding keeps the pill away from screen edges on ALL sizes */
          padding: 10px 12px 0;
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Pill: constrained inside the padded outer shell ── */
        .navbar-pill {
          /* Never wider than its parent (which already has 12px padding each side) */
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
          box-sizing: border-box;
          background: rgba(248, 251, 249, 0.90);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 100px;
          box-shadow: 0 4px 28px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
          overflow: hidden;
          transition: border-radius 0.3s ease;
        }
        .navbar-pill.menu-open {
          border-radius: 20px;
        }

        /* ── Top row ── */
        .navbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 6px 0 14px;
        }

        /* ── Logo ── */
        .logo {
          display: flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          flex-shrink: 0;
          min-width: 0;
        }
        .logo-mark {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: linear-gradient(135deg, #1d6ef5 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(29,110,245,0.35);
          flex-shrink: 0;
        }
        .logo-wordmark {
          font-size: 13.5px;
          font-weight: 500;
          color: #0f172a;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .logo-wordmark em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 16px;
          background: linear-gradient(130deg, #1d6ef5 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        /* ── Desktop nav ── */
        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 1px;
        }
        .nav-link {
          font-size: 13px;
          font-weight: 400;
          color: #64748b;
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 100px;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .nav-link:hover { color: #0f172a; background: rgba(0,0,0,0.04); }
        .nav-sep {
          width: 1px; height: 12px;
          background: rgba(0,0,0,0.1);
          margin: 0 4px;
          flex-shrink: 0;
        }
        .nav-cta {
          font-size: 12.5px;
          font-weight: 500;
          color: #fff;
          text-decoration: none;
          padding: 6px 15px;
          border-radius: 100px;
          background: linear-gradient(135deg, #1d6ef5, #0ea5e9);
          box-shadow: 0 2px 10px rgba(29,110,245,0.30), inset 0 1px 0 rgba(255,255,255,0.18);
          transition: all 0.2s ease;
          white-space: nowrap;
          margin-left: 4px;
        }
        .nav-cta:hover {
          box-shadow: 0 4px 16px rgba(29,110,245,0.42);
          transform: translateY(-1px);
        }

        /* ── Hamburger ── */
        .hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 100px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
          margin-left: 6px;
        }
        .hamburger:hover { background: rgba(0,0,0,0.05); }
        .hamburger-icon {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 16px;
        }
        .hamburger-icon span {
          display: block;
          height: 1.5px;
          background: #374151;
          border-radius: 2px;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          transform-origin: center;
        }
        .hamburger.open .hamburger-icon span:nth-child(1) {
          transform: translateY(5.5px) rotate(45deg);
        }
        .hamburger.open .hamburger-icon span:nth-child(2) {
          opacity: 0; transform: scaleX(0);
        }
        .hamburger.open .hamburger-icon span:nth-child(3) {
          transform: translateY(-5.5px) rotate(-45deg);
        }

        /* ── Mobile drawer ── */
        .nav-mobile {
          display: none;
          flex-direction: column;
          padding: 0 10px 10px;
          gap: 2px;
          border-top: 1px solid rgba(0,0,0,0.05);
          animation: slideDown 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-mobile.open { display: flex; }

        .mob-link {
          font-size: 13.5px;
          font-weight: 400;
          color: #374151;
          text-decoration: none;
          padding: 9px 10px;
          border-radius: 10px;
          transition: background 0.15s, color 0.15s;
        }
        .mob-link:hover { background: rgba(0,0,0,0.04); color: #0f172a; }
        .mob-sep {
          height: 1px;
          background: rgba(0,0,0,0.06);
          margin: 4px 10px;
        }
        .mob-cta {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          text-decoration: none;
          padding: 10px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1d6ef5, #0ea5e9);
          text-align: center;
          margin-top: 2px;
          box-shadow: 0 2px 10px rgba(29,110,245,0.25);
        }

        /* ── Breakpoint ── */
        @media (max-width: 640px) {
          .nav-desktop { display: none; }
          .hamburger   { display: flex; }
        }
      `}</style>

      <header className="navbar">
        <div className={`navbar-pill${menuOpen ? " menu-open" : ""}`}>
          <div className="navbar-row">
            <Link href="/" className="logo" onClick={closeMenu}>
              <div className="logo-mark">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1L8 4.5H11L8.5 6.8 9.5 10.5 6 8.2 2.5 10.5 3.5 6.8 1 4.5H4L6 1Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                </svg>
              </div>
              <span className="logo-wordmark">
                Code<em>Proof</em>
              </span>
            </Link>

            {/* Desktop */}
            <nav className="nav-desktop">
              <Link href="/#how-it-works" className="nav-link">
                How It Works
              </Link>
              <Link href="/#features" className="nav-link">
                Features
              </Link>
              <div className="nav-sep" />
              <Link
                href="https://github.com/Nithin0620/code_proof"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </Link>
              <Link
                href="https://www.npmjs.com/package/codeproof"
                className="nav-link"
                target="_blank"
                rel="noreferrer"
              >
                npm
              </Link>
              <Link href="/dashboard" className="nav-cta">
                Dashboard →
              </Link>
            </nav>

            {/* Hamburger */}
            <button
              className={`hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <div className="hamburger-icon">
                <span />
                <span />
                <span />
              </div>
            </button>
          </div>

          {/* Mobile drawer */}
          <div className={`nav-mobile${menuOpen ? " open" : ""}`}>
            <Link
              href="/#how-it-works"
              className="mob-link"
              onClick={closeMenu}
            >
              How It Works
            </Link>
            <Link href="/#features" className="mob-link" onClick={closeMenu}>
              Features
            </Link>
            <div className="mob-sep" />
            <Link
              href="https://github.com/Nithin0620/code_proof"
              className="mob-link"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
            >
              GitHub ↗
            </Link>
            <Link
              href="https://www.npmjs.com/package/codeproof"
              className="mob-link"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
            >
              npm ↗
            </Link>
            <Link href="/dashboard" className="mob-cta" onClick={closeMenu}>
              Open Dashboard →
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
