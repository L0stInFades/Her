'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon?: React.ReactNode;
}

const MODELS: Model[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable model for complex tasks',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast and efficient for most tasks',
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Powerful model with 128K context',
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most capable for complex analysis',
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest for simple tasks',
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open source, powerful model',
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Multimodal capabilities',
  },
];

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODELS.find((m) => m.id === value) || MODELS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-all duration-250',
          'hover:border-jade-500 hover:shadow-soft',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen
            ? 'border-jade-500 ring-2 ring-jade-100 dark:ring-jade-900/20'
            : 'border-warm-200 dark:border-warm-700',
          'bg-white dark:bg-warm-800',
          'text-warm-900 dark:text-warm-50'
        )}
      >
        <Sparkles className="h-4 w-4 text-jade-500" />
        <span className="font-medium">{selectedModel.name}</span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 transition-transform duration-250',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={clsx(
            'absolute top-full left-0 z-50 mt-2 w-80 rounded-2xl border-2 shadow-jade-lg animate-slide-down',
            'border-warm-200 bg-white dark:border-warm-700 dark:bg-warm-900',
            'max-h-[400px] overflow-y-auto'
          )}
        >
          <div className="p-2">
            {MODELS.map((model) => {
              const isSelected = model.id === value;

              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full rounded-xl px-3 py-2.5 text-left transition-all duration-250',
                    'hover:bg-jade-50 dark:hover:bg-jade-900/20',
                    isSelected
                      ? 'bg-jade-100 text-jade-900 dark:bg-jade-900/30 dark:text-jade-100'
                      : 'text-warm-700 dark:text-warm-300'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{model.name}</span>
                        <span
                          className={clsx(
                            'text-xs rounded-full px-1.5 py-0.5',
                            'bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-300'
                          )}
                        >
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-xs text-warm-500 dark:text-warm-400 truncate">
                        {model.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        className={clsx(
                          'h-5 w-5 rounded-full flex items-center justify-center',
                          'bg-jade-500 text-white'
                        )}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
