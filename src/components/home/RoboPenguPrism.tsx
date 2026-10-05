'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './RoboPenguPrism.module.css';

export function RoboPenguPrism({ suspended = false }: { suspended?: boolean }) {
  const host = useRef<HTMLDivElement>(null), video = useRef<HTMLVideoElement>(null);
  const [desktop, setDesktop] = useState(false), [loaded, setLoaded] = useState(false), [playing, setPlaying] = useState(false);
  const paused = useRef(false), manuallyAllowed = useRef(false), visible = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  useEffect(() => {
    const size = matchMedia('(min-width: 1280px) and (hover: hover) and (pointer: fine)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const sync = () => {
      setDesktop(size.matches);
      const allowed = manuallyAllowed.current || (!motion.matches && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType || ''));
      if (size.matches && visible.current && !document.hidden && allowed && !paused.current && !suspended) setLoaded(true);
      if (!size.matches || !visible.current || document.hidden || !allowed || paused.current || suspended) video.current?.pause();
      else video.current?.play().catch(() => setPlaying(false));
    };
    syncRef.current = sync;
    const observer = new IntersectionObserver(entries => { visible.current = entries[0].isIntersecting; sync(); }, { threshold: 0.2 });
    if (host.current) observer.observe(host.current);
    size.addEventListener('change', sync); motion.addEventListener('change', sync); document.addEventListener('visibilitychange', sync); sync();
    return () => { observer.disconnect(); size.removeEventListener('change', sync); motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, [suspended]);
  useEffect(() => { if (loaded && desktop) syncRef.current(); }, [loaded, desktop]);
  function toggle() { if (playing) paused.current = true; else { paused.current = false; manuallyAllowed.current = true; } syncRef.current(); }
  return <div className={styles.prism} ref={host} aria-label="RoboPengu laboratuvar ekranı">
    {desktop && <div className={styles.screen}>
      <div className={styles.glass}>
        <video ref={video} muted loop playsInline preload="none" poster="/assets/robopengu-lab-poster.webp" src={loaded ? '/assets/robopengu-lab.mp4' : undefined} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} aria-label="RoboPengu laboratuvar videosu" />
        <span className={styles.edgeLight} aria-hidden="true" />
      </div>
      <div className={styles.caption}><span><strong>ROBOPENGU</strong><small>QUANTUM LAB</small></span><button type="button" aria-label={playing ? 'Laboratuvar videosunu duraklat' : 'Laboratuvar videosunu oynat'} onClick={toggle}>{playing ? <Pause size={13} /> : <Play size={13} />}</button></div>
    </div>}
  </div>;
}
