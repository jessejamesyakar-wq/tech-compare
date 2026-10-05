'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { LazyAIAssistantModal } from '@/components/ai/LazyAIAssistantModal';
import type { AIAssistantModalProps } from '@/components/ai/AIAssistantModal';
import { RoboPenguConversation } from './RoboPenguConversation';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// The shared main element creates a stacking context. Keep the existing modal
// above the sticky navigation without changing its chat/focus/history behavior.
export function HomepageAssistant(props: AIAssistantModalProps) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return mounted ? createPortal(<LazyAIAssistantModal {...props} />, document.body) : null;
}

export function HomepageConversation(props: { isOpen: boolean; onClose: () => void; initialQuery: string }) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return mounted ? createPortal(<RoboPenguConversation {...props} />, document.body) : null;
}
