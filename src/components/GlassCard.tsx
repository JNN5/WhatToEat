import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-lg bg-white/70 border border-white/20 rounded-2xl shadow-xl',
        hover && 'hover:bg-white/80 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  );
}