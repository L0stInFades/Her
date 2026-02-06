import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-6 animate-fade-in">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-jade-400 to-jade-600 text-white shadow-jade">
        <Bot className="h-5 w-5" />
      </div>

      {/* Typing animation */}
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-jade-500 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-jade-500 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-jade-500" />
      </div>
    </div>
  );
}

// Minimal typing indicator for inline use
export function MinimalTypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warm-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warm-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warm-400" />
    </div>
  );
}
