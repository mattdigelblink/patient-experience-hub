'use client';

import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 
  | 'default' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'sev1'
  | 'sev2'
  | 'sev3'
  | 'sev4'
  | 'sev5';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  sev1: 'bg-red-100 text-red-700 ring-1 ring-red-500',
  sev2: 'bg-orange-100 text-orange-700 ring-1 ring-orange-500',
  sev3: 'bg-amber-100 text-amber-700',
  sev4: 'bg-blue-100 text-blue-700',
  sev5: 'bg-slate-100 text-slate-600',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full uppercase tracking-wide',
        variantStyles[variant],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      {children}
    </span>
  );
}

// Convenience components for severity badges
export function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity.toLowerCase().replace('-', '') as BadgeVariant;
  return <Badge variant={variant}>{severity}</Badge>;
}

