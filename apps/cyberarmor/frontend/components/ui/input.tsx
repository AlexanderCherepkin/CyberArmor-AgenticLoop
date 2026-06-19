import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'cyber-input',
            error && 'border-crimson focus:border-crimson focus:ring-crimson/30',
            className
          )}
          {...props}
        />
        {error && <p className="cyber-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
