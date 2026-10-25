'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, SlidersHorizontal, Sparkles, Trophy } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';
import { useHomeCopy } from '@/lib/i18n/useHomeCopy';
import { comparisonDecision, televisionTechnology, type ChatComparison, type ComparisonPriority } from '@/lib/ai/chatComparison';
import styles from './RoboPenguComparison.module.css';

export function RoboPenguComparison({ data, onClose }: { data: ChatComparison; onClose: () => void }) {
  const h = useHomeCopy();
  const heading = useRef<HTMLHeadingElement>(null);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [priority, setPriority] = useState<ComparisonPriority>('general');
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const isTV = data.products[0].category === 'tvs';
  const decision = comparisonDecision(data, priority);
  const rows = data.rows.filter(row => !differencesOnly || row.different);
  const technology = data.rows.find(row => row.key.split(':')[1] === 'displayTech');
  const essentials = data.rows.filter(row => ['displayTech', 'screenSizeInches', 'refreshRateHz'].includes(row.key.split(':')[1]));

  return <aside className={styles.panel} aria-labelledby="pengu-comparison-title">
    <header className={styles.header}><div><span className={styles.eyebrow}><SlidersHorizontal size={13} />{h('YAN YANA, DAHA NET')}</span><h3 ref={heading} tabIndex={-1} id="pengu-comparison-title">{h(isTV ? 'Televizyon karşılaştırması' : 'Ürün karşılaştırması')}</h3></div><button onClick={onClose} type="button" aria-label={h('Sohbete dön')}><ArrowLeft size={17} /><span>{h('Sohbete dön')}</span></button></header>
    <div className={styles.scroll}>
      <div className={styles.products}>{data.products.map((p, i) => <article key={p.id}><span className={styles.number}>0{i + 1}</span><div className={styles.photo}><ProductImage src={p.image} alt={p.name} variant="card" /></div><h4>{p.name}</h4><Link href={`/${p.category}/${p.slug}`}>{h('Ürünü incele')}<ArrowUpRight size={14} /></Link><dl className={styles.keySpecs}>{essentials.map(row => <div key={row.key}><dt>{h(row.label)}</dt><dd>{row.values[i]}</dd></div>)}</dl></article>)}</div>
      <section className={styles.verdict} aria-labelledby="pengu-verdict-title"><div className={styles.verdictTitle}><Sparkles size={19} /><h4 id="pengu-verdict-title">{h('RoboPengu’nun kararı')}</h4></div>
        {isTV && <label className={styles.priority}>{h('Senin için önemli olan')}<select value={priority} onChange={e => setPriority(e.target.value as ComparisonPriority)}><option value="general">{h('Genel değerlendirme')}</option><option value="refreshRateHz">{h('Yenileme hızı')}</option><option value="hdmiPorts">{h('HDMI bağlantı sayısı')}</option></select></label>}
        <div role="status">{decision ? <><div className={styles.winner}><Trophy size={19} /><strong>{h('Bu ölçütte önde')}: {decision.product.name}</strong></div><p>{h(decision.row.label)}: {decision.row.values.join(' / ')}.</p><p>{h('Seçim yalnızca bu kayıtlı değere dayanır; genel görüntü kalitesi veya oyun performansı kazananı değildir.')}</p></> : <><strong>{h(priority === 'general' ? 'Kesin bir genel kazanan yok' : 'Bu ölçütte kazanan belirlenmedi')}</strong><p>{h(priority === 'general' ? 'Ortak koşullarda doğrulanmış testler olmadan genel kazanan seçmiyorum. Önceliğini seç; karşılaştırılabilir bir üstünlük varsa nedenini göstereyim.' : 'Değerler eşit, eksik veya karşılaştırmaya uygun değil. Bu durum genel bir beraberlik anlamına gelmez.')}</p></>}</div>
      </section>
      {isTV && technology && <section className={styles.technology}><h4>{h('Teknoloji farkı ne demek?')}</h4><div>{data.products.map((p, i) => {const tech = televisionTechnology(technology.values[i]); return <article key={p.id}><span>0{i + 1} · {technology.values[i]}</span><strong>{h(tech?.title || 'Modelin ayrıntıları önemli')}</strong><p>{h(tech?.detail || 'Panel adı tek başına performansı anlatmaz. Arka aydınlatma, kontrast, yansıma ve parlaklık için modele özel karşılaştırılabilir veriye ihtiyaç var.')}</p>{tech && <a href={tech.url} target="_blank" rel="noopener noreferrer">{h('Teknoloji kaynağı')}<ArrowUpRight size={12} /></a>}</article>;})}</div><small>{h('Bu açıklamalar teknoloji prensibini anlatır; ürünün tüm özelliklerini doğrulamaz.')}</small></section>}
      <div className={styles.tableHeading}><h4>{h('Özellikler')}</h4><label><input type="checkbox" checked={differencesOnly} onChange={e => setDifferencesOnly(e.target.checked)} />{h('Yalnız farklar')}</label></div>
      <p className={styles.caption}>{h('Katalog kayıtları · Eksik bilgi destek yok anlamına gelmez.')}</p>
      <table className={styles.table}><caption className={styles.srOnly}>{data.products.map(p => p.name).join(' / ')}</caption><thead><tr><th scope="col">{h('Özellik')}</th>{data.products.map((p, i) => <th scope="col" key={p.id}><span aria-hidden="true">0{i + 1}<strong>{p.name.split(' ').slice(0, 2).join(' ')}</strong></span><span className={styles.srOnly}>{p.name}</span></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.key}><th scope="row">{h(row.label)}</th>{row.values.map((value, i) => <td key={i} className={row.different ? styles.different : undefined}><span>{value}</span>{decision?.row.key === row.key && row.leader === i && <Check size={14} aria-label={h('Daha yüksek kayıtlı değer')} />}</td>)}</tr>)}</tbody></table>
      {!rows.length && <p className={styles.empty}>{h('Kayıtlı bir fark bulunamadı.')}</p>}
      <Link className={styles.fullLink} href={`/compare?d1=${encodeURIComponent(data.products[0].id)}&d2=${encodeURIComponent(data.products[1].id)}`}>{h('Tam karşılaştırmayı aç')}<ArrowUpRight size={16} /></Link>
    </div>
  </aside>;
}
