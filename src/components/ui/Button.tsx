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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation shadow-modern hover:shadow-modern-hover';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 backdrop-blur-sm',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 backdrop-blur-sm',
    ghost: 'text-gray-700 hover:bg-white/60 focus:ring-gray-500 backdrop-blur-sm border border-transparent hover:border-white/40',
    outline: 'border border-gray-300/60 text-gray-700 hover:bg-white/60 focus:ring-gray-500 backdrop-blur-sm hover:border-gray-400/60',
    destructive: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 focus:ring-red-500 backdrop-blur-sm',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 mobile-text-sm-enhanced min-h-[44px]',
    md: 'px-5 py-2.5 mobile-text-enhanced min-h-[48px]',
    lg: 'px-6 py-3 text-fluid-base min-h-[52px]',
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