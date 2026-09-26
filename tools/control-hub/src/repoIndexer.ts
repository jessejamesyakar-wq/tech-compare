import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import { CONFIG } from './config';

export interface IndexedFileEvidence {
  targetPath: string;
  exists: boolean;
  isTracked: boolean;
  fileSize: number;
  purpose: string;
  referencedBy: string[];
  excerpt: string;
}

export interface RepositoryIndex {
  indexedAt: string;
  totalTrackedUiFiles: number;
  files: IndexedFileEvidence[];
}

export class RepositoryIndexer {
  private repoPath: string;

  constructor(customRepoPath?: string) {
    this.repoPath = customRepoPath || CONFIG.CANONICAL_REPO_PATH;
  }

  public getTrackedFiles(): string[] {
    try {
      const output = execSync.execSync('git ls-files src/components/ src/app/', {
        cwd: this.repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      return output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  public isFileTracked(targetPath: string): boolean {
    const tracked = this.getTrackedFiles().map((f) => f.replace(/\\/g, '/').toLowerCase());
    const normalized = targetPath.replace(/\\/g, '/').toLowerCase();
    return tracked.includes(normalized);
  }

  public findReferences(targetPath: string): string[] {
    const baseName = path.basename(targetPath, path.extname(targetPath));
    try {
      const output = execSync.execSync(`git grep -l "${baseName}" src/`, {
        cwd: this.repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      return output.split('\n').map((l) => l.trim()).filter((l) => l && l !== targetPath);
    } catch {
      return [];
    }
  }

  public buildBoundedIndex(maxFiles: number = 10): RepositoryIndex {
    const trackedFiles = this.getTrackedFiles();
    // Safe UI presentation components candidates
    const safeCandidates = trackedFiles.filter((f) => {
      const norm = f.replace(/\\/g, '/').toLowerCase();
      return (
        norm.startsWith('src/components/') &&
        !norm.includes('/admin/') &&
        !norm.includes('/api/') &&
        !norm.includes('postgres') &&
        !norm.includes('auth') &&
        (norm.endsWith('.tsx') || norm.endsWith('.jsx'))
      );
    }).slice(0, maxFiles);

    const indexedFiles: IndexedFileEvidence[] = safeCandidates.map((targetPath) => {
      const fullPath = path.join(this.repoPath, targetPath);
      const exists = fs.existsSync(fullPath);
      let fileSize = 0;
      let excerpt = '';
      if (exists) {
        const stats = fs.statSync(fullPath);
        fileSize = stats.size;
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        excerpt = lines.slice(0, 40).join('\n');
      }

      const references = this.findReferences(targetPath);

      return {
        targetPath,
        exists,
        isTracked: true,
        fileSize,
        purpose: `UI component in ${path.dirname(targetPath)}`,
        referencedBy: references.slice(0, 5),
        excerpt
      };
    });

    return {
      indexedAt: new Date().toISOString(),
      totalTrackedUiFiles: safeCandidates.length,
      files: indexedFiles
    };
  }
}
