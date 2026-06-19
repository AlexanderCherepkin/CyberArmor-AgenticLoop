import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('cyber-label', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-crimson">*</span>}
    </label>
  )
);
Label.displayName = 'Label';
