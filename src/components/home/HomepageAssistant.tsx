'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { LazyAIAssistantModal } from '@/components/ai/LazyAIAssistantModal';
import type { AIAssistantModalProps } from '@/components/ai/AIAssistantModal';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// The shared main element creates a stacking context. Keep the existing modal
// above the sticky navigation without changing its chat/focus/history behavior.
export function HomepageAssistant(props: AIAssistantModalProps) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return mounted ? createPortal(<LazyAIAssistantModal {...props} />, document.body) : null;
}
