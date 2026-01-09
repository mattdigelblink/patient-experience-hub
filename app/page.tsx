'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Shuffle, ArrowRight, X, Eye, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { generateMockJourneys, mockFeedbackItems, STATES } from '@/config/dummyData';
import type { Journey, JourneyCategory, Platform, JourneyStatus } from '@/types/journey';
import type { FeedbackSource } from '@/types/feedback';
import { Badge, JourneyStatusBadge } from '@/components/shared';

const allJourneys = generateMockJourneys(50);

const categoryLabels: Record<JourneyCategory, string> = {
  successful_purchase_delivery: 'Purchase + Delivery',
  successful_purchase_no_delivery: 'Purchase, No Delivery',
  no_purchase: 'No Purchase',
};

const platformLabels: Record<Platform, string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
};

// Helper function to get status label
const getStatusLabel = (status: JourneyStatus): string => {
  const labels: Partial<Record<JourneyStatus, string>> = {
    completed: 'Completed',
    done: 'Done',
    cancelled: 'Cancelled',
    closed: 'Closed',
    new: 'New',
    discovery: 'Discovery',
    intake: 'Intake',
    onboarding: 'Onboarding',
    escalated: 'Escalated',
    cost_review: 'Cost Review',
    rph_review: 'RPH Review',
    rejected: 'Rejected',
    transfer: 'Transfer',
    dispense: 'Dispense',
    dispense_review: 'Dispense Review',
    package: 'Package',
    processed: 'Processed',
    reprocess: 'Reprocess',
    on_hold: 'On Hold',
  };
  return labels[status] || status.replace(/_/g, ' ');
};

const statusLabels: Partial<Record<JourneyStatus, string>> = {
  completed: 'Completed',
  done: 'Done',
  cancelled: 'Cancelled',
  closed: 'Closed',
  new: 'New',
  discovery: 'Discovery',
  intake: 'Intake',
  onboarding: 'Onboarding',
  escalated: 'Escalated',
  cost_review: 'Cost Review',
  rph_review: 'RPH Review',
  rejected: 'Rejected',
  transfer: 'Transfer',
  dispense: 'Dispense',
  dispense_review: 'Dispense Review',
  package: 'Package',
  processed: 'Processed',
  reprocess: 'Reprocess',
  on_hold: 'On Hold',
};

const feedbackSourceLabels: Record<FeedbackSource, string> = {
  nps: 'NPS Survey',
  csat: 'CSAT Survey',
  app_store: 'App Store Review',
  google_play: 'Google Play Review',
  trustpilot: 'Trustpilot',
  dnpu: 'DNPU Survey',
  agent_flagged_call: 'Agent Flagged Call',
  agent_flagged_chat: 'Agent Flagged Chat',
  agent_flagged_email: 'Agent Flagged Email',
  employee_observation: 'Employee Observation',
};

interface SearchFilters {
  query: string;
  patientId: string;
  orderId: string;
  drug: string;
  pharmacy: string;
  states: string[];
  platforms: Platform[];
  categories: JourneyCategory[];
  statuses: JourneyStatus[];
  feedbackSources: FeedbackSource[];
}

const initialFilters: SearchFilters = {
  query: '',
  patientId: '',
  orderId: '',
  drug: '',
  pharmacy: '',
  states: [],
  platforms: [],
  categories: [],
  statuses: [],
  feedbackSources: [],
};

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(initialFilters);

  // Result view controls
  const [showJourneys, setShowJourneys] = useState(true);
  const [showFeedback, setShowFeedback] = useState(true);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = <T extends string>(key: keyof SearchFilters, value: T) => {
    setFilters(prev => {
      const currentArray = prev[key] as T[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const handleSearch = () => {
    setActiveFilters(filters);
    setHasSearched(true);
    setShowModal(false);
  };

  const clearSearch = () => {
    setFilters(initialFilters);
    setActiveFilters(initialFilters);
    setHasSearched(false);
  };

  const goToRandomJourney = () => {
    const randomIndex = Math.floor(Math.random() * allJourneys.length);
    router.push(`/journey/${allJourneys[randomIndex].id}`);
  };

  // Filter journeys based on active filters
  const filteredJourneys = useMemo(() => {
    return allJourneys.filter((journey) => {
      if (activeFilters.query) {
        const q = activeFilters.query.toLowerCase();
        const matchesQuery =
          journey.patientId.toLowerCase().includes(q) ||
          journey.orderId?.toLowerCase().includes(q) ||
          journey.metadata.drug.toLowerCase().includes(q) ||
          journey.metadata.pharmacy.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (activeFilters.patientId && !journey.patientId.toLowerCase().includes(activeFilters.patientId.toLowerCase())) {
        return false;
      }

      if (activeFilters.orderId && !journey.orderId?.toLowerCase().includes(activeFilters.orderId.toLowerCase())) {
        return false;
      }

      if (activeFilters.drug && !journey.metadata.drug.toLowerCase().includes(activeFilters.drug.toLowerCase())) {
        return false;
      }

      if (activeFilters.pharmacy && !journey.metadata.pharmacy.toLowerCase().includes(activeFilters.pharmacy.toLowerCase())) {
        return false;
      }

      if (activeFilters.states.length > 0 && !activeFilters.states.includes(journey.metadata.state)) {
        return false;
      }

      if (activeFilters.platforms.length > 0 && !activeFilters.platforms.includes(journey.metadata.platform)) {
        return false;
      }

      if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(journey.category)) {
        return false;
      }

      if (activeFilters.statuses.length > 0 && !activeFilters.statuses.includes(journey.status)) {
        return false;
      }

      return true;
    });
  }, [activeFilters]);

  // Filter feedback based on active filters
  const filteredFeedback = useMemo(() => {
    return mockFeedbackItems.filter((item) => {
      if (activeFilters.query) {
        const q = activeFilters.query.toLowerCase();
        const matchesQuery =
          item.verbatim.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          item.metadata.patientId?.toLowerCase().includes(q) ||
          item.metadata.drug?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (activeFilters.patientId && !item.metadata.patientId?.toLowerCase().includes(activeFilters.patientId.toLowerCase())) {
        return false;
      }

      if (activeFilters.drug && !item.metadata.drug?.toLowerCase().includes(activeFilters.drug.toLowerCase())) {
        return false;
      }

      if (activeFilters.feedbackSources.length > 0 && !activeFilters.feedbackSources.includes(item.source)) {
        return false;
      }

      return true;
    });
  }, [activeFilters]);

  const hasActiveFilters = Object.values(activeFilters).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== ''
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Search Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden animate-fade-in">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                placeholder="Type to search..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-base outline-none placeholder:text-slate-400"
                autoFocus
              />
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Search Fields */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {/* Text Fields */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search by Field</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID</label>
                    <input
                      type="text"
                      placeholder="e.g. p-12345"
                      value={filters.patientId}
                      onChange={(e) => updateFilter('patientId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order ID</label>
                    <input
                      type="text"
                      placeholder="e.g. ord-67890"
                      value={filters.orderId}
                      onChange={(e) => updateFilter('orderId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Drug Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lipitor 10mg, Metformin"
                    value={filters.drug}
                    onChange={(e) => updateFilter('drug', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
        />
      </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fulfillment Pharmacy</label>
                  <input
                    type="text"
                    placeholder="e.g. CVS, Walgreens, Costco"
                    value={filters.pharmacy}
                    onChange={(e) => updateFilter('pharmacy', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Dropdown Fields */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter by Category</h3>

{/* State Multi-select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-lg bg-white max-h-24 overflow-y-auto">
                    {STATES.map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => toggleArrayFilter('states', state)}
                        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          filters.states.includes(state)
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
          </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Platform Multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(platformLabels) as Platform[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleArrayFilter('platforms', p)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            filters.platforms.includes(p)
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {platformLabels[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Journey Status</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(statusLabels) as JourneyStatus[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleArrayFilter('statuses', s)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            filters.statuses.includes(s)
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {statusLabels[s] || getStatusLabel(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Multi-select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(categoryLabels) as JourneyCategory[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayFilter('categories', c)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          filters.categories.includes(c)
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {categoryLabels[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Source Multi-select */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Source</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(feedbackSourceLabels) as FeedbackSource[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleArrayFilter('feedbackSources', s)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          filters.feedbackSources.includes(s)
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {feedbackSourceLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setFilters(initialFilters)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Clear all
              </button>
              <button
                onClick={handleSearch}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Search Section */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${hasSearched ? 'pt-8' : 'justify-center'}`}>
        {/* Logo & Title */}
        <div className={`text-center transition-all duration-500 ${hasSearched ? 'mb-6' : 'mb-10'}`}>
          <div className={`inline-flex flex-col items-center justify-center mb-4 transition-all duration-500 ${hasSearched ? 'scale-75' : ''}`}>
            <Image
              src="/blinkrx-logo.png"
              alt="BlinkRx"
              width={200}
              height={50}
              priority
              className="mb-3"
            />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-700">
              Patient Experience HUB
            </h1>
          </div>
          {!hasSearched && (
            <p className="text-slate-400 text-base animate-fade-in">
              Search journeys, feedback, and patient experiences
            </p>
          )}
        </div>

        {/* Search Trigger */}
        <div className="w-full max-w-xl mx-auto px-4">
          {/* Search Bar Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center gap-4 px-6 py-4 bg-white rounded-full border border-slate-200 hover:shadow-lg transition-all text-left group"
          >
            <Search size={20} className="text-slate-400" />
            <span className="flex-1 text-slate-400">Search journeys & feedback...</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow"
            >
              <Search size={18} />
              Search
            </button>
            <button
              onClick={goToRandomJourney}
              className="px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-lg font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
            >
              <Shuffle size={18} />
              Random Journey
            </button>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="w-full max-w-4xl mx-auto px-4 mt-8 pb-8 animate-fade-in">
            {/* Result Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Found {filteredJourneys.length} journeys and {filteredFeedback.length} feedback items
              </p>
              <button
                onClick={clearSearch}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear search
              </button>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.query && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Search: &ldquo;{activeFilters.query}&rdquo;
                  </span>
                )}
                {activeFilters.patientId && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Patient: {activeFilters.patientId}
                  </span>
                )}
                {activeFilters.orderId && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Order: {activeFilters.orderId}
                  </span>
                )}
                {activeFilters.drug && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Drug: {activeFilters.drug}
                  </span>
                )}
                {activeFilters.pharmacy && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Fulfillment Pharmacy: {activeFilters.pharmacy}
                  </span>
                )}
                {activeFilters.states.length > 0 && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    States: {activeFilters.states.join(', ')}
                  </span>
                )}
                {activeFilters.platforms.length > 0 && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Platforms: {activeFilters.platforms.map(p => platformLabels[p]).join(', ')}
                  </span>
                )}
                {activeFilters.statuses.length > 0 && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Status: {activeFilters.statuses.map(s => statusLabels[s] || getStatusLabel(s)).join(', ')}
                  </span>
                )}
                {activeFilters.categories.length > 0 && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Categories: {activeFilters.categories.map(c => categoryLabels[c]).join(', ')}
                  </span>
                )}
                {activeFilters.feedbackSources.length > 0 && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                    Sources: {activeFilters.feedbackSources.map(s => feedbackSourceLabels[s]).join(', ')}
                  </span>
                )}
              </div>
            )}

{/* Journeys Section */}
            <div className="mb-6">
              <button
                onClick={() => setShowJourneys(!showJourneys)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-sm">
                    <Eye size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-slate-900 text-lg">Patient Journeys</h2>
                    <p className="text-sm text-red-600 font-medium">{filteredJourneys.length} results</p>
                  </div>
                </div>
                {showJourneys ? <ChevronUp size={20} className="text-red-400" /> : <ChevronDown size={20} className="text-red-400" />}
              </button>
              
              {showJourneys && filteredJourneys.length > 0 && (
                <div className="mt-3 space-y-2 pl-2 border-l-4 border-red-200">
                  {filteredJourneys.slice(0, 5).map((journey) => (
                <Link
                      key={journey.id}
                      href={`/journey/${journey.id}`}
                      className="block p-4 bg-white rounded-lg border border-red-100 hover:border-red-300 hover:bg-red-50/50 hover:shadow-sm transition-all ml-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{journey.metadata.drug}</p>
                            <JourneyStatusBadge status={journey.status} />
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {journey.patientId} • {journey.metadata.pharmacy} • {journey.metadata.state}
                          </p>
                    </div>
                        <div className="text-right">
                          <Badge variant="default">{platformLabels[journey.metadata.platform]}</Badge>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(journey.lastActivityTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
                  {filteredJourneys.length > 5 && (
                    <Link
                      href="/journey"
                      className="block p-3 text-center text-red-600 hover:text-red-700 font-semibold text-sm bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-all ml-2"
                    >
                      View all {filteredJourneys.length} journeys <ArrowRight size={14} className="inline ml-1" />
                    </Link>
                  )}
            </div>
              )}
              
              {showJourneys && filteredJourneys.length === 0 && (
                <div className="mt-3 p-6 bg-red-50/50 rounded-lg border border-red-100 text-center ml-2 border-l-4 border-l-red-200">
                  <p className="text-slate-500">No journeys match your search</p>
            </div>
          )}
            </div>

            {/* Feedback Section */}
            <div>
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                    <MessageSquare size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-slate-900 text-lg">Patient Feedback</h2>
                    <p className="text-sm text-amber-600 font-medium">{filteredFeedback.length} results</p>
        </div>
      </div>
                {showFeedback ? <ChevronUp size={20} className="text-amber-400" /> : <ChevronDown size={20} className="text-amber-400" />}
              </button>
              
              {showFeedback && filteredFeedback.length > 0 && (
                <div className="mt-3 space-y-2 pl-2 border-l-4 border-amber-200">
                  {filteredFeedback.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-lg border border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-sm transition-all ml-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              {item.source.replace(/_/g, ' ')}
                            </span>
                            {item.rating && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                item.rating <= 2 ? 'bg-red-100 text-red-700' : 
                                item.rating <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {item.rating}/{item.maxRating}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-2 mt-2">{item.verbatim}</p>
                        </div>
                        <p className="text-xs text-slate-400 flex-shrink-0">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredFeedback.length > 5 && (
        <Link
          href="/feedback"
                      className="block p-3 text-center text-amber-700 hover:text-amber-800 font-semibold text-sm bg-amber-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-all ml-2"
        >
                      View all {filteredFeedback.length} feedback items <ArrowRight size={14} className="inline ml-1" />
        </Link>
                  )}
                </div>
              )}
              
              {showFeedback && filteredFeedback.length === 0 && (
                <div className="mt-3 p-6 bg-amber-50/50 rounded-lg border border-amber-100 text-center ml-2 border-l-4 border-l-amber-200">
                  <p className="text-slate-500">No feedback matches your search</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

