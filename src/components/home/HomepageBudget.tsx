'use client';

import { FormEvent, useRef, useState } from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import { HomepageAssistant } from './HomepageAssistant';
import styles from './HomepageV2.module.css';

export function HomepageBudget() {
  const submitRef = useRef<HTMLButtonElement>(null);
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('telefon');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(budget);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setQuery(`${amount.toLocaleString('tr-TR')} TL bütçeyle ${category} arıyorum. Önce kullanım amacımı sor. Güncel doğrulanmış teklif yoksa bütçeye uygunluk iddiasında bulunma; katalog referanslarını ayrı belirt.`);
    setIsOpen(true);
  }
  return <>
    <section className={styles.budget} aria-labelledby="budget-title">
      <div><p className={styles.eyebrow}><Wallet size={15} /> Bütçene göre keşfet</p><h2 id="budget-title">Daha çok harcamadan,<br />daha doğru seç.</h2><p>Bir bütçe, binlerce seçenek. Önce senin için önemli olanı bulalım.</p></div>
      <form onSubmit={submit} className={styles.budgetForm}>
        <div className={styles.budgetFields}>
          <label>Ne arıyorsun?<select value={category} onChange={event => setCategory(event.target.value)}><option value="telefon">Telefon</option><option value="laptop">Laptop</option><option value="televizyon">Televizyon</option><option value="tablet">Tablet</option><option value="kulaklık">Kulaklık</option></select></label>
          <label>Bütçen (TL)<input aria-label="Bütçen, Türk lirası" type="number" min="1" max="10000000" step="1" required inputMode="numeric" placeholder="Örn. 30000" value={budget} onChange={event => setBudget(event.target.value)} /></label>
        </div>
        <button ref={submitRef} type="submit" className={styles.primaryButton}>RoboPengu ile planla <ArrowRight size={17} /></button>
        <p className={styles.budgetNote}>AI rehberliğidir, fiyat filtresi değildir. Güncel teklif doğrulanmadan bütçeye uygunluk kesinleştirilemez.</p>
      </form>
    </section>
    <HomepageAssistant isOpen={isOpen} onClose={() => { setIsOpen(false); requestAnimationFrame(() => submitRef.current?.focus({ preventScroll: true })); }} initialQuery={query} />
  </>;
}
