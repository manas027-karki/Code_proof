# CodeProof

CodeProof is a security-focused developer toolchain that scans code for risky usage, prevents unsafe commits, and publishes findings to a server-backed dashboard. It ships as a CLI, a backend API, a Next.js dashboard, and an optional ML-powered risk classifier.

Deployed dashboard: https://code-proof.vercel.app/

## Highlights
- CLI-driven scanning for secrets, insecure configs, and dangerous usage patterns.
- Commit enforcement hooks to block risky changes.
- Centralized reporting with usage limits and analytics.
- Optional ML risk classifier service (FastAPI).

## Repository layout
- AI/ — FastAPI service for ML risk classification.
- cli/ — CodeProof CLI (init, scan, report, enforcement controls).
- server/ — Express + TypeScript API, usage enforcement, report ingestion.
- dashboard/ — Next.js dashboard UI.
- codeproof-reports/ — Local JSON reports.
- codeproof.config.json — Example configuration.

## Architecture overview
1. The CLI scans files (staged or full repo) based on `codeproof.config.json` rules.
2. Reports are written locally and optionally sent to the server.
3. The server enforces usage limits, stores reports, and serves data to the dashboard.
4. The dashboard visualizes usage and report insights.
5. The AI service (optional) can classify risk levels for text inputs.

## Prerequisites
- Node.js 18+
- npm
- MongoDB (for the backend)
- Python 3.10+ (only for the AI service)

## Quick start (local development)

### 1) Backend server
From server/:
1. Install dependencies:
	- npm install
2. Create .env with required variables:
	- MONGO_URI=<your-mongodb-connection-string>
	- JWT_SECRET=<your-secret>
	- PORT=4000 (optional, default 4000)
3. Start dev server:
	- npm run dev

### 2) Dashboard
From dashboard/:
1. Install dependencies:
	- npm install
2. Create .env.local:
	- NEXT_PUBLIC_API_URL=http://localhost:4000
3. Start dev server:
	- npm run dev

### 3) CLI
From cli/:
1. Install dependencies:
	- npm install
2. Link locally (optional):
	- npm link
3. Initialize and scan a repo:
	- codeproof init
	- codeproof run
	- codeproof report@dashboard

If you prefer npx (published package):
- npx codeproof init

## CLI commands
- init: Initialize CodeProof in the current Git repo.
- run: Run a security scan based on config.
- report@dashboard: Send the latest report to the server and show dashboard link.
- move-secret: Move high-risk secrets to .env safely.
- ignore: Temporarily disable commit enforcement.
- apply: Re-enable commit enforcement.
- whoami: Show the local clientId.
- help: Show CLI help.

## Configuration
CodeProof reads codeproof.config.json from the repository root.

Example:
{
  "projectId": "<uuid>",
  "projectType": "Node",
  "scanMode": "staged",
  "enforcement": "enabled",
  "features": {
	 "reporting": true,
	 "integration": true,
	 "aiEscalation": false,
	 "secretRemediation": false
  },
  "integration": {
	 "enabled": true,
	 "endpointUrl": "http://127.0.0.1:4000/api/reports"
  }
}

### API base override
The CLI defaults to http://127.0.0.1:4000/api for usage checks. Override with:
- CODEPROOF_API_BASE=http://your-server:4000/api

## AI risk classifier (optional)
The AI service exposes a FastAPI endpoint for text-based risk classification.

From AI/:
1. Create and activate a virtual environment.
2. Install dependencies:
	- pip install -r requirements.txt
3. Start the API:
	- uvicorn main:app --host 127.0.0.1 --port 8000

Endpoint:
- POST /predict (text/plain body)

## Reports
Local scan outputs are stored in codeproof-reports/ as JSON. When integration is enabled, the latest report is also sent to the server and visualized in the dashboard.

## Tech stack
- CLI: Node.js (ESM)
- Backend: Express + TypeScript + MongoDB
- Dashboard: Next.js (App Router) + React + Tailwind
- AI: FastAPI + scikit-learn

## License
See individual package.json files for license details.
