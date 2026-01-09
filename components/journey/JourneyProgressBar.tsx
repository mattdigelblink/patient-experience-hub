'use client';

import React, { useState } from 'react';
import {
  Send,
  MousePointerClick,
  UserPlus,
  ShoppingCart,
  CreditCard,
  Truck,
  Package,
  DollarSign,
  Mail,
  Check,
  Info,
} from 'lucide-react';
import type { Journey, FirstFillMilestones, RefillMilestones } from '@/types/journey';

interface MilestoneStep {
  key: string;
  label: string;
  icon: React.ReactNode;
  timestamp?: string;
  tooltip?: string;
}

interface JourneyProgressBarProps {
  journey: Journey;
}

export function JourneyProgressBar({ journey }: JourneyProgressBarProps) {
  const isFirstFill = journey.journeyType === 'first_fill';
  const milestones = journey.milestones;
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return (
      <div className="text-[10px] text-slate-500 mt-0.5">
        <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        <div>{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
      </div>
    );
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMs = end - start;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const firstFillSteps: MilestoneStep[] = [
    {
      key: 'initialCommDelivered',
      label: 'Initial Comm Delivered',
      icon: <Send size={14} />,
      timestamp: (milestones as FirstFillMilestones).initialCommDelivered,
    },
    {
      key: 'patientActed',
      label: 'Patient Acted',
      icon: <MousePointerClick size={14} />,
      timestamp: (milestones as FirstFillMilestones).patientActed,
      tooltip: 'Patient clicked a link or contacted us',
    },
    {
      key: 'createdAccount',
      label: 'Created Account',
      icon: <UserPlus size={14} />,
      timestamp: (milestones as FirstFillMilestones).createdAccount,
    },
    {
      key: 'addedMedToCart',
      label: 'Added Med To Cart',
      icon: <ShoppingCart size={14} />,
      timestamp: (milestones as FirstFillMilestones).addedMedToCart,
    },
    {
      key: 'purchased',
      label: 'Purchased',
      icon: <CreditCard size={14} />,
      timestamp: (milestones as FirstFillMilestones).purchased,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: <Truck size={14} />,
      timestamp: (milestones as FirstFillMilestones).shipped,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: <Package size={14} />,
      timestamp: (milestones as FirstFillMilestones).delivered,
    },
  ];

  const refillSteps: MilestoneStep[] = [
    {
      key: 'refillPricePublished',
      label: 'Refill Price Published',
      icon: <DollarSign size={14} />,
      timestamp: (milestones as RefillMilestones).refillPricePublished,
    },
    {
      key: 'refillCommDelivered',
      label: 'Refill Comm Delivered',
      icon: <Mail size={14} />,
      timestamp: (milestones as RefillMilestones).refillCommDelivered,
    },
    {
      key: 'addedMedToCart',
      label: 'Added Med To Cart',
      icon: <ShoppingCart size={14} />,
      timestamp: (milestones as RefillMilestones).addedMedToCart,
    },
    {
      key: 'purchased',
      label: 'Purchased',
      icon: <CreditCard size={14} />,
      timestamp: (milestones as RefillMilestones).purchased,
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: <Truck size={14} />,
      timestamp: (milestones as RefillMilestones).shipped,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: <Package size={14} />,
      timestamp: (milestones as RefillMilestones).delivered,
    },
  ];

  const steps = isFirstFill ? firstFillSteps : refillSteps;

  // Find the current step (last completed step)
  const currentStepIndex = steps.reduce((lastCompleted, step, index) => {
    return step.timestamp ? index : lastCompleted;
  }, -1);

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Journey Progress
        </h2>
        {/* Prominent Journey Type Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isFirstFill 
            ? 'bg-emerald-100 border-2 border-emerald-300' 
            : 'bg-blue-100 border-2 border-blue-300'
        }`}>
          <div className={`w-3 h-3 rounded-full ${isFirstFill ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <span className={`text-sm font-bold uppercase tracking-wide ${
            isFirstFill ? 'text-emerald-700' : 'text-blue-700'
          }`}>
            {isFirstFill ? 'First Fill' : 'Refill'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background track - positioned to align with circle centers */}
        <div 
          className="absolute top-9 h-1 bg-slate-200 rounded-full"
          style={{ 
            left: `${100 / steps.length / 2}%`,
            right: `${100 / steps.length / 2}%`
          }}
        />
        
        {/* Active track - positioned to align with circle centers */}
        <div 
          className="absolute top-9 h-1 bg-emerald-500 rounded-full transition-all duration-500"
          style={{ 
            left: `${100 / steps.length / 2}%`,
            width: currentStepIndex >= 0 
              ? `${(currentStepIndex / (steps.length - 1)) * (100 - 100 / steps.length)}%` 
              : '0%' 
          }}
        />

        {/* Duration labels between steps */}
        <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none" style={{ paddingLeft: `${100 / steps.length / 2}%`, paddingRight: `${100 / steps.length / 2}%` }}>
          {steps.slice(0, -1).map((step, index) => {
            const nextStep = steps[index + 1];
            const showDuration = step.timestamp && nextStep.timestamp;
            
            return (
              <div 
                key={`duration-${step.key}`} 
                className="flex-1 flex items-center justify-center"
              >
                {showDuration && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full border border-emerald-200">
                    {formatDuration(step.timestamp!, nextStep.timestamp!)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="relative flex justify-between pt-4">
          {steps.map((step, index) => {
            const isCompleted = step.timestamp !== undefined;
            const isCurrent = index === currentStepIndex;
            const isPending = !isCompleted;

            return (
              <div 
                key={step.key} 
                className="flex flex-col items-center"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Circle */}
                <div
                  className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-slate-200 text-slate-400'
                    }
                    ${isCurrent ? 'ring-4 ring-emerald-100' : ''}
                  `}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.icon}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <div className={`text-xs font-medium leading-tight flex items-center justify-center gap-1 ${
                    isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    <span>{step.label}</span>
                    {step.tooltip && (
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip(step.key)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === step.key ? null : step.key)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Info size={12} />
                        </button>
                        {activeTooltip === step.key && (
                          <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                            {step.tooltip}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {isCompleted && formatTimestamp(step.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

