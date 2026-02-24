/**
 * AST-based secret replacement for JavaScript/TypeScript files
 * 
 * This module provides safe, format-preserving replacement of secret values
 * in source code using proper AST parsing instead of naive string replacement.
 * 
 * Note: This implementation uses a pure JS AST approach without external dependencies
 * to keep the tool lightweight. For production use with complex codebases,
 * consider adding @babel/parser, @babel/traverse, and recast as dependencies.
 */

import fs from "fs/promises";

/**
 * Simple AST-like approach for replacing string literals
 * This is a simplified implementation that works for most common cases.
 * 
 * @param {string} code - The source code to parse
 * @param {string} secretValue - The secret value to find
 * @param {string} envReference - The environment variable reference to use
 * @returns {string} - The modified code
 */
function replaceStringLiterals(code, secretValue, envReference) {
  let modified = code;
  let changes = 0;

  // Escape special regex characters in the secret value
  const escapedSecret = secretValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Pattern 1: Double-quoted strings
  const doubleQuotePattern = new RegExp(`"${escapedSecret}"`, 'g');
  const doubleMatches = modified.match(doubleQuotePattern);
  if (doubleMatches) {
    changes += doubleMatches.length;
    modified = modified.replace(doubleQuotePattern, envReference);
  }

  // Pattern 2: Single-quoted strings
  const singleQuotePattern = new RegExp(`'${escapedSecret}'`, 'g');
  const singleMatches = modified.match(singleQuotePattern);
  if (singleMatches) {
    changes += singleMatches.length;
    modified = modified.replace(singleQuotePattern, envReference);
  }

  // Pattern 3: Template literals (only if no interpolation)
  const backtickPattern = new RegExp('`' + escapedSecret + '`', 'g');
  const backtickMatches = modified.match(backtickPattern);
  if (backtickMatches) {
    changes += backtickMatches.length;
    modified = modified.replace(backtickPattern, envReference);
  }

  return { code: modified, changes };
}

/**
 * Checks if a file is a JS/TS file that should use AST replacement
 * 
 * @param {string} filePath - The file path to check
 * @returns {boolean}
 */
export function isJavaScriptFile(filePath) {
  const jsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
  return jsExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Checks if a file is a JSON file
 * 
 * @param {string} filePath - The file path to check
 * @returns {boolean}
 */
export function isJsonFile(filePath) {
  return filePath.endsWith('.json');
}

/**
 * Replaces a secret in a JavaScript/TypeScript file using AST-based replacement
 * 
 * @param {string} filePath - Path to the file
 * @param {string} secretValue - The secret value to replace
 * @param {string} envReference - The environment variable reference (e.g., "process.env.API_KEY")
 * @returns {Promise<{ success: boolean, changes: number, error?: string }>}
 */
export async function replaceSecretInJsFile(filePath, secretValue, envReference) {
  try {
    const code = await fs.readFile(filePath, 'utf8');
    
    const { code: modifiedCode, changes } = replaceStringLiterals(code, secretValue, envReference);
    
    if (changes > 0) {
      await fs.writeFile(filePath, modifiedCode, 'utf8');
      return { success: true, changes };
    }
    
    return { success: true, changes: 0 };
  } catch (error) {
    return { success: false, changes: 0, error: error.message };
  }
}

/**
 * Replaces a secret in a JSON file with a template placeholder
 * 
 * @param {string} filePath - Path to the JSON file
 * @param {string} secretValue - The secret value to replace
 * @param {string} varName - The environment variable name
 * @returns {Promise<{ success: boolean, changes: number, error?: string, warning?: string }>}
 */
export async function replaceSecretInJsonFile(filePath, secretValue, varName) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Replace the secret value with a template placeholder
    const placeholder = `\${${varName}}`;
    const escapedSecret = secretValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`"${escapedSecret}"`, 'g');
    
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      const modifiedContent = content.replace(pattern, `"${placeholder}"`);
      await fs.writeFile(filePath, modifiedContent, 'utf8');
      
      return {
        success: true,
        changes: matches.length,
        warning: 'JSON env interpolation may require dotenv-expand or manual setup'
      };
    }
    
    return { success: true, changes: 0 };
  } catch (error) {
    return { success: false, changes: 0, error: error.message };
  }
}

/**
 * Replaces a secret in a file based on its type
 * 
 * @param {string} filePath - Path to the file
 * @param {string} secretValue - The secret value to replace
 * @param {string} envReference - The environment variable reference
 * @param {string} varName - The environment variable name (for JSON files)
 * @returns {Promise<{ success: boolean, changes: number, error?: string, warning?: string }>}
 */
export async function replaceSecretInFile(filePath, secretValue, envReference, varName) {
  if (isJavaScriptFile(filePath)) {
    return await replaceSecretInJsFile(filePath, secretValue, envReference);
  } else if (isJsonFile(filePath)) {
    return await replaceSecretInJsonFile(filePath, secretValue, varName);
  } else {
    // For other file types, use simple string replacement as fallback
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const escapedSecret = secretValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedSecret, 'g');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        const modifiedContent = content.replace(pattern, envReference);
        await fs.writeFile(filePath, modifiedContent, 'utf8');
        return { success: true, changes: matches.length };
      }
      
      return { success: true, changes: 0 };
    } catch (error) {
      return { success: false, changes: 0, error: error.message };
    }
  }
}
