'use client';

import { useEffect, useRef } from 'react';

export function useModalFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open || !ref.current) return;
    const dialog = ref.current;
    const trigger = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const elements = () => [...dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.tabIndex>=0 && el.getClientRects().length>0);
    const frame = requestAnimationFrame(()=>(elements()[0] || dialog).focus());
    const keydown = (event: KeyboardEvent) => {
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeRef.current();}
      if(event.key==='Tab'){
        const list=elements(),first=list[0],last=list.at(-1);
        if(!first||!last){event.preventDefault();dialog.focus();}
        else if(!dialog.contains(document.activeElement)||(event.shiftKey&&document.activeElement===first)||(!event.shiftKey&&document.activeElement===last)) {event.preventDefault();(event.shiftKey?last:first).focus();}
      }
    };
    const focusin = (event: FocusEvent) => {if(event.target instanceof Node&&!dialog.contains(event.target))(elements()[0]||dialog).focus();};
    document.addEventListener('keydown',keydown,true);document.addEventListener('focusin',focusin);
    return ()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',keydown,true);document.removeEventListener('focusin',focusin);document.body.style.overflow=oldOverflow;requestAnimationFrame(()=>{if(trigger?.isConnected)trigger.focus();});};
  },[open]);
  return ref;
}
