import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
};

const styles = {
  info: 'border-cyan/30 bg-cyan/10 text-cyan',
  success: 'border-green-400/30 bg-green-400/10 text-green-400',
  warning: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-400',
  error: 'border-crimson/30 bg-crimson/10 text-crimson',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'rounded border p-4',
          styles[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            {title && <h4 className="font-heading text-sm font-semibold">{title}</h4>}
            {children && <div className="mt-1 text-sm opacity-90">{children}</div>}
          </div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';
