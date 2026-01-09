'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, X, Info, AlertTriangle } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/shared';
import { generateMockJourneys, STATES, PROGRAMS } from '@/config/dummyData';
import type { Journey, JourneyCategory, Program, FirstFillMilestones, RefillMilestones } from '@/types/journey';

const allJourneys = generateMockJourneys(50);

const categoryLabels: Record<JourneyCategory, string> = {
  successful_purchase_delivery: 'Purchase + Delivery',
  successful_purchase_no_delivery: 'Purchase, No Delivery',
  no_purchase: 'No Purchase',
};

// Helper to get current journey step from milestones
function getCurrentJourneyStep(journey: Journey): string {
  const isFirstFill = journey.journeyType === 'first_fill';
  const milestones = journey.milestones;

  if (isFirstFill) {
    const m = milestones as FirstFillMilestones;
    if (m.delivered) return 'Delivered';
    if (m.shipped) return 'Shipped';
    if (m.purchased) return 'Purchased';
    if (m.addedMedToCart) return 'Added Med To Cart';
    if (m.createdAccount) return 'Created Account';
    if (m.patientActed) return 'Patient Acted';
    if (m.initialCommDelivered) return 'Initial Comm Delivered';
    return 'Not Started';
  } else {
    const m = milestones as RefillMilestones;
    if (m.delivered) return 'Delivered';
    if (m.shipped) return 'Shipped';
    if (m.purchased) return 'Purchased';
    if (m.addedMedToCart) return 'Added Med To Cart';
    if (m.refillCommDelivered) return 'Refill Comm Delivered';
    if (m.refillPricePublished) return 'Refill Price Published';
    return 'Not Started';
  }
}

// Helper to calculate age from DOB
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper to count contacts (chat, inbound calls, emails, inbound texts)
function countContacts(journey: Journey): number {
  return journey.events.filter(event => {
    if (event.type === 'chat') return true;
    if (event.type === 'email') return true;
    if (event.type === 'call' && 'direction' in event.content && event.content.direction === 'inbound') return true;
    if (event.type === 'sms' && 'direction' in event.content && event.content.direction === 'inbound') return true;
    return false;
  }).length;
}

// Helper to check for negative feedback (low NPS, negative surveys, frustration indicators)
function hasNegativeFeedback(journey: Journey): boolean {
  return journey.events.some(event => {
    if (event.type === 'survey' && 'score' in event.content) {
      const content = event.content as { surveyType: string; score: number };
      // NPS score of 6 or below is detractor
      if (content.surveyType === 'nps' && content.score <= 6) return true;
      // CSAT score of 2 or below (out of 5) is negative
      if (content.surveyType === 'csat' && content.score <= 2) return true;
      // DNPU score of 2 or below is negative
      if (content.surveyType === 'dnpu' && content.score <= 2) return true;
    }
    // Check for escalated calls or chats
    if ((event.type === 'call' || event.type === 'chat') && 'sentiment' in event.content) {
      const sentiment = (event.content as { sentiment?: string }).sentiment;
      if (sentiment === 'negative' || sentiment === 'frustrated') return true;
    }
    return false;
  });
}

// Column header with info tooltip
function HeaderWithTooltip({ label, tooltip, position = 'center' }: { label: string; tooltip: React.ReactNode; position?: 'center' | 'left' | 'right' }) {
  const positionClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'right-0',
    right: 'left-0',
  };
  
  const arrowClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'right-3',
    right: 'left-3',
  };

  return (
    <div className="flex items-center gap-1">
      <span>{label}</span>
      <div className="relative group">
        <Info size={14} className="text-slate-400 cursor-help" />
        <div className={`absolute z-50 top-full ${positionClasses[position]} mt-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
          {tooltip}
          <div className={`absolute bottom-full ${arrowClasses[position]} border-4 border-transparent border-b-slate-800`} />
        </div>
      </div>
    </div>
  );
}

export default function JourneyListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<JourneyCategory[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const filteredJourneys = useMemo(() => {
    return allJourneys.filter((journey) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          journey.patientId.toLowerCase().includes(searchLower) ||
          journey.orderId?.toLowerCase().includes(searchLower) ||
          journey.metadata.drug.toLowerCase().includes(searchLower) ||
          journey.metadata.pharmacy.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(journey.category)) {
        return false;
      }

      // Program filter (check if any of the journey's programs match selected programs)
      if (selectedPrograms.length > 0 && !journey.programs.some(p => selectedPrograms.includes(p))) {
        return false;
      }

      // State filter
      if (selectedStates.length > 0 && !selectedStates.includes(journey.metadata.state)) {
        return false;
      }

      // Time range filter
      if (timeRange.start || timeRange.end) {
        const journeyTime = new Date(journey.lastActivityTime).getTime();
        if (timeRange.start) {
          const startTime = new Date(timeRange.start).getTime();
          if (journeyTime < startTime) return false;
        }
        if (timeRange.end) {
          const endTime = new Date(timeRange.end).getTime();
          if (journeyTime > endTime) return false;
        }
      }

      return true;
    });
  }, [search, selectedCategories, selectedPrograms, selectedStates, timeRange]);

  const activeFilterCount = selectedCategories.length + selectedPrograms.length + selectedStates.length + (timeRange.start ? 1 : 0) + (timeRange.end ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPrograms([]);
    setSelectedStates([]);
    setTimeRange({ start: '', end: '' });
  };

  const columns = [
    {
      key: 'patientId',
      header: 'Patient',
      render: (journey: Journey) => (
        <div>
          <p className="font-medium text-slate-900">{journey.patientInfo.initials}</p>
          <p className="text-xs text-slate-500">
            <span className="text-slate-400">Patient ID:</span> {journey.patientInfo.patientId}
          </p>
          {journey.patientInfo.accountId && (
            <p className="text-xs text-slate-500">
              <span className="text-slate-400">Account ID:</span> {journey.patientInfo.accountId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'medication',
      header: 'Medications',
      width: '140px',
      render: (journey: Journey) => (
        <div className="flex flex-wrap gap-1">
          {journey.patientInfo.medications.map((med, idx) => (
            <span 
              key={idx}
              className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full truncate max-w-[120px]"
              title={med}
            >
              {med}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Programs',
      width: '130px',
      render: (journey: Journey) => (
        <div className="flex flex-wrap gap-1">
          {journey.programs.map((program, idx) => (
            <span 
              key={idx}
              className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full truncate max-w-[110px]"
              title={program}
            >
              {program}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'journeyStep',
      header: (
        <HeaderWithTooltip 
          label="Journey Step" 
          tooltip={
            <div className="space-y-2">
              <div>
                <p className="font-semibold text-emerald-400 mb-1">First Fill:</p>
                <p className="text-slate-300">Initial Comm Delivered → Patient Acted → Created Account → Added Med To Cart → Purchased → Shipped → Delivered</p>
              </div>
              <div>
                <p className="font-semibold text-blue-400 mb-1">Refill:</p>
                <p className="text-slate-300">Refill Price Published → Refill Comm Delivered → Added Med To Cart → Purchased → Shipped → Delivered</p>
              </div>
            </div>
          }
        />
      ),
      render: (journey: Journey) => {
        const step = getCurrentJourneyStep(journey);
        const stepStyles: Record<string, string> = {
          'Not Started': 'bg-slate-100 text-slate-600',
          'Initial Comm Delivered': 'bg-blue-100 text-blue-700',
          'Refill Price Published': 'bg-blue-100 text-blue-700',
          'Refill Comm Delivered': 'bg-blue-100 text-blue-700',
          'Patient Acted': 'bg-indigo-100 text-indigo-700',
          'Created Account': 'bg-violet-100 text-violet-700',
          'Added Med To Cart': 'bg-amber-100 text-amber-700',
          'Purchased': 'bg-emerald-100 text-emerald-700',
          'Shipped': 'bg-cyan-100 text-cyan-700',
          'Delivered': 'bg-green-100 text-green-700',
        };
        return (
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${stepStyles[step] || 'bg-slate-100 text-slate-600'}`}>
            {step}
          </span>
        );
      },
    },
    {
      key: 'age',
      header: 'Age',
      render: (journey: Journey) => (
        <span className="text-slate-900">{calculateAge(journey.patientInfo.dob)}</span>
      ),
    },
    {
      key: 'state',
      header: 'State',
      render: (journey: Journey) => journey.metadata.state,
    },
    {
      key: 'contacts',
      header: (
        <HeaderWithTooltip 
          label="# Contacts" 
          tooltip="Total patient contacts: chat sessions, inbound calls, emails, and inbound texts" 
        />
      ),
      render: (journey: Journey) => (
        <span className="text-slate-600">{countContacts(journey)}</span>
      ),
    },
    {
      key: 'events',
      header: (
        <HeaderWithTooltip 
          label="Events" 
          tooltip="Total timeline events: communications, screen views, system logs, and activities" 
        />
      ),
      render: (journey: Journey) => (
        <span className="text-slate-600">{journey.events.length}</span>
      ),
    },
    {
      key: 'initialRxReceived',
      header: 'Initial Rx Received',
      render: (journey: Journey) => (
        <span className="text-sm text-slate-500">
          {new Date(journey.patientInfo.initialRxReceivedDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (journey: Journey) => (
        <span className="text-sm text-slate-500">
          {new Date(journey.lastActivityTime).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'negativeFeedback',
      header: (
        <HeaderWithTooltip 
          label="Negative Feedback" 
          position="left"
          tooltip={
            <div className="space-y-1">
              <p className="font-semibold text-red-400 mb-1">Patient expressed negativity:</p>
              <ul className="text-slate-300 space-y-0.5 text-left">
                <li>• Submitted survey with low score (NPS ≤ 6, CSAT/DNPU ≤ 2)</li>
                <li>• Expressed an issue or complaint</li>
                <li>• Showed high frustration during contact</li>
              </ul>
            </div>
          }
        />
      ),
      render: (journey: Journey) => (
        hasNegativeFeedback(journey) ? (
          <div className="flex items-center gap-1 text-red-500">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">Yes</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journey Observer"
        description="Browse and observe patient journeys end-to-end"
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by patient ID, order ID, drug, or pharmacy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Program Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Program</label>
                <div className="space-y-2">
                  {PROGRAMS.map((program) => (
                    <label key={program} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPrograms.includes(program)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPrograms([...selectedPrograms, program]);
                          } else {
                            setSelectedPrograms(selectedPrograms.filter((p) => p !== program));
                          }
                        }}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      {program}
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="space-y-2">
                  {(Object.keys(categoryLabels) as JourneyCategory[]).map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                          }
                        }}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      {categoryLabels[cat]}
                    </label>
                  ))}
                </div>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <select
                  multiple
                  value={selectedStates}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setSelectedStates(values);
                  }}
                  className="w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-24"
                >
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Range</label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">From</label>
                    <input
                      type="date"
                      value={timeRange.start}
                      onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">To</label>
                    <input
                      type="date"
                      value={timeRange.end}
                      onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredJourneys.length} of {allJourneys.length} journeys
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredJourneys}
        keyExtractor={(journey) => journey.id}
        onRowClick={(journey) => router.push(`/journey/${journey.id}`)}
        emptyMessage="No journeys match your filters"
      />
    </div>
  );
}

