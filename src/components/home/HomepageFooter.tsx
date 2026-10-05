import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import styles from './HomepageV2.module.css';

export function HomepageFooter() {
  return <footer className={styles.footer}>
    <div className={styles.footerInner}>
      <div className={styles.footerBrand}><Link href="/" className={styles.footerWordmark}>acele<span>Etme</span></Link><p>İhtiyacını anla. Seçeneklerini karşılaştır.<br />Kararını aceleye getirme.</p></div>
      <nav aria-label="Alt menü"><span>Keşfet</span><Link href="/search">Tüm ürünler</Link><Link href="/compare">Karşılaştır</Link><Link href="/alerts">Fiyat hedeflerim</Link></nav>
      <nav aria-label="Güven ve destek"><span>Güven & destek</span><Link href="/iletisim?subject=hatali-bilgi">Hatalı bilgi bildir <ArrowUpRight size={13} /></Link><Link href="/yasal-uyari">Veri ve fiyat uyarıları</Link><Link href="/iletisim">İletişim</Link></nav>
      <div className={styles.footerPromise}><ShieldCheck size={23} /><strong>Bilmediğimizi de söyleriz.</strong><p>Güncel teklif, son görülen fiyat ve katalog referansı aynı şey değildir.</p></div>
    </div>
    <div className={styles.footerBottom}><span>© 2026 AceleEtme</span><div><Link href="/gizlilik-politikasi">Gizlilik politikası</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link></div></div>
  </footer>;
}
