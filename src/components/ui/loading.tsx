import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'neon';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text,
}) => {
  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary')} />
        {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className={cn(sizeClasses[size], 'bg-primary rounded-full animate-pulse')} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (variant === 'neon') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className={cn(sizeClasses[size], 'relative')}>
          <div className="absolute inset-0 bg-gradient-neon rounded-full animate-spin-slow" style={{ filter: 'blur(8px)' }} />
          <div className="absolute inset-2 bg-background rounded-full" />
        </div>
        {text && <p className="text-sm text-muted-foreground animate-glow">{text}</p>}
      </div>
    );
  }

  return null;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded-md', className)}
       style={{ backgroundSize: '1000px 100%' }} />
);

export const LoadingScreen: React.FC<{ text?: string }> = ({ text }) => (
  <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-primary/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black uppercase mb-2">{text || 'Lädt...'}</h3>
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  </div>
);
