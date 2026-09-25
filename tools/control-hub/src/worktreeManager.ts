import execSync from 'child_process';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';

const execOptions = { encoding: 'utf-8' as const, windowsHide: true };

function runCmd(cmd: string, cwd?: string): string {
  try {
    return execSync.execSync(cmd, { ...execOptions, cwd: cwd || CONFIG.CANONICAL_REPO_PATH }).trim();
  } catch (err: any) {
    const stdout = err.stdout ? String(err.stdout) : '';
    const stderr = err.stderr ? String(err.stderr) : '';
    throw new Error(`Command failed: ${cmd}\nStdout: ${stdout}\nStderr: ${stderr}`);
  }
}

export class WorktreeManager {
  private workspacesRoot: string;
  private canonicalRepoPath: string;

  constructor(customWorkspacesRoot?: string, customCanonicalRepo?: string) {
    this.workspacesRoot = customWorkspacesRoot || CONFIG.WORKSPACES_ROOT;
    this.canonicalRepoPath = customCanonicalRepo || CONFIG.CANONICAL_REPO_PATH;
  }

  public createTaskWorktree(taskId: string): { workspacePath: string; originMainHead: string } {
    if (!fs.existsSync(this.workspacesRoot)) {
      fs.mkdirSync(this.workspacesRoot, { recursive: true });
    }

    // Obtain current origin/main commit HEAD from canonical repository
    const originMainHead = runCmd('git rev-parse origin/main', this.canonicalRepoPath);

    const workspacePath = path.join(this.workspacesRoot, taskId);

    // Remove old worktree path if existing leftover
    if (fs.existsSync(workspacePath)) {
      this.removeTaskWorktree(workspacePath);
    }

    // Create isolated detached worktree from origin/main
    runCmd(`git worktree add --detach "${workspacePath}" origin/main`, this.canonicalRepoPath);

    // Verify worktree HEAD equals origin/main HEAD
    const worktreeHead = runCmd('git rev-parse HEAD', workspacePath);
    if (worktreeHead !== originMainHead) {
      throw new Error(`Worktree HEAD mismatch! Expected ${originMainHead}, got ${worktreeHead}`);
    }

    return {
      workspacePath,
      originMainHead
    };
  }

  public removeTaskWorktree(workspacePath: string): { success: boolean; error?: string } {
    // Safety Guard: NEVER allow removal of canonical repo path!
    const normalizedCanonical = path.resolve(this.canonicalRepoPath).toLowerCase();
    const normalizedTarget = path.resolve(workspacePath).toLowerCase();

    if (normalizedTarget === normalizedCanonical || !normalizedTarget.startsWith(path.resolve(this.workspacesRoot).toLowerCase())) {
      return {
        success: false,
        error: `SAFETY VIOLATION: Cannot remove directory outside workspaces root: ${workspacePath}`
      };
    }

    try {
      if (fs.existsSync(workspacePath)) {
        runCmd(`git worktree remove --force "${workspacePath}"`, this.canonicalRepoPath);
      }
      if (fs.existsSync(workspacePath)) {
        fs.rmSync(workspacePath, { recursive: true, force: true });
      }
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Cleanup failed for ${workspacePath}: ${err.message}`
      };
    }
  }

  public checkReadOnlyViolation(workspacePath: string): { clean: boolean; modifiedFiles: string[] } {
    try {
      const output = runCmd('git status --porcelain', workspacePath);
      if (!output) {
        return { clean: true, modifiedFiles: [] };
      }

      const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
      // Filter tracked file modifications (exclude untracked node_modules or .next if gitignored)
      const trackedChanges = lines.filter((l) => {
        const flag = l.substring(0, 2);
        // M, D, R, A on tracked files
        return flag.includes('M') || flag.includes('D') || flag.includes('R') || (flag.includes('A') && !l.includes('node_modules') && !l.includes('.next'));
      });

      if (trackedChanges.length > 0) {
        return {
          clean: false,
          modifiedFiles: trackedChanges
        };
      }

      return { clean: true, modifiedFiles: [] };
    } catch (err: any) {
      return {
        clean: false,
        modifiedFiles: [`ERROR_CHECKING_GIT_STATUS: ${err.message}`]
      };
    }
  }
}
