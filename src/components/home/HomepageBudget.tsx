'use client';
import { useHomeCopy } from '@/lib/i18n/useHomeCopy';

import { FormEvent, useState } from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import styles from './HomepageV2.module.css';

export function HomepageBudget() {
  const h = useHomeCopy();
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('telefon');
  function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(budget);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const query = h("Bütçem:") + ' ' + String(amount) + ' TL. ' + h("Aradığım ürün:") + ' ' + h(category.charAt(0).toLocaleUpperCase('tr-TR') + category.slice(1)) + '. ' + h("Kullanım amacıma göre birlikte seçelim.");
    window.dispatchEvent(new CustomEvent('robopengu:open', { detail: { query } }));
  }
  return <>
    <section className={styles.budget} aria-labelledby="budget-title">
      <div><p className={styles.eyebrow}><Wallet size={15} /> {h("Bütçene göre keşfet")}</p><h2 id="budget-title">{h("Daha çok harcamadan,")}<br />{h("daha doğru seç.")}</h2><p>{h("Bir bütçe, binlerce seçenek. Önce senin için önemli olanı bulalım.")}</p></div>
      <form onSubmit={submit} className={styles.budgetForm}>
        <div className={styles.budgetFields}>
          <label>{h("Ne arıyorsun?")}<select value={category} onChange={event => setCategory(event.target.value)}><option value="telefon">{h("Telefon")}</option><option value="laptop">{h("Laptop")}</option><option value="televizyon">{h("Televizyon")}</option><option value="tablet">{h("Tablet")}</option><option value="kulaklık">{h("Kulaklık")}</option></select></label>
          <label>{h("Bütçen (TL)")}<input aria-label={h("Bütçen, Türk lirası")} type="number" min="1" max="10000000" step="1" required inputMode="numeric" placeholder={h("Örn. 30000")} value={budget} onChange={event => setBudget(event.target.value)} /></label>
        </div>
        <button type="submit" className={styles.primaryButton}>{h("RoboPengu ile planla")}<ArrowRight size={17} /></button>
        <p className={styles.budgetNote}>{h("AI rehberliğidir, fiyat filtresi değildir. Güncel teklif doğrulanmadan bütçeye uygunluk kesinleştirilemez.")}</p>
      </form>
    </section>
  </>;
}
