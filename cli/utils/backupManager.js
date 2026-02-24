import fs from "fs/promises";
import path from "path";

/**
 * Creates a timestamped backup folder for files that will be modified
 * 
 * @param {string} projectRoot - The root directory of the project
 * @returns {Promise<string>} - The path to the backup directory
 */
export async function createBackupDir(projectRoot) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] + 
                    "-" + new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
  
  const backupRoot = path.join(projectRoot, ".codeproof-backup");
  const backupDir = path.join(backupRoot, timestamp);

  await fs.mkdir(backupDir, { recursive: true });
  
  return backupDir;
}

/**
 * Backs up a single file to the backup directory
 * 
 * @param {string} filePath - The absolute path to the file to backup
 * @param {string} projectRoot - The root directory of the project
 * @param {string} backupDir - The backup directory path
 * @returns {Promise<void>}
 */
export async function backupFile(filePath, projectRoot, backupDir) {
  try {
    const relativePath = path.relative(projectRoot, filePath);
    const backupPath = path.join(backupDir, relativePath);
    const backupParentDir = path.dirname(backupPath);

    // Ensure parent directory exists
    await fs.mkdir(backupParentDir, { recursive: true });

    // Copy the file
    await fs.copyFile(filePath, backupPath);
  } catch (error) {
    throw new Error(`Failed to backup ${filePath}: ${error.message}`);
  }
}

/**
 * Backs up multiple files to the backup directory
 * 
 * @param {string[]} filePaths - Array of absolute file paths to backup
 * @param {string} projectRoot - The root directory of the project
 * @param {string} backupDir - The backup directory path
 * @returns {Promise<number>} - Number of files successfully backed up
 */
export async function backupFiles(filePaths, projectRoot, backupDir) {
  let successCount = 0;

  for (const filePath of filePaths) {
    try {
      await backupFile(filePath, projectRoot, backupDir);
      successCount++;
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
    }
  }

  return successCount;
}

/**
 * Gets a user-friendly backup directory name for display
 * 
 * @param {string} backupDir - The absolute backup directory path
 * @param {string} projectRoot - The root directory of the project
 * @returns {string}
 */
export function getBackupDisplayPath(backupDir, projectRoot) {
  const relativePath = path.relative(projectRoot, backupDir);
  return relativePath.replace(/\\/g, "/");
}
