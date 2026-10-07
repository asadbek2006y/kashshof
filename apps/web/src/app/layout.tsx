import type { ReactNode } from 'react';
import { ConversationProvider } from '@/features/chat/conversation-store';

// The [locale] layout renders <html>. This root holds the in-memory conversation, so it survives
// client-side navigation (including a language switch) but never touches storage.
export default function RootLayout({ children }: { children: ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}
