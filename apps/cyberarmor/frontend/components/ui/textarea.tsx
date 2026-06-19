import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'cyber-input min-h-[120px] resize-y',
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
Textarea.displayName = 'Textarea';
