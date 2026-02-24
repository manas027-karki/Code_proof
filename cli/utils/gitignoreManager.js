import fs from "fs/promises";
import path from "path";

/**
 * Ensures that .env files are included in .gitignore
 * 
 * @param {string} projectRoot - Root directory of the project
 * @returns {Promise<{ created: boolean, added: string[] }>}
 */
export async function ensureEnvInGitignore(projectRoot) {
  const gitignorePath = path.join(projectRoot, ".gitignore");
  const entriesToAdd = [".env", ".env.local"];
  const added = [];
  let created = false;

  try {
    let content = "";
    try {
      content = await fs.readFile(gitignorePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        // File doesn't exist, will be created
        created = true;
      } else {
        throw error;
      }
    }

    const lines = content.split("\n").map(line => line.trim());
    
    for (const entry of entriesToAdd) {
      if (!lines.includes(entry)) {
        added.push(entry);
      }
    }

    if (added.length > 0) {
      // Ensure content ends with newline before appending
      if (content && !content.endsWith("\n")) {
        content += "\n";
      }
      
      // Add a comment if this is a new section
      if (content && !content.includes(".env")) {
        content += "\n# Environment variables\n";
      }
      
      content += added.join("\n") + "\n";
      await fs.writeFile(gitignorePath, content, "utf8");
    }

    return { created, added };
  } catch (error) {
    throw new Error(`Failed to update .gitignore: ${error.message}`);
  }
}
