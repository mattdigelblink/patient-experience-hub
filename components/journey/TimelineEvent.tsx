'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Mail,
  Phone,
  Volume2,
  Monitor,
  Star,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Play,
  ExternalLink,
  User,
  Server,
  Flag,
  X,
  Search,
  Plus,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/shared';
import type {
  JourneyEvent,
  EventType,
} from '@/types/journey';
import type { Issue } from '@/types/feedback';
import { mockIssues } from '@/config/dummyData';
import { SEVERITY_CONFIG } from '@/types/feedback';
import {
  isSMSContent,
  isEmailContent,
  isCallContent,
  isChatContent,
  isScreenViewContent,
  isSurveyContent,
  isSystemLogContent,
  isMixpanelEventContent,
  isVoiceBroadcastContent,
  isRxOSActivityContent,
  isPriorAuthActivityContent,
} from '@/types/journey';

// Flag Issue Popover Component
interface FlagIssuePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventType: string;
}

function FlagIssuePopover({ isOpen, onClose }: FlagIssuePopoverProps) {
  const [mode, setMode] = useState<'select' | 'link' | 'create'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Create issue form state
  const [issueTitle, setIssueTitle] = useState('');
  const [whatShouldveHappened, setWhatShouldveHappened] = useState('');
  const [issueConsequences, setIssueConsequences] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'major'>('minor');

  const filteredIssues = mockIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkToIssue = async () => {
    if (!selectedIssue) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setMode('select');
      setSelectedIssue(null);
    }, 1500);
  };

  const handleCreateIssue = async () => {
    if (!issueTitle.trim() || !whatShouldveHappened.trim()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setMode('select');
      setIssueTitle('');
      setWhatShouldveHappened('');
      setIssueConsequences('');
      setSeverity('minor');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-1 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b">
          <div className="flex items-center gap-2">
            <Flag size={14} className="text-orange-500" />
            <span className="text-sm font-medium text-slate-700">
              {mode === 'select' ? 'Flag Issue' : mode === 'link' ? 'Link to Issue' : 'Create Issue'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {submitted ? (
            <div className="py-6 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Flag size={18} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Issue flagged!</p>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'link' ? 'Linked to existing issue' : 'New issue created'}
              </p>
            </div>
          ) : mode === 'select' ? (
            <div className="space-y-2">
              <button
                onClick={() => setMode('link')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Link2 size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Link to existing issue</p>
                  <p className="text-xs text-slate-500">Connect to a known problem</p>
                </div>
              </button>
              <button
                onClick={() => setMode('create')}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Plus size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Create new issue</p>
                  <p className="text-xs text-slate-500">Report a new problem</p>
                </div>
              </button>
            </div>
          ) : mode === 'link' ? (
            <div className="space-y-3">
              <button
                onClick={() => { setMode('select'); setSelectedIssue(null); setSearchQuery(''); }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                ← Back
              </button>
              
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map(issue => (
                    <button
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`w-full text-left p-2 rounded-lg border transition-colors ${
                        selectedIssue?.id === issue.id
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span 
                          className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5"
                          style={{ 
                            backgroundColor: SEVERITY_CONFIG[issue.severity].bgColor,
                            color: SEVERITY_CONFIG[issue.severity].color
                          }}
                        >
                          {SEVERITY_CONFIG[issue.severity].label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{issue.title}</p>
                          <p className="text-xs text-slate-500 truncate">{issue.summary}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No issues found</p>
                )}
              </div>

              <button
                onClick={handleLinkToIssue}
                disabled={!selectedIssue || isSubmitting}
                className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Linking...' : 'Link to Issue'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => { setMode('select'); setIssueTitle(''); setWhatShouldveHappened(''); setIssueConsequences(''); }}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                ← Back
              </button>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Issue title
                </label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  What should&apos;ve happened?
                </label>
                <textarea
                  value={whatShouldveHappened}
                  onChange={(e) => setWhatShouldveHappened(e.target.value)}
                  placeholder="Describe what the agent should have done"
                  className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Issue consequences
                </label>
                <textarea
                  value={issueConsequences}
                  onChange={(e) => setIssueConsequences(e.target.value)}
                  placeholder="Describe the impact of the error made by the agent"
                  className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Severity
                </label>
                <div className="relative">
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as 'minor' | 'moderate' | 'major')}
                    className="w-full appearance-none px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="major">Major</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleCreateIssue}
                disabled={!issueTitle.trim() || !whatShouldveHappened.trim() || isSubmitting}
                className="w-full py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const eventTypeConfig: Record<EventType, { icon: React.ReactNode; label: string; color: string }> = {
  sms: { icon: <MessageSquare size={16} />, label: 'SMS', color: 'bg-yellow-50 text-yellow-600 border-2 border-yellow-300' },
  email: { icon: <Mail size={16} />, label: 'Email', color: 'bg-yellow-50 text-yellow-600 border-2 border-yellow-300' },
  voice_broadcast: { icon: <Volume2 size={16} />, label: 'Voice Broadcast', color: 'bg-yellow-50 text-yellow-600 border-2 border-yellow-300' },
  call: { icon: <Phone size={16} />, label: 'Phone Call', color: 'bg-yellow-50 text-yellow-600 border-2 border-yellow-300' },
  chat: { icon: <MessageSquare size={16} />, label: 'Chat', color: 'bg-yellow-50 text-yellow-600 border-2 border-yellow-300' },
  screen_view: { icon: <Monitor size={16} />, label: 'Digital Event', color: 'bg-slate-100 text-slate-600' },
  survey: { icon: <Star size={16} />, label: 'Survey', color: 'bg-yellow-50 text-yellow-600 border-2 border-yellow-300' },
  system_log: { icon: <AlertTriangle size={16} />, label: 'System Log', color: 'bg-red-50 text-red-600 border-2 border-red-300' },
  mixpanel_event: { icon: <Activity size={16} />, label: 'Digital Event', color: 'bg-slate-100 text-slate-600' },
  rxos_activity: { icon: <Server size={16} />, label: 'RxOS Activity', color: 'bg-purple-50 text-purple-600 border-2 border-purple-300' },
  prior_auth_activity: { icon: <ShieldCheck size={16} />, label: 'Prior Auth', color: 'bg-blue-50 text-blue-600 border-2 border-blue-300' },
};

interface TimelineEventProps {
  event: JourneyEvent;
  isLast?: boolean;
  medication?: string;
  orderId?: string;
}

export function TimelineEvent({ event, isLast = false, medication, orderId }: TimelineEventProps) {
  const [expanded, setExpanded] = useState(false);
  const [showFlagPopover, setShowFlagPopover] = useState(false);
  const config = eventTypeConfig[event.type];
  const hasError = event.errorIndicators && event.errorIndicators.length > 0;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderContent = () => {
    const content = event.content;

    if (isSMSContent(content)) {
      const isOutbound = content.direction === 'outbound';
      // iOS iMessage blue: #007AFF
      // iOS received gray: #E5E5EA
      return (
        <div className="space-y-2">
          {isOutbound ? (
            /* Outbound - Blink sent */
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow border">
                  <Image
                    src="/blinkrx-logo.png"
                    alt="BlinkRx"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-red-600">BlinkRx</span>
              </div>
              <div 
                className="max-w-[85%] py-2.5 px-3 rounded-2xl text-sm text-slate-900"
                style={{ backgroundColor: '#E5E5EA' }}
              >
                {content.body}
              </div>
            </div>
          ) : (
            /* Inbound - Patient sent */
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium" style={{ color: '#007AFF' }}>Patient</span>
                {content.phoneNumber && (
                  <span className="text-xs" style={{ color: '#007AFF', opacity: 0.7 }}>{content.phoneNumber}</span>
                )}
              </div>
              <div 
                className="max-w-[85%] py-2.5 px-3 rounded-2xl text-sm text-white"
                style={{ backgroundColor: '#007AFF' }}
              >
                {content.body}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isEmailContent(content)) {
      const isOutbound = content.direction === 'outbound';
      return (
        <div className="space-y-3">
          {/* Sender indicator */}
          {isOutbound ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow border">
                <Image
                  src="/blinkrx-logo.png"
                  alt="BlinkRx"
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-red-600">BlinkRx</span>
              {content.to && (
                <span className="text-xs text-slate-400">→ {content.to}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#007AFF' }}>
                <User size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#007AFF' }}>Patient</span>
              {content.from && (
                <span className="text-xs text-slate-400">{content.from}</span>
              )}
              <span className="text-xs text-slate-400">→</span>
              <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow border">
                <Image
                  src="/blinkrx-logo.png"
                  alt="BlinkRx"
                  width={12}
                  height={12}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-red-600">BlinkRx</span>
            </div>
          )}
          
          {/* Email content */}
          <div className={`rounded-lg border ${isOutbound ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <div className={`px-3 py-2 border-b ${isOutbound ? 'border-red-200 bg-red-100' : 'border-blue-200 bg-blue-100'}`}>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Subject</p>
              <p className="font-medium text-slate-900 text-sm">{content.subject}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-slate-500 mb-0.5">Body</p>
          <p className="text-sm text-slate-600">{content.preview}</p>
          {expanded && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
              {content.body}
            </div>
          )}
            </div>
          </div>
        </div>
      );
    }

    if (isVoiceBroadcastContent(content)) {
      return (
        <div className="space-y-3">
          {/* Sender indicator - always BlinkRx */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow border">
              <Image
                src="/blinkrx-logo.png"
                alt="BlinkRx"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span className="text-xs font-semibold text-red-600">BlinkRx</span>
            <span className="text-xs text-slate-400">→ Patient</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
              <Play size={14} />
              Play Audio
            </button>
            <span className="text-sm text-slate-500">{Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}</span>
          </div>
          {expanded && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Transcript</p>
              <p className="text-sm text-slate-700">{content.transcript}</p>
            </div>
          )}
        </div>
      );
    }

    if (isCallContent(content)) {
      // Inbound = Patient calling BlinkRx, Outbound = BlinkRx calling Patient
      const isOutbound = content.direction === 'outbound';
      return (
        <div className="space-y-3">
          {/* Direction indicator */}
          {isOutbound ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow border">
                <Image
                  src="/blinkrx-logo.png"
                  alt="BlinkRx"
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-red-600">BlinkRx</span>
              <span className="text-xs text-slate-400">→</span>
              <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: '#007AFF' }}>
                <User size={12} className="text-white" />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#007AFF' }}>Patient</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#007AFF' }}>
                <User size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold" style={{ color: '#007AFF' }}>Patient</span>
              <span className="text-xs text-slate-400">→</span>
              <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow border">
                <Image
                  src="/blinkrx-logo.png"
                  alt="BlinkRx"
                  width={12}
                  height={12}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-red-600">BlinkRx</span>
            </div>
          )}

          {/* Call details */}
          <div className="flex items-center gap-3">
            <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isOutbound ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
              <Play size={14} />
              Play Audio
            </button>
            <span className="text-sm text-slate-500">{Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}</span>
            {content.agentName && <span className="text-sm text-slate-600">• Agent: {content.agentName}</span>}
          </div>
          
          {content.summary && (
            <div className={`p-3 rounded-lg border ${isOutbound ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
              <p className="text-xs font-medium text-slate-500 mb-1">Summary</p>
              <p className="text-sm text-slate-700">{content.summary}</p>
            </div>
          )}
          
          {content.levelAiUrl && (
            <a href={content.levelAiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
              View in Level AI <ExternalLink size={12} />
            </a>
          )}
          
          {expanded && content.transcript && (
            <div className="p-3 rounded-lg border bg-white border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-2">Transcript</p>
              <div className="space-y-2">
                {content.transcript.split('\n').map((line, idx) => {
                  const isAgentLine = line.toLowerCase().startsWith('agent:');
                  const isPatientLine = line.toLowerCase().startsWith('patient:');
                  // Generate mock timestamps based on line index
                  const startSec = idx * 15;
                  const endSec = startSec + 10 + Math.floor(Math.random() * 10);
                  const formatTime = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
                  const timestamp = `${formatTime(startSec)} → ${formatTime(endSec)}`;
                  
                  if (isAgentLine) {
                    const text = line.replace(/^agent:\s*/i, '');
                    return (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full shadow border flex items-center justify-center">
                          <Image
                            src="/blinkrx-logo.png"
                            alt="Agent"
                            width={14}
                            height={14}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 p-2 rounded-lg bg-red-50 border border-red-100">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-red-600">Agent</p>
                              <span className="text-xs text-slate-400">{timestamp}</span>
                            </div>
                            <div className="relative group">
                              <button 
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                              >
                                <Play size={10} />
                              </button>
                              <div className="absolute z-20 bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Jump to {formatTime(startSec)}
                                <div className="absolute top-full right-2 border-4 border-transparent border-t-slate-800" />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700">{text}</p>
                        </div>
                      </div>
                    );
                  } else if (isPatientLine) {
                    const text = line.replace(/^patient:\s*/i, '');
                    return (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#007AFF' }}>
                          <User size={14} className="text-white" />
                        </div>
                        <div className="flex-1 p-2 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold" style={{ color: '#007AFF' }}>Patient</p>
                              <span className="text-xs text-slate-400">{timestamp}</span>
                            </div>
                            <div className="relative group">
                              <button 
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                              >
                                <Play size={10} />
                              </button>
                              <div className="absolute z-20 bottom-full right-0 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Jump to {formatTime(startSec)}
                                <div className="absolute top-full right-2 border-4 border-transparent border-t-slate-800" />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700">{text}</p>
                        </div>
                      </div>
                    );
                  } else if (line.trim()) {
                    return (
                      <p key={idx} className="text-sm text-slate-500 italic pl-8">{line}</p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isChatContent(content)) {
      const recentMessages = expanded ? content.messages : content.messages.slice(-3);
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {content.agentName && (
              <>
                <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full shadow border">
                  <Image
                    src="/blinkrx-logo.png"
                    alt="BlinkRx"
                    width={12}
                    height={12}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm text-slate-600">Agent: {content.agentName}</span>
              </>
            )}
            <Badge variant={content.resolved ? 'success' : 'warning'}>
              {content.resolved ? 'Resolved' : 'Open'}
            </Badge>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
            {recentMessages.map((msg) => {
              const isPatient = msg.sender === 'patient';
              const isAgent = msg.sender === 'agent';
              const isBot = msg.sender === 'bot';
              const msgTime = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              
              return (
                <div key={msg.id} className={`flex gap-2 ${isPatient ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {isPatient ? (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#007AFF' }}>
                      <User size={14} className="text-white" />
                    </div>
                  ) : isAgent ? (
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full shadow border flex items-center justify-center">
                      <Image
                        src="/blinkrx-logo.png"
                        alt="Agent"
                        width={14}
                        height={14}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Activity size={12} className="text-white" />
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`flex-1 max-w-[80%] p-2 rounded-lg border ${
                    isPatient 
                      ? 'bg-blue-50 border-blue-100' 
                      : isAgent 
                        ? 'bg-red-50 border-red-100' 
                        : 'bg-purple-50 border-purple-100'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-xs font-semibold ${
                        isPatient 
                          ? 'text-blue-600' 
                          : isAgent 
                            ? 'text-red-600' 
                            : 'text-purple-600'
                      }`}>
                        {isPatient ? 'Patient' : isBot ? 'Bot' : msg.senderName || 'Agent'}
                      </p>
                      <span className="text-xs text-slate-400">{msgTime}</span>
                    </div>
                    <p className="text-sm text-slate-700">{msg.message}</p>
                  </div>
              </div>
              );
            })}
          </div>
          {content.messages.length > 3 && !expanded && (
            <p className="text-xs text-slate-500">+{content.messages.length - 3} more messages</p>
          )}
        </div>
      );
    }

    if (isScreenViewContent(content)) {
      return (
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <Monitor size={14} className="text-slate-400" />
          <p className="text-sm font-medium text-slate-900">{content.screenName}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
          {expanded && (
            <div className="ml-6 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
          {content.sessionId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Session ID</span>
                  <span className="text-slate-700 font-mono">{content.sessionId}</span>
                </div>
              )}
              {content.eventProperties && Object.keys(content.eventProperties).length > 0 && (
                <div className="pt-1 border-t border-slate-200 mt-1">
                  <p className="text-slate-500 mb-1">Properties</p>
                  <pre className="text-slate-600 text-xs">{JSON.stringify(content.eventProperties, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (isSurveyContent(content)) {
      return (
        <div className="space-y-3">
          {/* Rating summary - always visible */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
          <div className="flex items-center gap-2">
            <Badge variant={content.surveyType === 'nps' ? 'info' : 'default'}>
              {content.surveyType.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-1">
              {[...Array(content.maxRating <= 5 ? content.maxRating : 5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < (content.rating / (content.maxRating / 5)) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {content.rating}/{content.maxRating}
            </span>
          </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Expanded details */}
          {expanded && (
            <div className="space-y-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              {/* Primary Question & Rating */}
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                {content.question && (
                  <p className="text-sm font-medium text-slate-700 mb-2">{content.question}</p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        content.rating / content.maxRating >= 0.7 ? 'bg-green-500' :
                        content.rating / content.maxRating >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(content.rating / content.maxRating) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{content.rating}/{content.maxRating}</span>
                </div>
              </div>
              
              {/* Additional Questions */}
              {content.additionalQuestions && content.additionalQuestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500 uppercase">Additional Questions</p>
                  {content.additionalQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">{q.question}</p>
                      {q.type === 'rating' && typeof q.answer === 'number' ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(q.maxRating || 5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < (q.answer as number) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-slate-600">{q.answer}/{q.maxRating || 5}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{String(q.answer)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Verbatim response */}
          {content.verbatim && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-2">Open-Ended Response</p>
                  <p className="text-sm text-slate-700 italic bg-white p-3 rounded-lg border border-yellow-200">
                    &ldquo;{content.verbatim}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Verbatim preview when collapsed */}
          {!expanded && content.verbatim && (
            <p className="text-sm text-slate-600 italic truncate">&ldquo;{content.verbatim}&rdquo;</p>
          )}
        </div>
      );
    }

    if (isSystemLogContent(content)) {
      return (
        <div className={`p-3 rounded-lg ${content.statusCode && content.statusCode >= 400 ? 'bg-red-50' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            {content.statusCode && (
              <Badge variant={content.statusCode >= 400 ? 'error' : 'default'}>
                {content.statusCode}
              </Badge>
            )}
            {content.endpoint && (
              <code className="text-xs text-slate-600">{content.endpoint}</code>
            )}
          </div>
          <p className="text-sm text-slate-700">{content.message}</p>
          {content.requestId && (
            <p className="text-xs text-slate-500 mt-1">Request ID: {content.requestId}</p>
          )}
        </div>
      );
    }

    if (isMixpanelEventContent(content)) {
      return (
        <div className="space-y-2">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-slate-400" />
          <p className="text-sm font-medium text-slate-900">{content.eventName}</p>
            </div>
            {Object.keys(content.properties).length > 0 && (
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
          {expanded && Object.keys(content.properties).length > 0 && (
            <div className="ml-6 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <p className="text-slate-500 mb-1">Properties</p>
              <div className="space-y-1">
                {Object.entries(content.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-500">{key}</span>
                    <span className="text-slate-700 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isRxOSActivityContent(content)) {
      const activityTypeLabels: Record<string, string> = {
        order_created: 'Order Created',
        order_updated: 'Order Updated',
        price_published: 'Price Published',
        prescription_received: 'Rx Received',
        prescription_transferred: 'Rx Transferred',
        pharmacist_review: 'Pharmacist Review',
        pharmacist_action: 'Pharmacist Action',
        fulfillment_started: 'Fulfillment Started',
        fulfillment_completed: 'Fulfillment Completed',
        shipment_created: 'Shipment Created',
        shipment_picked_up: 'Shipment Picked Up',
        shipment_in_transit: 'In Transit',
        shipment_delivered: 'Delivered',
        prior_auth_required: 'Prior Auth Required',
        prior_auth_submitted: 'Prior Auth Submitted',
        prior_auth_approved: 'Prior Auth Approved',
        prior_auth_denied: 'Prior Auth Denied',
        insurance_billed: 'Insurance Billed',
        insurance_rejected: 'Insurance Rejected',
        refill_reminder_sent: 'Refill Reminder',
        manual_review_required: 'Manual Review',
        patient_outreach: 'Patient Outreach',
      };

      const hasDetails = content.details && Object.keys(content.details).length > 0;

      return (
        <div className="space-y-2">
          <div 
            className={`flex items-center justify-between ${hasDetails ? 'cursor-pointer' : ''}`}
            onClick={() => hasDetails && setExpanded(!expanded)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 uppercase">
                  {activityTypeLabels[content.activityType] || content.activityType}
                </span>
                {content.actor && (
                  <span className="text-xs text-slate-400">by {content.actor}</span>
                )}
              </div>
              <p className="text-sm text-slate-700 mt-0.5">{content.description}</p>
            </div>
            {hasDetails && (
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
          
          {/* Order/Prescription ID badges */}
          {(content.orderId || content.prescriptionId) && (
            <div className="flex gap-2">
              {content.orderId && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">
                  {content.orderId}
                </span>
              )}
              {content.prescriptionId && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {content.prescriptionId}
                </span>
              )}
            </div>
          )}

          {/* Expanded details */}
          {expanded && hasDetails && (
            <div className="p-2 bg-purple-50 rounded border border-purple-100 text-xs">
              <div className="space-y-0.5">
                {Object.entries(content.details!).map(([key, value]) => (
                  <div key={key} className="flex gap-3 py-0.5">
                    <span className="text-purple-600 min-w-[80px]">{key}</span>
                    <span className="text-slate-700 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isPriorAuthActivityContent(content)) {
      const activityTypeLabels: Record<string, string> = {
        pa_initiated: 'PA Initiated',
        pa_submitted: 'PA Submitted',
        pa_pending_review: 'Pending Review',
        pa_additional_info_requested: 'Additional Info Requested',
        pa_approved: 'PA Approved',
        pa_denied: 'PA Denied',
        pa_appeal_submitted: 'Appeal Submitted',
        pa_appeal_approved: 'Appeal Approved',
        pa_appeal_denied: 'Appeal Denied',
        pa_expired: 'PA Expired',
      };

      const statusColors: Record<string, string> = {
        pa_approved: 'text-green-600',
        pa_appeal_approved: 'text-green-600',
        pa_denied: 'text-red-600',
        pa_appeal_denied: 'text-red-600',
        pa_expired: 'text-red-600',
        pa_pending_review: 'text-amber-600',
        pa_additional_info_requested: 'text-amber-600',
      };

      const hasDetails = content.details && Object.keys(content.details).length > 0;

      return (
        <div className="space-y-2">
          <div 
            className={`flex items-center justify-between ${hasDetails ? 'cursor-pointer' : ''}`}
            onClick={() => hasDetails && setExpanded(!expanded)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase ${statusColors[content.activityType] || 'text-blue-600'}`}>
                  {activityTypeLabels[content.activityType] || content.activityType}
                </span>
                {content.insurerName && (
                  <span className="text-xs text-slate-400">{content.insurerName}</span>
                )}
              </div>
              <p className="text-sm text-slate-700 mt-0.5">{content.description}</p>
              {content.reason && (
                <p className="text-xs text-slate-500 mt-1 italic">{content.reason}</p>
              )}
            </div>
            {hasDetails && (
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            )}
          </div>
          
          {/* PA Number badge */}
          {content.paNumber && (
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                PA# {content.paNumber}
              </span>
              {content.expirationDate && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Expires: {new Date(content.expirationDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Expanded details */}
          {expanded && hasDetails && (
            <div className="p-2 bg-blue-50 rounded border border-blue-100 text-xs">
              <div className="space-y-0.5">
                {Object.entries(content.details!).map(([key, value]) => (
                  <div key={key} className="flex gap-3 py-0.5">
                    <span className="text-blue-600 min-w-[80px]">{key}</span>
                    <span className="text-slate-700 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const shouldShowExpand = 
    isEmailContent(event.content) ||
    isCallContent(event.content) ||
    isChatContent(event.content) ||
    isVoiceBroadcastContent(event.content);

  const isDigitalEvent = isScreenViewContent(event.content) || isMixpanelEventContent(event.content);

  // Compact rendering for digital events
  if (isDigitalEvent) {
    const eventName = isScreenViewContent(event.content) 
      ? event.content.screenName 
      : (event.content as { eventName: string }).eventName;
    
    const hasDetails = isScreenViewContent(event.content) 
      ? !!(event.content.sessionId || event.content.eventProperties)
      : Object.keys((event.content as { properties: Record<string, unknown> }).properties).length > 0;

    // Get session ID for Mixpanel link
    const sessionId = isScreenViewContent(event.content) 
      ? event.content.sessionId 
      : event.metadata.sessionId;

    return (
      <div className="relative flex items-start gap-3 group pb-4">
        {/* Time on the left */}
        <div className="flex-shrink-0 w-16 text-right pt-2.5">
          <p className="text-xs text-slate-500 font-medium">{formatTime(event.timestamp)}</p>
          <p className="text-[10px] text-slate-400">{formatDate(event.timestamp)}</p>
        </div>

        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-[84px] top-12 bottom-0 w-0.5 bg-slate-200" />
        )}
        
        {/* Icon - same size as standard events for alignment */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full z-10 bg-yellow-50 border-2 border-yellow-300 flex items-center justify-center">
          {isScreenViewContent(event.content) 
            ? <Monitor size={16} className="text-yellow-600" />
            : <Activity size={16} className="text-yellow-600" />
          }
        </div>

        {/* Content */}
        <div className={`flex-1 ${hasDetails ? 'cursor-pointer' : ''}`} onClick={() => hasDetails && setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mixpanel Session Recording Link */}
              {sessionId && (
                <div className="relative group/mixpanel">
                  <a
                    href={`https://mixpanel.com/project/2195193/view/3039671/app/replay/${sessionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
                  >
                    <Play size={10} />
                    <ExternalLink size={10} />
                  </a>
                  <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover/mixpanel:opacity-100 transition-opacity pointer-events-none">
                    View Mixpanel session recording
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                  </div>
                </div>
              )}
              <span className="text-xs font-bold text-slate-500 uppercase">
                {isScreenViewContent(event.content) ? 'Screen View' : 'Event'}
              </span>
              <span className="text-sm text-slate-900">{eventName}</span>
              {hasDetails && (
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Flag button */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFlagPopover(!showFlagPopover); }}
                  className="p-1 rounded hover:bg-orange-100 text-slate-400 hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Flag issue"
                >
                  <Flag size={12} />
                </button>
                <FlagIssuePopover
                  isOpen={showFlagPopover}
                  onClose={() => setShowFlagPopover(false)}
                  eventId={event.id}
                  eventType={event.type}
                />
              </div>
            </div>
          </div>
          
          {/* Expanded details */}
          {expanded && hasDetails && (
            <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs inline-block">
              {isScreenViewContent(event.content) && event.content.sessionId && (
                <div className="flex gap-3 py-0.5">
                  <span className="text-slate-500">Session</span>
                  <span className="text-slate-700 font-mono">{event.content.sessionId}</span>
                </div>
              )}
              {isMixpanelEventContent(event.content) && (
                <div className="space-y-0.5">
                  {Object.entries(event.content.properties).map(([key, value]) => (
                    <div key={key} className="flex gap-3 py-0.5">
                      <span className="text-slate-500 min-w-[80px]">{key}</span>
                      <span className="text-slate-700 font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard card rendering for other event types
  return (
    <div className="timeline-event relative flex gap-3 pb-4">
      {/* Time on the left */}
      <div className="flex-shrink-0 w-16 text-right pt-1">
        <p className="text-xs text-slate-500 font-medium">{formatTime(event.timestamp)}</p>
        <p className="text-[10px] text-slate-400">{formatDate(event.timestamp)}</p>
      </div>

      {/* Timeline connector */}
      {!isLast && <div className="timeline-connector" />}

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
        hasError ? 'bg-red-100 text-red-600 ring-2 ring-red-300' : config.color
      }`}>
        {hasError ? <AlertTriangle size={16} /> : config.icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{config.label}</span>
              {hasError && (
                <Badge variant="error">Error</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Flag button */}
              <div className="relative">
                <button
                  onClick={() => setShowFlagPopover(!showFlagPopover)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    showFlagPopover 
                      ? 'bg-orange-100 border-orange-300 text-orange-600' 
                      : 'border-slate-200 text-slate-400 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-500'
                  }`}
                  title="Flag issue"
                >
                  <Flag size={14} />
                </button>
                <FlagIssuePopover
                  isOpen={showFlagPopover}
                  onClose={() => setShowFlagPopover(false)}
                  eventId={event.id}
                  eventType={event.type}
                />
              </div>
            </div>
          </div>

          {/* Error indicators */}
          {hasError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {event.errorIndicators?.map((err, i) => (
                <p key={i}>{err.message}</p>
              ))}
            </div>
          )}

          {/* Main content */}
          {renderContent()}

          {/* Expand button */}
          {shouldShowExpand && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}

          {/* Metadata */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Source: {event.metadata.source}
              {medication && ` • Medication: ${medication}`}
              {orderId && ` • Order: ${orderId}`}
              {event.metadata.sessionId && ` • Session: ${event.metadata.sessionId}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

