import { type HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input text-foreground',
        gray: 'bg-gray-100 text-gray-800',
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
