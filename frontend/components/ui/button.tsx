import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all',
    outline: 'border-2 border-input bg-background hover:bg-muted hover:border-primary/50 transition-all',
    ghost: 'hover:bg-muted transition-colors',
  };

  const sizes = {
    default: 'px-4 py-2 text-sm font-medium',
    sm: 'px-3 py-1.5 text-xs font-medium',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
