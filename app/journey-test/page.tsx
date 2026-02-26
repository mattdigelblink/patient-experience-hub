'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Calendar,
  Pill,
  ShoppingBag,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  FileText,
  Search,
  X,
  MessageSquare,
  Mail,
  Phone,
  Volume2,
  Monitor,
  Star,
  Activity,
  Server,
  ShieldCheck,
  ThumbsDown,
} from 'lucide-react';
import { TimelineEvent } from '@/components/journey';
import { parseCSV } from '@/lib/csv/parser';
import { assembleJourney } from '@/lib/csv/journeyAssembler';
import type { ParseResult } from '@/types/csvJourney';
import type { EventType, JourneyEvent } from '@/types/journey';
import { isSurveyContent } from '@/types/journey';

const eventTypeFilters: { type: EventType; label: string; icon: React.ReactNode }[] = [
  { type: 'sms', label: 'SMS', icon: <MessageSquare size={14} /> },
  { type: 'email', label: 'Email', icon: <Mail size={14} /> },
  { type: 'call', label: 'Calls', icon: <Phone size={14} /> },
  { type: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
  { type: 'voice_broadcast', label: 'Voice', icon: <Volume2 size={14} /> },
  { type: 'screen_view', label: 'Screens', icon: <Monitor size={14} /> },
  { type: 'mixpanel_event', label: 'Events', icon: <Activity size={14} /> },
  { type: 'survey', label: 'Surveys', icon: <Star size={14} /> },
  { type: 'system_log', label: 'System', icon: <AlertCircle size={14} /> },
];

// Helper to check if an event is negative feedback (low survey rating < 50%)
function isNegativeFeedback(event: JourneyEvent): boolean {
  if (event.type !== 'survey') return false;
  if (!isSurveyContent(event.content)) return false;
  const { rating, maxRating } = event.content;
  return (rating / maxRating) < 0.5;
}

// Helper to extract searchable text from event content
function getSearchableText(event: JourneyEvent): string {
  const content = event.content;
  const texts: string[] = [event.type];

  if ('body' in content) texts.push(content.body as string);
  if ('subject' in content) texts.push(content.subject as string);
  if ('preview' in content) texts.push(content.preview as string);
  if ('transcript' in content) texts.push(content.transcript as string);
  if ('summary' in content && content.summary) texts.push(content.summary as string);
  if ('screenName' in content) texts.push(content.screenName as string);
  if ('eventName' in content) texts.push(content.eventName as string);
  if ('message' in content) texts.push(content.message as string);
  if ('verbatim' in content && content.verbatim) texts.push(content.verbatim as string);
  if ('messages' in content && Array.isArray(content.messages)) {
    content.messages.forEach((msg: { message: string }) => texts.push(msg.message));
  }
  // RxOS Activity content
  if ('activityType' in content) texts.push(content.activityType as string);
  if ('description' in content) texts.push(content.description as string);
  if ('actor' in content && content.actor) texts.push(content.actor as string);
  if ('orderId' in content && content.orderId) texts.push(content.orderId as string);
  if ('prescriptionId' in content && content.prescriptionId) texts.push(content.prescriptionId as string);

  return texts.join(' ').toLowerCase();
}

export default function JourneyTestPage() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [showRxOSActivity, setShowRxOSActivity] = useState(false);
  const [showPriorAuthActivity, setShowPriorAuthActivity] = useState(false);
  const [filterNegativeFeedback, setFilterNegativeFeedback] = useState(false);

  // Load CSV on mount
  useEffect(() => {
    const loadCSV = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/ExamplePatientJourney.csv');
        if (!response.ok) {
          throw new Error('Failed to load CSV file');
        }
        const text = await response.text();
        const rows = await parseCSV(text);
        const result = assembleJourney(rows);
        setParseResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
        console.error('CSV parse error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCSV();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!parseResult) return [];

    return parseResult.journey.events.filter((event) => {
      // Hide RxOS activity events by default unless toggled on
      if (event.type === 'rxos_activity' && !showRxOSActivity) {
        return false;
      }

      // Hide Prior Auth activity events by default unless toggled on
      if (event.type === 'prior_auth_activity' && !showPriorAuthActivity) {
        return false;
      }

      // Filter by event type OR negative feedback filter
      const hasTypeFilter = selectedTypes.length > 0 || filterNegativeFeedback;
      if (hasTypeFilter) {
        const matchesTypeFilter = selectedTypes.length > 0 && selectedTypes.includes(event.type);
        const matchesNegativeFeedback = filterNegativeFeedback && isNegativeFeedback(event);

        // Must match at least one active filter
        if (!matchesTypeFilter && !matchesNegativeFeedback) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const searchableText = getSearchableText(event);
        const query = searchQuery.toLowerCase();
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [parseResult, searchQuery, selectedTypes, showRxOSActivity, showPriorAuthActivity, filterNegativeFeedback]);

  const toggleTypeFilter = (type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const activeFilterCount = selectedTypes.length + (showRxOSActivity ? 1 : 0) + (showPriorAuthActivity ? 1 : 0) + (filterNegativeFeedback ? 1 : 0);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setShowRxOSActivity(false);
    setShowPriorAuthActivity(false);
    setFilterNegativeFeedback(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Parsing CSV file...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/journey"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to journeys
        </Link>

        <div className="bg-white border p-12 mx-6" style={{ borderRadius: '16px' }}>
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Parse Error</h2>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show journey view
  if (!parseResult) return null;

  const { journey, diagnostics } = parseResult;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDOB = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/journey"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to journeys
      </Link>

      {/* Diagnostics Card */}
      {diagnostics.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 mx-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Warnings</h3>
              <ul className="text-xs text-amber-700 space-y-1">
                {diagnostics.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Parse Success Info */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 mx-6 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-900 mb-1">CSV Parsed Successfully</h3>
            <div className="flex flex-wrap gap-4 text-xs text-emerald-700">
              <span>
                <FileText size={12} className="inline mr-1" />
                {diagnostics.totalRows} rows processed
              </span>
              <span>
                <CheckCircle size={12} className="inline mr-1" />
                {diagnostics.mappedEvents} events mapped
              </span>
              {diagnostics.unmappedEvents.length > 0 && (
                <span>
                  <AlertCircle size={12} className="inline mr-1" />
                  {diagnostics.unmappedEvents.length} unmapped events
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white border p-6 mx-6" style={{ borderRadius: '16px' }}>
        {/* Top Row: Name and Demographics */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 mb-1">
              {journey.patientInfo.initials}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>DOB: {formatDOB(journey.patientInfo.dob)}</span>
              <span>
                <span className="text-slate-400">Patient ID:</span> {journey.patientInfo.patientId}
              </span>
              {journey.patientInfo.accountId && (
                <span>
                  <span className="text-slate-400">Account ID:</span> {journey.patientInfo.accountId}
                </span>
              )}
            </div>
          </div>
          {/* RxOS Order Link - Inline */}
          {journey.rxosOrderUrl && (
            <a
              href={journey.rxosOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors shrink-0"
            >
              Patient Profile
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Second Row: Medications and Metadata */}
        <div className="flex items-start gap-4">
          {/* Medications */}
          <div className="flex items-center gap-2 shrink-0">
            <Pill size={12} className="text-slate-400" />
            <div className="flex flex-wrap gap-1.5">
              {journey.patientInfo.medications.length > 0 ? (
                journey.patientInfo.medications.map((med, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                  >
                    {med}
                  </span>
                ))
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                  Unknown Medication
                </span>
              )}
            </div>
          </div>

          {/* Metadata - Horizontal Layout */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs flex-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-slate-500">Initial Rx:</span>
              <span className="font-medium text-slate-900">
                {formatDate(journey.patientInfo.initialRxReceivedDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={12} className="text-slate-400" />
              <span className="text-slate-500">Fills:</span>
              <span className="font-medium text-slate-900">
                {journey.patientInfo.totalFillsPurchased}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard size={12} className="text-slate-400" />
              <span className="text-slate-500">Insurance:</span>
              <span className="font-medium text-slate-900">{journey.metadata.insurance || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" />
              <span className="text-slate-500">State:</span>
              <span className="font-medium text-slate-900">{journey.metadata.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border p-6 mx-6" style={{ borderRadius: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Event Timeline
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({filteredEvents.length}{filteredEvents.length !== journey.events.length ? ` of ${journey.events.length}` : ''} events)
            </span>
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search events, transcripts, messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Event Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {eventTypeFilters.map((filter) => {
            const count = journey.events.filter((e) => e.type === filter.type).length;
            if (count === 0) return null;
            const isSelected = selectedTypes.includes(filter.type);

            return (
              <button
                key={filter.type}
                onClick={() => toggleTypeFilter(filter.type)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {filter.icon}
                {filter.label}
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}

          {/* Negative Feedback Filter - Works like event type filters */}
          {(() => {
            const negativeFeedbackCount = journey.events.filter(e => isNegativeFeedback(e)).length;
            if (negativeFeedbackCount === 0) return null;

            return (
              <button
                onClick={() => setFilterNegativeFeedback(!filterNegativeFeedback)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterNegativeFeedback
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <ThumbsDown size={14} />
                Negative Feedback
                <span className="text-[10px] opacity-70">({negativeFeedbackCount})</span>
              </button>
            );
          })()}

          {/* Separator */}
          {(() => {
            const rxosActivityCount = journey.events.filter(e => e.type === 'rxos_activity').length;
            const priorAuthActivityCount = journey.events.filter(e => e.type === 'prior_auth_activity').length;
            if (rxosActivityCount > 0 || priorAuthActivityCount > 0) {
              return <div className="h-6 w-px bg-slate-300 mx-1" />;
            }
            return null;
          })()}

          {/* RxOS Activity Toggle - Hidden by default */}
          {(() => {
            const rxosActivityCount = journey.events.filter(e => e.type === 'rxos_activity').length;
            if (rxosActivityCount === 0) return null;

            return (
              <button
                onClick={() => setShowRxOSActivity(!showRxOSActivity)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  showRxOSActivity
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-purple-50 text-purple-400 border border-purple-200 hover:bg-purple-100 hover:text-purple-600'
                }`}
                title="RxOS activity events are hidden by default. Click to show."
              >
                <Server size={14} />
                RxOS Activity
                <span className="text-[10px] opacity-70">({rxosActivityCount})</span>
                {!showRxOSActivity && (
                  <span className="text-[10px] bg-purple-200 text-purple-600 px-1.5 py-0.5 rounded ml-1">hidden</span>
                )}
              </button>
            );
          })()}

          {/* Prior Auth Activity Toggle - Hidden by default */}
          {(() => {
            const priorAuthActivityCount = journey.events.filter(e => e.type === 'prior_auth_activity').length;
            if (priorAuthActivityCount === 0) return null;

            return (
              <button
                onClick={() => setShowPriorAuthActivity(!showPriorAuthActivity)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  showPriorAuthActivity
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-blue-50 text-blue-400 border border-blue-200 hover:bg-blue-100 hover:text-blue-600'
                }`}
                title="Prior Authorization activity events are hidden by default. Click to show."
              >
                <ShieldCheck size={14} />
                Prior Auth Activity
                <span className="text-[10px] opacity-70">({priorAuthActivityCount})</span>
                {!showPriorAuthActivity && (
                  <span className="text-[10px] bg-blue-200 text-blue-600 px-1.5 py-0.5 rounded ml-1">hidden</span>
                )}
              </button>
            );
          })()}

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Timeline Events */}
        {filteredEvents.length > 0 ? (
          <div className="space-y-0">
            {filteredEvents.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={index === filteredEvents.length - 1}
                medication={journey.metadata.drug}
                orderId={journey.orderId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No events match your search</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-yellow-600 hover:text-yellow-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
