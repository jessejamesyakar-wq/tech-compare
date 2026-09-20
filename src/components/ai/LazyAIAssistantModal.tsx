'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { AIAssistantModalProps } from './AIAssistantModal';
import { useModalFocus } from '@/components/ui/useModalFocus';

export function LazyAIAssistantModal(props: AIAssistantModalProps) {
  const [Assistant, setAssistant] = useState<ComponentType<AIAssistantModalProps> | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const focusRef = useModalFocus(props.isOpen && !Assistant, props.onClose);

  useEffect(() => {
    if (!props.isOpen || Assistant) return;
    let active = true;
    setFailed(false);
    const timeout = setTimeout(() => { active = false; setFailed(true); }, 30_000);
    import('./AIAssistantModal').then(module => {
      if (active) setAssistant(() => module.AIAssistantModal);
    }).catch(() => { if (active) setFailed(true); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); };
  }, [props.isOpen, Assistant, attempt]);

  // Keep the loaded instance mounted so closing does not erase an unsent draft.
  if (Assistant) return <Assistant {...props} />;
  if (!props.isOpen) return null;
  return (
    <div ref={focusRef} role="dialog" aria-modal="true" aria-labelledby="assistant-loading-title" tabIndex={-1}
      className="fixed inset-0 z-[100] bg-slate-950/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
        <h2 id="assistant-loading-title" className="text-lg font-bold">RoboPengu</h2>
        <p role={failed ? 'alert' : 'status'} className="text-sm text-slate-600 dark:text-slate-300">
          {failed ? 'RoboPengu yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.' : 'RoboPengu hazırlanıyor…'}
        </p>
        <div className="flex flex-wrap gap-3">
          {failed && <button type="button" onClick={() => setAttempt(value => value + 1)} className="min-h-11 px-4 rounded-xl bg-emerald-600 text-white font-bold">Yeniden Dene</button>}
          <button type="button" onClick={props.onClose} className="min-h-11 px-4 rounded-xl border border-slate-300 font-bold">Kapat</button>
        </div>
      </div>
    </div>
  );
}
