import execSync from 'child_process';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { Logger } from './logger';
import { redactSecrets } from './secretRedactor';
import { OwnerDecisionItem, QueueTask, UsageState } from './types';

export interface SentNotificationRecord {
  key: string;
  eventType: string;
  taskId?: string;
  sentAt: string;
}

export function getTelegramEnvVar(name: string): string | undefined {
  if (process.env[name] && process.env[name]!.trim().length > 0) {
    return process.env[name]!.trim();
  }
  try {
    const cmd = `[Environment]::GetEnvironmentVariable('${name}', 'User')`;
    const val = execSync.execSync(`powershell -NoProfile -Command "${cmd}"`, { encoding: 'utf-8', windowsHide: true }).trim();
    return val.length > 0 ? val : undefined;
  } catch {
    return undefined;
  }
}

export class TelegramNotifier {
  private botToken?: string;
  private chatId?: string;
  private logger: Logger;
  private sentNotificationsFilePath: string;
  private mockMode: boolean;

  constructor(botToken?: string, chatId?: string, logger?: Logger, sentNotificationsFilePath?: string, mockMode?: boolean) {
    this.botToken = botToken || getTelegramEnvVar('TELEGRAM_BOT_TOKEN');
    this.chatId = chatId || getTelegramEnvVar('TELEGRAM_CHAT_ID');
    this.logger = logger || new Logger();
    this.sentNotificationsFilePath = sentNotificationsFilePath || path.join(CONFIG.DATA_DIR, 'notifications-sent.json');
    this.mockMode = mockMode !== undefined ? mockMode : (process.env.NODE_ENV === 'test');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(this.sentNotificationsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.botToken && this.botToken.length > 0 && this.chatId && this.chatId.length > 0);
  }

  private getSentNotifications(): SentNotificationRecord[] {
    if (!fs.existsSync(this.sentNotificationsFilePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.sentNotificationsFilePath, 'utf-8');
      return JSON.parse(data) as SentNotificationRecord[];
    } catch {
      return [];
    }
  }

  private saveSentNotifications(records: SentNotificationRecord[]): void {
    this.ensureDataDirectory();
    fs.writeFileSync(this.sentNotificationsFilePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  public isDuplicate(key: string, suppressionWindowMs: number = 24 * 60 * 60 * 1000): boolean {
    const records = this.getSentNotifications();
    const existing = records.find(r => r.key === key);
    if (!existing) return false;

    const sentTime = new Date(existing.sentAt).getTime();
    const now = Date.now();
    return (now - sentTime) < suppressionWindowMs;
  }

  private recordNotificationSent(key: string, eventType: string, taskId?: string): void {
    const records = this.getSentNotifications();
    const nowIso = new Date().toISOString();
    const existingIndex = records.findIndex(r => r.key === key);

    if (existingIndex !== -1) {
      records[existingIndex].sentAt = nowIso;
    } else {
      records.push({ key, eventType, taskId, sentAt: nowIso });
    }
    this.saveSentNotifications(records);
  }

  public async sendMessage(text: string, dedupKey?: string, eventType: string = 'GENERIC'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      this.logger.log('[TELEGRAM] Skipped message dispatch: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.');
      return { success: false, error: 'TELEGRAM_NOT_CONFIGURED' };
    }

    if (dedupKey && this.isDuplicate(dedupKey)) {
      this.logger.log(`[TELEGRAM] Suppressed duplicate notification for key: ${dedupKey}`);
      return { success: true, error: 'DUPLICATE_SUPPRESSED' };
    }

    const sanitizedText = redactSecrets(text);

    if (this.mockMode) {
      this.logger.log(`[TELEGRAM_MOCK] Message dispatched successfully for key: ${dedupKey || 'MOCK_KEY'}`);
      if (dedupKey) {
        this.recordNotificationSent(dedupKey, eventType);
      }
      return { success: true, messageId: 'mock_msg_99999' };
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const body = JSON.stringify({
      chat_id: this.chatId,
      text: sanitizedText
    });

    let lastError = '';
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });

        if (res.ok) {
          const data: any = await res.json();
          const messageId = String(data.result?.message_id || 'UNKNOWN');
          this.logger.log(`[TELEGRAM_SUCCESS] Delivered message ID: ${messageId}`);
          if (dedupKey) {
            this.recordNotificationSent(dedupKey, eventType);
          }
          return { success: true, messageId };
        } else {
          const errText = await res.text();
          lastError = `HTTP ${res.status}: ${redactSecrets(errText)}`;
          if (res.status >= 400 && res.status < 500) {
            // 4xx errors (e.g. invalid chat ID or bad request) should not be retried endless
            break;
          }
        }
      } catch (err: any) {
        lastError = redactSecrets(err.message);
      }
    }

    this.logger.error(`[TELEGRAM_NOTIFICATION_FAILED] Message dispatch failed: ${lastError}`);
    return { success: false, error: `TELEGRAM_NOTIFICATION_FAILED: ${lastError}` };
  }

  // --- Specific Event Notification Helpers ---

  public async notifyOwnerDecisionRequired(task: QueueTask, decision: OwnerDecisionItem): Promise<boolean> {
    const dedupKey = `OWNER_DECISION_${task.taskId}_${decision.decisionId}`;
    const text = `🔴 ACELEETME KARAR BEKLİYOR\n\n` +
      `Konu:\n${decision.shortTitle}\n\n` +
      `Sebep:\n${decision.reason}\n\n` +
      `Seçenek A:\n${decision.optionA}\n\n` +
      `Seçenek B:\n${decision.optionB}\n\n` +
      `Güvenli Varsayılan:\n${decision.safeDefault}\n\n` +
      `Karar verilmezse:\n${decision.riskIfNoDecision}\n\n` +
      `Task:\n${task.taskId}`;

    const res = await this.sendMessage(text, dedupKey, 'OWNER_DECISION_REQUIRED');
    return res.success;
  }

  public async notifyCriticalError(taskId: string, failureClassification: string, runnerState: string = 'BLOCKED', actionTaken: string = 'Görevi güvenli şekilde durdurdu.', ownerActionRequired: string = 'Owner incelemesi gerekiyor.'): Promise<boolean> {
    const dedupKey = `CRITICAL_ERROR_${taskId}_${failureClassification.slice(0, 40)}`;
    const text = `🚨 ACELEETME KRİTİK UYARI\n\n` +
      `Durum:\n${failureClassification}\n\n` +
      `Task:\n${taskId}\n\n` +
      `Güvenli durum:\n${runnerState}\n\n` +
      `Otomatik işlem:\n${actionTaken}\n\n` +
      `Owner action:\n${ownerActionRequired}`;

    const res = await this.sendMessage(text, dedupKey, 'CRITICAL_ERROR');
    return res.success;
  }

  public async notifyOpenAiBudgetExhausted(): Promise<boolean> {
    const today = new Date().toISOString().slice(0, 10);
    const dedupKey = `OPENAI_BUDGET_EXHAUSTED_${today}`;
    const text = `💳 ACELEETME API BÜTÇE UYARISI\n\n` +
      `OpenAI reviewer kredisi/limiti tükendi.\n\n` +
      `Reviewer gerektiren görevler güvenli şekilde bloklandı.\n\n` +
      `Production etkisi:\nYOK\n\n` +
      `Otomatik kredi satın alma:\nKAPALI`;

    const res = await this.sendMessage(text, dedupKey, 'OPENAI_BUDGET_EXHAUSTED');
    return res.success;
  }

  public async notifyRunnerRestartLimitReached(): Promise<boolean> {
    const today = new Date().toISOString().slice(0, 10);
    const dedupKey = `RUNNER_RESTART_LIMIT_REACHED_${today}`;
    const text = `⚠️ ACELEETME RUNNER DURDU\n\n` +
      `Runner güvenlik limiti nedeniyle otomatik yeniden başlatmayı durdurdu.\n\n` +
      `GREEN görevler:\nBEKLİYOR\n\n` +
      `RED görevler:\nZATEN BLOKLU\n\n` +
      `Production:\nETKİLENMEDİ`;

    const res = await this.sendMessage(text, dedupKey, 'RUNNER_RESTART_LIMIT_REACHED');
    return res.success;
  }

  public async sendDailySummary(
    completed: number,
    completedWithLimitation: number,
    failed: number,
    blocked: number,
    ownerDecisions: number,
    lunaCalls: number,
    solCalls: number,
    restarts: number,
    criticalErrors: number
  ): Promise<boolean> {
    const today = new Date().toISOString().slice(0, 10);
    const dedupKey = `DAILY_SUMMARY_${today}`;
    const text = `📊 ACELEETME GÜNLÜK ÖZET (${today})\n\n` +
      `✅ Tamamlanan görevler: ${completed}\n` +
      `⚠️ Limitation ile tamamlananlar: ${completedWithLimitation}\n` +
      `❌ Başarısız görevler: ${failed}\n` +
      `⛔ Bloklu görevler: ${blocked}\n` +
      `🔴 Owner kararları: ${ownerDecisions}\n` +
      `🤖 Luna çağrıları: ${lunaCalls}\n` +
      `🧠 Sol çağrıları: ${solCalls}\n` +
      `🔄 Runner restart sayısı: ${restarts}\n` +
      `🚨 Kritik hata sayısı: ${criticalErrors}`;

    const res = await this.sendMessage(text, dedupKey, 'DAILY_SUMMARY');
    return res.success;
  }
}
