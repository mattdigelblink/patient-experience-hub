'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
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
import { TimelineEvent, CommentsSidebar, Comment, PatientInfoBar } from '@/components/journey';
import { generateMockJourneys } from '@/config/dummyData';
import type { EventType, JourneyEvent } from '@/types/journey';
import { isSurveyContent } from '@/types/journey';
import { useConfig } from '@/lib/ConfigContext';

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
  const { journeyNotesEnabled } = useConfig();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [showRxOSActivity, setShowRxOSActivity] = useState(false);
  const [showPriorAuthActivity, setShowPriorAuthActivity] = useState(false);
  const [filterNegativeFeedback, setFilterNegativeFeedback] = useState(false); // When true, filter to show only negative feedback
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<JourneyEvent | null>(null);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);

  // Handle scrolling to a specific event from URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('eventId');
      if (eventId) {
        // Small delay to ensure DOM is rendered
        setTimeout(() => {
          const eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
          if (eventElement) {
            eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            eventElement.classList.add('highlight-event');
            setTimeout(() => {
              eventElement.classList.remove('highlight-event');
            }, 5000);
          }
        }, 300);
      }
    }
  }, []);

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

  const handleAddComment = (eventId: string, content: string, mentions: string[]) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      eventId,
      author: 'You', // In real app, get from auth context
      authorEmail: 'you@blinkhealth.com',
      content,
      mentions,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleAddReply = (eventId: string, parentCommentId: string, content: string, mentions: string[]) => {
    const newReply: Comment = {
      id: `reply-${Date.now()}-${Math.random()}`,
      eventId,
      author: 'You',
      authorEmail: 'you@blinkhealth.com',
      content,
      mentions,
      createdAt: new Date().toISOString(),
    };
    
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
        return comment;
      })
    );
  };

  const handleOpenComments = (eventId: string) => {
    const event = journey?.events.find(e => e.id === eventId);
    setSelectedEventId(eventId);
    setSelectedEvent(event || null);
    setIsCommentsSidebarOpen(true);
  };

  const handleOpenJourneyComments = () => {
    // Use a special eventId for journey-level comments
    setSelectedEventId(`journey-${journeyId}`);
    setSelectedEvent(null);
    setIsCommentsSidebarOpen(true);
  };

  const handleEscalate = (journeyIdToEscalate: string) => {
    // In a real implementation, this would send the journey to the Escalation tab
    // For now, we'll show a confirmation and could navigate to escalations page
    if (confirm(`Escalate journey ${journeyIdToEscalate} to the Patient Experience team for review?`)) {
      // In real app: API call to escalate journey
      console.log(`Escalating journey: ${journeyIdToEscalate}`);
      alert('Journey escalated successfully! The Patient Experience team will review it.');
      // Could navigate to escalations page: router.push('/escalations');
    }
  };

  const handleCreateJiraTicket = (journeyIdForTicket: string, eventId?: string) => {
    // In a real implementation, this would create a Jira ticket
    // For now, we'll show a confirmation
    const context = eventId ? `event ${eventId} in ` : '';
    if (confirm(`Create Jira ticket for ${context}journey ${journeyIdForTicket}?`)) {
      // In real app: API call to create Jira ticket with journey/event details
      console.log(`Creating Jira ticket for journey: ${journeyIdForTicket}`, eventId ? `event: ${eventId}` : '');
      alert('Jira ticket created successfully!');
    }
  };

  // Count journey-level comments (including nested replies)
  const journeyComments = comments.filter(c => c.eventId === `journey-${journeyId}`);
  const countReplies = (comment: Comment): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.length + comment.replies.reduce((sum, reply) => sum + countReplies(reply), 0);
  };
  const journeyCommentCount = journeyComments.length + journeyComments.reduce((sum, c) => sum + countReplies(c), 0);

  return (
    <div>
      {/* Patient Info Bar */}
      <PatientInfoBar journey={journey} />

      {/* Main Content */}
      <div className="space-y-6 py-6">
        {/* Back button */}
        <div className="max-w-6xl mx-auto px-8">
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to journeys
          </Link>
        </div>

        {/* Main Layout */}
        <div className={`transition-all ${journeyNotesEnabled && isCommentsSidebarOpen ? 'lg:pr-96' : ''}`}>
          <div className={`space-y-6 ${!journeyNotesEnabled ? 'max-w-5xl mx-auto px-6' : 'max-w-6xl ml-8'}`}>
          {/* Timeline */}
          <div className="bg-white border p-6" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Event Timeline
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({filteredEvents.length}{filteredEvents.length !== journey.events.length ? ` of ${journey.events.length}` : ''} events)
                </span>
              </h2>
              {journeyNotesEnabled && (
                <button
                  onClick={handleOpenJourneyComments}
                  className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    journeyCommentCount > 0
                      ? 'bg-teal-50 border-teal-200 text-teal-600'
                      : 'border-slate-200 text-slate-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-500'
                  }`}
                  title="Add journey notes"
                >
                  <MessageSquare size={14} />
                  <span className="text-sm font-medium">Journey Notes</span>
                  {journeyCommentCount > 0 && (
                    <span className="w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {journeyCommentCount > 9 ? '9+' : journeyCommentCount}
                    </span>
                  )}
                </button>
              )}
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
                        ? 'bg-slate-200 text-slate-900 border border-slate-300'
                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
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
                      ? 'bg-slate-200 text-slate-900 border border-slate-300'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
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
                      ? 'bg-slate-200 text-slate-900 border border-slate-300'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                  }`}
                  title="RxOS activity events are hidden by default. Click to show."
                >
                  <Server size={14} />
                  RxOS Activity
                  <span className="text-[10px] opacity-70">({rxosActivityCount})</span>
                  {!showRxOSActivity && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-1">hidden</span>
                  )}
                </button>
              )}

              {/* Prior Auth Activity Toggle - Hidden by default */}
              {priorAuthActivityCount > 0 && (
                <button
                  onClick={() => setShowPriorAuthActivity(!showPriorAuthActivity)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    showPriorAuthActivity
                      ? 'bg-slate-200 text-slate-900 border border-slate-300'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Prior Authorization activity events are hidden by default. Click to show."
                >
                  <ShieldCheck size={14} />
                  Prior Auth Activity
                  <span className="text-[10px] opacity-70">({priorAuthActivityCount})</span>
                  {!showPriorAuthActivity && (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-1">hidden</span>
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
                {filteredEvents.map((event, index) => {
                  const eventComments = comments.filter(c => c.eventId === event.id);
                  // Count all comments including nested replies
                  const countReplies = (comment: Comment): number => {
                    if (!comment.replies || comment.replies.length === 0) return 0;
                    return comment.replies.length + comment.replies.reduce((sum, reply) => sum + countReplies(reply), 0);
                  };
                  const commentCount = eventComments.length + eventComments.reduce((sum, c) => sum + countReplies(c), 0);
                  return (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isLast={index === filteredEvents.length - 1}
                      medication={journey.metadata.drug}
                      orderId={journey.orderId}
                      commentCount={commentCount}
                      onOpenComments={journeyNotesEnabled ? () => handleOpenComments(event.id) : undefined}
                    />
                  );
                })}
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

      </div>

      </div>

      {/* Comments Sidebar */}
      {journeyNotesEnabled && (
        <CommentsSidebar
          isOpen={isCommentsSidebarOpen}
          onClose={() => {
            setIsCommentsSidebarOpen(false);
            setSelectedEventId(null);
            setSelectedEvent(null);
          }}
          eventId={selectedEventId}
          event={selectedEvent}
          comments={comments}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          medication={journey.metadata.drug}
          orderId={journey.orderId}
          journeyId={journeyId}
          onEscalate={handleEscalate}
          onCreateJiraTicket={handleCreateJiraTicket}
        />
      )}
    </div>
  );
}
