import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { redactSecrets } from './secretRedactor';

export class Logger {
  private logFilePath: string;

  constructor(logFilePath?: string) {
    this.logFilePath = logFilePath || CONFIG.LOG_FILE_PATH;
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public log(event: string, meta?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    let metaStr = '';
    if (meta) {
      try {
        metaStr = ` | META: ${JSON.stringify(meta)}`;
      } catch {
        metaStr = '';
      }
    }

    const rawLine = `[${timestamp}] ${event}${metaStr}`;
    const sanitizedLine = redactSecrets(rawLine);

    console.log(sanitizedLine);

    try {
      this.ensureLogDir();
      fs.appendFileSync(this.logFilePath, `${sanitizedLine}\n`, 'utf-8');
    } catch {
      // Ignore file append errors
    }
  }

  public error(event: string, err?: any): void {
    const errMessage = err ? (err.message || String(err)) : '';
    this.log(`[ERROR] ${event}${errMessage ? ` - ${errMessage}` : ''}`);
  }
}
