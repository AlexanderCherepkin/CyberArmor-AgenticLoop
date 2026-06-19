import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          {
            'bg-cyan text-obsidian shadow-[0_0_20px_-8px_rgba(102,252,241,0.5)] hover:shadow-[0_0_30px_-6px_rgba(102,252,241,0.7)] hover:bg-cyan/90 hover:-translate-y-0.5':
              variant === 'primary',
            'bg-graphite text-platinum hover:bg-graphite/80 hover:-translate-y-0.5':
              variant === 'secondary',
            'border border-cyan/40 text-cyan hover:bg-cyan/10 hover:border-cyan hover:-translate-y-0.5':
              variant === 'outline',
            'text-platinum hover:text-cyan hover:-translate-y-0.5': variant === 'ghost',
          },
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-sm': size === 'md',
            'px-8 py-4 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
