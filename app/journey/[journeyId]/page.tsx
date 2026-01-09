'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  AlertTriangle,
  Calendar,
  Pill,
  ShoppingBag,
  ExternalLink,
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
  FlaskConical,
  ShieldCheck,
  ThumbsDown,
} from 'lucide-react';
import { TimelineEvent, JourneyProgressBar } from '@/components/journey';
import { generateMockJourneys } from '@/config/dummyData';
import type { EventType, JourneyEvent } from '@/types/journey';
import { isSurveyContent } from '@/types/journey';

// Use the same generated journeys as the list page
const allJourneys = generateMockJourneys(50);

const eventTypeFilters: { type: EventType; label: string; icon: React.ReactNode }[] = [
  { type: 'sms', label: 'SMS', icon: <MessageSquare size={14} /> },
  { type: 'email', label: 'Email', icon: <Mail size={14} /> },
  { type: 'call', label: 'Calls', icon: <Phone size={14} /> },
  { type: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
  { type: 'voice_broadcast', label: 'Voice', icon: <Volume2 size={14} /> },
  { type: 'screen_view', label: 'Screens', icon: <Monitor size={14} /> },
  { type: 'mixpanel_event', label: 'Events', icon: <Activity size={14} /> },
  { type: 'survey', label: 'Surveys', icon: <Star size={14} /> },
  { type: 'system_log', label: 'System', icon: <AlertTriangle size={14} /> },
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

export default function JourneyTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const journeyId = params.journeyId as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [showRxOSActivity, setShowRxOSActivity] = useState(false);
  const [showPriorAuthActivity, setShowPriorAuthActivity] = useState(false);
  const [filterNegativeFeedback, setFilterNegativeFeedback] = useState(false); // When true, filter to show only negative feedback

  const journey = useMemo(() => {
    return allJourneys.find((j) => j.id === journeyId);
  }, [journeyId]);
  
  const filteredEvents = useMemo(() => {
    if (!journey) return [];
    
    return journey.events.filter((event) => {
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
  }, [journey, searchQuery, selectedTypes, showRxOSActivity, showPriorAuthActivity, filterNegativeFeedback]);
  
  // Count of RxOS activity events for the toggle button
  const rxosActivityCount = journey?.events.filter(e => e.type === 'rxos_activity').length || 0;
  
  // Count of Prior Auth activity events for the toggle button
  const priorAuthActivityCount = journey?.events.filter(e => e.type === 'prior_auth_activity').length || 0;
  
  // Count of negative feedback events for the toggle button
  const negativeFeedbackCount = journey?.events.filter(e => isNegativeFeedback(e)).length || 0;

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

  // Check if this journey has real mock data (first 4 journeys)
  const hasRealMockData = ['j-001', 'j-002', 'j-003', 'j-004'].includes(journeyId);

  if (!journey) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500 mb-4">Journey not found</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Go back
        </button>
      </div>
    );
  }

  // Show prototype notice for journeys without real mock data
  if (!hasRealMockData) {
    return (
      <div className="space-y-6">
        <Link
          href="/journey"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to journeys
        </Link>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <FlaskConical className="text-amber-600" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Prototype Experience</h2>
          <p className="text-slate-500 text-center max-w-md mb-6">
            Please view one of the first four journeys to see the full experience.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/journey/j-001"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Journey 1
            </Link>
            <Link
              href="/journey/j-002"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Journey 2
            </Link>
            <Link
              href="/journey/j-003"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Journey 3
            </Link>
            <Link
              href="/journey/j-004"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Journey 4
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDOB = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar */}
          <JourneyProgressBar journey={journey} />

          {/* Timeline */}
          <div className="bg-white rounded-xl border p-6">
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
              {negativeFeedbackCount > 0 && (
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
              )}
              
              {/* Separator */}
              {(rxosActivityCount > 0 || priorAuthActivityCount > 0) && (
                <div className="h-6 w-px bg-slate-300 mx-1" />
              )}
              
              {/* RxOS Activity Toggle - Hidden by default */}
              {rxosActivityCount > 0 && (
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
              )}
              
              {/* Prior Auth Activity Toggle - Hidden by default */}
              {priorAuthActivityCount > 0 && (
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
              )}
              
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

        {/* Right Column - Patient Info (Sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Patient Info Card */}
          <div className="bg-white rounded-xl border p-6">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-slate-900 mb-1">
                {journey.patientInfo.initials}
              </h1>
              <p className="text-sm text-slate-500">
                DOB: {formatDOB(journey.patientInfo.dob)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-slate-400">Patient ID:</span> {journey.patientInfo.patientId}
              </p>
              {journey.patientInfo.accountId && (
                <p className="text-xs text-slate-500">
                  <span className="text-slate-400">Account ID:</span> {journey.patientInfo.accountId}
                </p>
              )}
            </div>

            {/* Patient Medications */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Pill size={14} className="text-slate-400" />
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {journey.patientInfo.medications.length === 1 ? 'Medication' : 'Medications'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {journey.patientInfo.medications.map((med, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>

            {/* RxOS Order Link */}
            {journey.rxosOrderUrl && (
              <a
                href={journey.rxosOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors mb-4 w-full justify-center"
              >
                View in RxOS
                <ExternalLink size={14} />
              </a>
            )}

            {/* Metadata */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-500">Initial Rx Received:</span>
                <span className="font-medium text-slate-900">{formatDate(journey.patientInfo.initialRxReceivedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag size={14} className="text-slate-400" />
                <span className="text-slate-500">Total Fills Purchased:</span>
                <span className="font-medium text-slate-900">{journey.patientInfo.totalFillsPurchased}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-slate-400" />
                <span className="text-slate-500">Insurance:</span>
                <span className="font-medium text-slate-900">{journey.metadata.insurance || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-slate-500">State:</span>
                <span className="font-medium text-slate-900">{journey.metadata.state}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
