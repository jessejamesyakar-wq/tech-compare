// src/lib/ai/telegramNotifier.ts
import https from 'https';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8644675544:AAE0g0Mq9D8_Bk5WTsOPYvVGspo4C5Ein4g';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6255335344';

export async function sendTelegramNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Bot token veya chat ID tanimli degil.');
    return false;
  }

  return new Promise((resolve) => {
    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    });

    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (d) => (responseBody += d));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            console.error('[Telegram] Hata:', res.statusCode, responseBody);
            resolve(false);
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('[Telegram] Ag hatasi:', err.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// Olay Tipi Bildirim Yardımcıları
export async function notifyAnomalyToTelegram(anomaly: {
  userPrompt: string;
  assistantResponse: string;
  reasonCategory?: string;
  userComment?: string;
}) {
  const msg = `⚠️ *RoboPengu Site Bekçisi Anomali Uyarısı!*

*Kullanıcı Sorusu:* "${anomaly.userPrompt}"
*Şikayet Türü:* ${anomaly.reasonCategory || 'Genel'}
*Kullanıcı Notu:* ${anomaly.userComment || 'Belirtilmedi'}

Detayları incelemek ve sisteme kural öğretmek için admin paneline göz atabilirsiniz:
🔗 https://aceleetme.tech/admin/learning`;
  return sendTelegramNotification(msg);
}

export async function notifyPriceAnomalyToTelegram(productName: string, storeName: string, price: number, normalPrice?: number) {
  const msg = `🚨 *RoboPengu Fiyat Bekçisi Alarmı!*

*Ürün:* ${productName}
*Mağaza:* ${storeName}
*Şüpheli Fiyat:* ₺${price.toLocaleString('tr-TR')}
${normalPrice ? `*Normal Piyasa:* ₺${normalPrice.toLocaleString('tr-TR')}\n` : ''}
Fiyat güvenlik filtresi tarafından karantinaya alındı! 🛡️`;
  return sendTelegramNotification(msg);
}
