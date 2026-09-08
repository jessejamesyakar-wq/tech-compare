'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, MessageSquare, User, AtSign, HelpCircle } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Genel Soru / Öneri');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipient = 'info@aceleetme.tech';
    const emailSubject = `[aceleEtme İletişim] ${subject} - ${name}`;
    const emailBody = `Gönderen Adı Soyadı: ${name}\nGönderen E-Posta: ${email}\nKonu Başlığı: ${subject}\n\nMesaj:\n${message}\n\n---\nBu mesaj aceleEtme iletişim formu aracılığıyla oluşturulmuştur.`;

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Open user's default email client
    window.location.href = mailtoUrl;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('Genel Soru / Öneri');
    setMessage('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Mesajınız E-Posta İstemcinize Aktarıldı
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            E-posta uygulamanız (Outlook, Apple Mail, Gmail vb.) üzerinden doğrudan <strong>info@aceleetme.tech</strong> adresine iletebilirsiniz. En kısa sürede geri dönüş sağlayacağız.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:info@aceleetme.tech"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Doğrudan E-Posta Gönder</span>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <span>Yeni Mesaj Yaz</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span>Adınız Soyadınız *</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            aria-required="true"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Mehmet Yakar"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
            type="email"
            required
            aria-required="true"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@alanadi.com"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
        >
          <option value="Genel Soru / Öneri">Genel Soru / Öneri</option>
          <option value="İş Birliği & Sponsorluk">İş Birliği & Sponsorluk</option>
          <option value="Fiyat / Ürün Hatası Bildirimi">Fiyat / Ürün Hatası Bildirimi</option>
          <option value="KVKK & Veri Gizliliği Talebi">KVKK & Veri Gizliliği Talebi</option>
          <option value="Diğer">Diğer</option>
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
          required
          aria-required="true"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Lütfen mesajınızı veya bildirmek istediğiniz konuyu detaylandırınız..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-[11px] text-slate-500 leading-tight text-center sm:text-left">
          Gönder butonuna bastığınızda varsayılan e-posta uygulamanız açılacaktır.
        </p>
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm hover:shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Mesajı Gönder</span>
        </button>
      </div>
    </form>
  );
}
