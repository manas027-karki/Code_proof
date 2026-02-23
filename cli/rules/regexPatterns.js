// Centralized regex patterns for deterministic rules.
// Regex-first keeps scans fast and predictable; AI is used only for ambiguous cases.

export const secretPatterns = [
  {
    id: "secret.aws_access_key",
    regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g,
    severity: "block",
    confidence: "high",
    message: "Possible AWS access key detected."
  },
  {
    id: "secret.openai_api_key",
    regex: /\bsk-[a-zA-Z0-9]{20,}\b/g,
    severity: "block",
    confidence: "high",
    message: "Possible OpenAI API key detected."
  },
  {
    id: "secret.stripe_api_key",
    regex: /\b(sk|pk)_(live|test)_[a-zA-Z0-9]{24,}\b/g,
    severity: "block",
    confidence: "high",
    message: "Possible Stripe API key detected."
  },
  {
    id: "secret.github_token",
    regex: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g,
    severity: "block",
    confidence: "high",
    message: "Possible GitHub token detected."
  },
  {
    id: "secret.password_assignment",
    regex: /\b[A-Z_]*PASSWORD[A-Z_]*\s*[:=]\s*['"][^'"\n]{6,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Hardcoded password detected."
  },
  {
    id: "secret.password",
    regex: /\b(password|passwd|pwd)\s*[:=]\s*['"][^'"\n]{6,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Hardcoded password detected."
  },
  {
    id: "secret.api_key_assignment",
    regex: /\b[A-Z_]*API[_-]?KEY[A-Z_]*\s*[:=]\s*['"][A-Za-z0-9\-_]{8,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Possible API key detected."
  },
  {
    id: "secret.generic_api_key",
    regex: /\bapi[_-]?key\s*[:=]\s*['"][A-Za-z0-9\-_]{8,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Possible API key detected."
  },
  {
    id: "secret.token_assignment",
    regex: /\b[A-Z_]*TOKEN[A-Z_]*\s*[:=]\s*['"][^'"\n]{8,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Possible token detected."
  },
  {
    id: "secret.generic_token",
    regex: /\b(token|secret)\s*[:=]\s*['"][^'"\n]{8,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Possible secret material detected."
  },
  {
    id: "secret.secret_assignment",
    regex: /\b[A-Z_]*SECRET[A-Z_]*\s*[:=]\s*['"][^'"\n]{8,}['"]/gi,
    severity: "block",
    confidence: "high",
    message: "Possible secret detected."
  }
];

export const dangerousUsagePatterns = [
  {
    id: "code.dangerous_eval",
    regex: /\b(eval|exec)\s*\(/g,
    severity: "warn",
    confidence: "high",
    message: "Dangerous function usage detected."
  }
];

export const insecureConfigPatterns = [
  {
    id: "config.debug_true",
    regex: /\bDEBUG\s*=\s*true\b/gi,
    severity: "warn",
    confidence: "high",
    message: "Insecure DEBUG flag enabled."
  },
  {
    id: "config.node_env_development",
    regex: /\bNODE_ENV\s*=\s*development\b/gi,
    severity: "warn",
    confidence: "high",
    message: "NODE_ENV set to development."
  }
];
