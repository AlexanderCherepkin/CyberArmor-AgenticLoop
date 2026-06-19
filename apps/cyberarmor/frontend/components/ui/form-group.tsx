import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-5 last:mb-0', className)} {...props}>
      {children}
    </div>
  )
);
FormGroup.displayName = 'FormGroup';
