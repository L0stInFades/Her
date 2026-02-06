import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const metaMatch = shortcut.metaKey ? e.metaKey : !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Common shortcuts for chat interface
export function useChatShortcuts(config: {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
  onCopyLastMessage?: () => void;
  onRegenerate?: () => void;
}) {
  const shortcuts: ShortcutConfig[] = [];

  if (config.onNewChat) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      handler: config.onNewChat,
      description: 'New chat',
    });
  }

  if (config.onToggleSidebar) {
    shortcuts.push({
      key: 'b',
      ctrlKey: true,
      handler: config.onToggleSidebar,
      description: 'Toggle sidebar',
    });
  }

  if (config.onFocusInput) {
    shortcuts.push({
      key: 'i',
      ctrlKey: true,
      handler: config.onFocusInput,
      description: 'Focus input',
    });
  }

  if (config.onCopyLastMessage) {
    shortcuts.push({
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      handler: config.onCopyLastMessage,
      description: 'Copy last message',
    });
  }

  if (config.onRegenerate) {
    shortcuts.push({
      key: 'r',
      ctrlKey: true,
      handler: config.onRegenerate,
      description: 'Regenerate response',
    });
  }

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
