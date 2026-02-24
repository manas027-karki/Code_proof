import fs from "fs";
import path from "path";

/**
 * Detects the project framework and determines the appropriate
 * environment variable access strategy.
 * 
 * @param {string} projectRoot - The root directory of the project
 * @returns {{ strategy: string, prefix: string | null }}
 */
export function detectEnvStrategy(projectRoot) {
  const packageJsonPath = path.join(projectRoot, "package.json");
  
  if (!fs.existsSync(packageJsonPath)) {
    return { strategy: "process.env", prefix: null };
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    // Check for Vite
    if (dependencies.vite || dependencies.vitest) {
      return { strategy: "import.meta.env", prefix: "VITE_" };
    }

    // Check for Next.js
    if (dependencies.next) {
      return { strategy: "next", prefix: "NEXT_PUBLIC_" };
    }

    // Check for Create React App
    if (dependencies["react-scripts"]) {
      return { strategy: "process.env", prefix: "REACT_APP_" };
    }

    // Default to standard Node.js
    return { strategy: "process.env", prefix: null };
  } catch {
    return { strategy: "process.env", prefix: null };
  }
}

/**
 * Determines if a file is likely frontend code (for Next.js public env vars)
 * 
 * @param {string} filePath - The file path to check
 * @returns {boolean}
 */
export function isFrontendFile(filePath) {
  const frontendPatterns = [
    /[\\/]components[\\/]/,
    /[\\/]pages[\\/]/,
    /[\\/]app[\\/]/,
    /[\\/]src[\\/]app[\\/]/,
    /[\\/]client[\\/]/,
    /[\\/]public[\\/]/,
    /\.client\.(js|ts|jsx|tsx)$/,
    /\.component\.(js|ts|jsx|tsx)$/
  ];

  return frontendPatterns.some(pattern => pattern.test(filePath));
}

/**
 * Generates the appropriate environment variable reference based on strategy
 * 
 * @param {string} varName - The environment variable name
 * @param {string} strategy - The detected strategy
 * @param {string | null} prefix - Optional prefix for the variable
 * @param {string} filePath - The file path where the variable will be used
 * @returns {string}
 */
export function getEnvReference(varName, strategy, prefix, filePath) {
  const finalVarName = prefix ? `${prefix}${varName}` : varName;

  if (strategy === "import.meta.env") {
    return `import.meta.env.${finalVarName}`;
  }

  if (strategy === "next" && isFrontendFile(filePath)) {
    return `process.env.${prefix}${varName}`;
  }

  return `process.env.${finalVarName}`;
}
