export const CONTACT_RECIPIENT = 'info@aceleetme.tech';
export const CONTACT_SUBJECTS = ['Genel Soru / Öneri', 'İş Birliği & Sponsorluk', 'Fiyat / Ürün Hatası Bildirimi', 'KVKK & Veri Gizliliği Talebi', 'Diğer'] as const;
export interface ContactFields { name: string; email: string; subject: string; message: string }
export interface ContactDraft { recipient: string; subject: string; body: string; mailto: string; text: string }
export type ContactDraftResult = { ok: true; draft: ContactDraft } | { ok: false; error: string; field: keyof ContactFields };

/** Creates a local draft only. Preparing a mailto link does not send an email. */
export function createContactDraft(fields: ContactFields): ContactDraftResult {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.replace(/\r\n?/g, '\n').trim();
  if (!name || name.length > 120 || /[\r\n\x00-\x1f\x7f]/.test(name)) return { ok: false, field: 'name', error: 'Adınızı 1–120 karakter arasında, tek satır olarak yazın.' };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\x00-\x1f\x7f]/.test(email)) return { ok: false, field: 'email', error: 'Geçerli bir e-posta adresi yazın.' };
  if (!(CONTACT_SUBJECTS as readonly string[]).includes(fields.subject)) return { ok: false, field: 'subject', error: 'Listeden bir konu seçin.' };
  if (!message || message.length > 4000 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(message)) return { ok: false, field: 'message', error: 'Mesajınızı 1–4.000 karakter arasında yazın.' };
  const subject = `[aceleEtme İletişim] ${fields.subject} - ${name}`;
  const body = `Gönderen Adı Soyadı: ${name}\nGönderen E-Posta: ${email}\nKonu Başlığı: ${fields.subject}\n\nMesaj:\n${message}\n\n---\nBu taslak aceleEtme iletişim formunda hazırlanmıştır.`;
  return { ok: true, draft: { recipient: CONTACT_RECIPIENT, subject, body,
    mailto: `mailto:${CONTACT_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    text: `Alıcı: ${CONTACT_RECIPIENT}\nKonu: ${subject}\n\n${body}` } };
}
