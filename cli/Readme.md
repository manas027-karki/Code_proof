CodeProof CLI
=============

CodeProof is a security-focused CLI that scans your codebase, blocks risky commits, and reports findings to a server-backed dashboard.

Features
--------
- Run security scans on staged or full files.
- Enforce commit safety with configurable rules.
- Generate local reports and optionally sync them to the server.
- Usage tracking with monthly limits (free tier default 50 runs).

Installation
------------
Use npx (recommended):

```bash
npx codeproof init
```

Or install globally:

```bash
npm install -g codeproof
codeproof init
```

Quick Start
-----------
1. Initialize in a Git repo:

```bash
codeproof init
```

2. Run a scan:

```bash
codeproof run
```

3. View reports in the dashboard (requires server):

```bash
codeproof report@dashboard
```

Commands
--------
- init: Initialize CodeProof in the current Git repo.
- run: Run a security scan based on your config.
- report@dashboard: Send latest report and show dashboard link.
- move-secret: Move high-risk secrets to .env safely.
- ignore: Temporarily disable commit enforcement.
- apply: Re-enable commit enforcement.
- whoami: Show the local clientId.
- help: Show CLI help.

Configuration
-------------
CodeProof uses codeproof.config.json at the repo root.

Example:

```json
{
	"projectId": "<uuid>",
	"projectType": "Node",
	"scanMode": "staged",
	"enforcement": "enabled",
	"aiPromptScanner": {
		"enabled": true,
		"useGemini": true
	},
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
```

Usage Limits (Server-Enforced)
------------------------------
CodeProof enforces monthly run limits on the server.

- Default plan: free
- Default monthly limit: 50
- The CLI checks usage before each run
- If the server is unreachable, the CLI fails closed and stops the run

API Base Override
-----------------
By default the CLI uses http://127.0.0.1:4000/api for usage checks.
Override with:

```bash
set CODEPROOF_API_BASE=http://your-server:4000/api
```

move-secret Command
-------------------
Safely moves high-confidence secrets from your source code to environment variables with automatic backups and AST-based replacement.

### Features

- **Smart Detection**: Scans your project using regex + AI detection engine
- **Deterministic Naming**: Generates meaningful variable names (e.g., `OPENAI_API_KEY`, `AWS_ACCESS_KEY`)
- **Framework Awareness**: Detects Vite, Next.js, Create React App and uses appropriate env access patterns
- **AST-Based Replacement**: Uses proper code parsing (not string replacement) to preserve formatting
- **Safety First**: Creates backups before any modifications
- **Duplicate Handling**: Groups identical secrets across files into single env variables
- **JSON Support**: Handles secrets in JSON files with template interpolation

### Usage

Preview changes without modifying files:
```bash
codeproof move-secret --dry-run
```

Apply changes with confirmation:
```bash
codeproof move-secret
```

Apply changes without confirmation (useful for CI/CD):
```bash
codeproof move-secret --force
```

Show detailed output:
```bash
codeproof move-secret --verbose
```

### What It Does

1. **Scans** your project for high-confidence secrets
2. **Groups** duplicate secrets by value
3. **Generates** deterministic environment variable names
4. **Creates** a timestamped backup in `.codeproof-backup/`
5. **Replaces** secrets with appropriate env references:
   - Vite projects: `import.meta.env.VITE_<NAME>`
   - Next.js (frontend): `process.env.NEXT_PUBLIC_<NAME>`
   - React: `process.env.REACT_APP_<NAME>`
   - Default: `process.env.<NAME>`
6. **Updates** your `.env` file with the secret values
7. **Ensures** `.env` and `.env.local` are in `.gitignore`

### Example

Before:
```javascript
const apiKey = "sk-1234567890abcdef";
const dbPassword = "my-secret-password";
```

After running `codeproof move-secret`:
```javascript
const apiKey = process.env.OPENAI_API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

And in `.env`:
```bash
OPENAI_API_KEY=sk-1234567890abcdef
DB_PASSWORD=my-secret-password
```

### Safety Features

- **Backups**: All modified files are backed up before changes
- **Confirmation**: Requires user confirmation unless `--force` is used
- **Dry Run**: Test what would happen without making changes
- **Format Preservation**: AST-based replacement maintains code style
- **No Overwrites**: Won't overwrite existing environment variables
- **Fail-Safe**: Aborts on errors rather than corrupting files

Server Setup (Required for Dashboard)
-------------------------------------
This CLI expects the CodeProof server to be running for:

- Usage enforcement
- Report ingestion
- Dashboard views

If you only want local scanning, disable integration in your config.

Dashboard
---------
The Next.js dashboard displays:

- Project and report metrics
- Analytics charts
- Usage and limit graphs

License
-------
Proprietary. All rights reserved.
