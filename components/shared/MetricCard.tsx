'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp size={14} />;
    if (change < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-emerald-600';
    if (change < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  const variantStyles = {
    default: 'bg-white',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
  };

  return (
    <div
      className={clsx(
        'rounded-xl border p-5 transition-shadow hover:shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change !== undefined && (
            <div className={clsx('mt-2 flex items-center gap-1 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span className="text-slate-400 ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

