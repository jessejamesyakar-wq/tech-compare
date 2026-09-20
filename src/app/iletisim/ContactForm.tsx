'use client';

import { createContactDraft, CONTACT_SUBJECTS, type ContactDraft } from '@/lib/contactDraft';
import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, Mail, MessageSquare, User, AtSign, HelpCircle } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Genel Soru / Öneri');
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState<ContactDraft | null>(null);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const draftHeadingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (draft) draftHeadingRef.current?.focus(); }, [draft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = createContactDraft({name, email, subject, message});
    setCopyStatus('');
    if (!result.ok) { setError(result.error); document.getElementById('contact-' + result.field)?.focus(); return; }
    setError('');
    setDraft(result.draft);
  };

  if (draft) return (
    <div className="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
      <h3 ref={draftHeadingRef} tabIndex={-1} className="text-base font-bold text-slate-900 dark:text-white focus:outline-none">E-posta taslağınız hazır</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">Site mesaj göndermedi. Taslağı e-posta uygulamanızda açıp oradan gönderebilir veya metni kopyalayabilirsiniz.</p>
      <label htmlFor="contact-draft" className="block text-xs font-bold text-slate-700 dark:text-slate-200">Taslak metni</label>
      <textarea id="contact-draft" readOnly value={draft.text} rows={10} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-3 text-base leading-relaxed resize-y" />
      <div className="flex flex-wrap gap-3">
        <a href={draft.mailto} className="min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold">
          <Mail className="w-4 h-4 shrink-0" />E-posta Uygulamasında Aç
        </a>
        <button type="button" className="min-h-11 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold" onClick={async () => {
          try { await navigator.clipboard.writeText(draft.text); setCopyStatus('Taslak metni kopyalandı.'); }
          catch { setCopyStatus('Kopyalama izni alınamadı. Yukarıdaki taslak metnini seçerek kopyalayabilirsiniz.'); }
        }}>Taslağı Kopyala</button>
        <button type="button" className="min-h-11 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold" onClick={() => {
          setDraft(null); setCopyStatus(''); requestAnimationFrame(() => nameRef.current?.focus());
        }}>Düzenlemeye Dön</button>
      </div>
      <p role="status" className="text-sm text-slate-700 dark:text-slate-300">{copyStatus}</p>
      <p className="text-xs text-slate-500">E-posta uygulaması açılmazsa taslağı kendi e-posta hesabınıza kopyalayıp info@aceleetme.tech adresine gönderebilirsiniz.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span>Adınız Soyadınız *</span>
          </label>
          <input
            id="contact-name"
            ref={nameRef}
            autoComplete="name"
            maxLength={120}
            type="text"
            required
            aria-required="true"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Mehmet Yakar"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AtSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>E-Posta Adresiniz *</span>
          </label>
          <input
            id="contact-email"
            autoComplete="email"
            maxLength={254}
            type="email"
            required
            aria-required="true"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@alanadi.com"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>Konu Başlığı</span>
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
        >
          {CONTACT_SUBJECTS.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
          <span>Mesajınız *</span>
        </label>
        <textarea
          id="contact-message"
          maxLength={4000}
          required
          aria-required="true"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Lütfen mesajınızı veya bildirmek istediğiniz konuyu detaylandırınız..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-y"
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-slate-500 leading-tight text-center sm:text-left">
          Önce taslağınızı inceleyin. Bu form doğrudan mesaj göndermez.
        </p>
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-11 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm hover:shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>E-posta Taslağı Hazırla</span>
        </button>
      </div>
    </form>
  );
}
