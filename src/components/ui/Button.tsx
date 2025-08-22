import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation shadow-md hover:shadow-lg transform hover:-translate-y-0.5';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 focus:ring-blue-500 shadow-blue-200/50 hover:shadow-blue-300/60',
    secondary: 'bg-gradient-to-r from-slate-100 via-gray-100 to-slate-200 text-slate-800 hover:from-slate-200 hover:via-gray-200 hover:to-slate-300 focus:ring-slate-500 border border-slate-200/80',
    ghost: 'text-slate-700 hover:bg-white/80 focus:ring-slate-500 backdrop-blur-sm border border-transparent hover:border-slate-200/60 hover:text-slate-900',
    outline: 'border-2 border-slate-300/80 text-slate-700 hover:bg-white/80 focus:ring-slate-500 backdrop-blur-sm hover:border-slate-400/80 hover:text-slate-900',
    destructive: 'bg-gradient-to-r from-red-600 via-red-700 to-pink-700 text-white hover:from-red-700 hover:via-red-800 hover:to-pink-800 focus:ring-red-500 shadow-red-200/50 hover:shadow-red-300/60',
  };

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm font-semibold min-h-[44px] tracking-wide',
    md: 'px-5 py-3 text-sm font-semibold min-h-[48px] tracking-wide',
    lg: 'px-6 py-3.5 text-base font-semibold min-h-[52px] tracking-wide',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
}