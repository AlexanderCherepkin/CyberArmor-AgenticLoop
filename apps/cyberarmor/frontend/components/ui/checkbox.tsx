import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label className="flex cursor-pointer items-start gap-3">
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded border border-platinum/30 bg-graphite/50 transition focus-within:border-cyan">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            <Check className="h-3.5 w-3.5 text-cyan opacity-0 transition peer-checked:opacity-100" strokeWidth={3} />
          </span>
          {label && <span className="text-body-sm text-platinum/80">{label}</span>}
        </label>
        {error && <p className="cyber-error">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
