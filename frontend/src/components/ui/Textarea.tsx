import { TextareaHTMLAttributes, forwardRef, useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, id, autoResize = false, value, onChange, ...props },
    ref
  ) => {
    const [textareaValue, setTextareaValue] = useState(value);

    useEffect(() => {
      setTextareaValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaValue(e.target.value);
      onChange?.(e);

      if (autoResize) {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-warm-700 dark:text-warm-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          value={textareaValue}
          onChange={handleChange}
          className={clsx(
            'min-h-[80px] w-full rounded-2xl border-2 border-warm-200 bg-white px-4 py-3 text-warm-900 transition-all duration-200 placeholder:text-warm-400 focus:border-jade-500 focus:outline-none focus:ring-4 focus:ring-jade-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-warm-700 dark:bg-warm-800 dark:text-warm-50 dark:placeholder:text-warm-500 dark:focus:border-jade-400 dark:focus:ring-jade-900/20',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-500',
            autoResize && 'resize-none overflow-hidden',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
