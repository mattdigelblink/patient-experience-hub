'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({ 
  title = 'Coming Soon', 
  description = 'This feature is currently under development and will be available soon.' 
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="p-6 bg-slate-100 rounded-full">
        <Clock size={48} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="text-slate-600 max-w-md text-center">{description}</p>
    </div>
  );
}
