'use client';

import React from 'react';
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
  Server,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Badge } from '@/components/shared';
import type { JourneyEvent, EventType } from '@/types/journey';
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

interface EventPreviewProps {
  event: JourneyEvent;
  medication?: string;
  orderId?: string;
}

export function EventPreview({ event, medication, orderId }: EventPreviewProps) {
  const config = eventTypeConfig[event.type];
  const hasError = event.errorIndicators && event.errorIndicators.length > 0;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderContent = () => {
    const content = event.content;

    if (isSMSContent(content)) {
      const isOutbound = content.direction === 'outbound';
      return (
        <div className="space-y-2">
          {isOutbound ? (
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
                <span className="text-xs text-white font-semibold">P</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: '#007AFF' }}>Patient</span>
              {content.from && (
                <span className="text-xs text-slate-400">{content.from}</span>
              )}
            </div>
          )}
          
          <div className={`rounded-lg border ${isOutbound ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <div className={`px-3 py-2 border-b ${isOutbound ? 'border-red-200 bg-red-100' : 'border-blue-200 bg-blue-100'}`}>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Subject</p>
              <p className="font-medium text-slate-900 text-sm">{content.subject}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-slate-500 mb-0.5">Body</p>
              <p className="text-sm text-slate-600 line-clamp-3">{content.preview || content.body}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isCallContent(content)) {
      const isOutbound = content.direction === 'outbound';
      return (
        <div className="space-y-3">
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
              <span className="text-xs text-slate-400">→ Patient</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#007AFF' }}>
                <span className="text-xs text-white font-semibold">P</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: '#007AFF' }}>Patient</span>
              <span className="text-xs text-slate-400">→ BlinkRx</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}</span>
            {content.agentName && <span className="text-sm text-slate-600">• Agent: {content.agentName}</span>}
          </div>
          
          {content.summary && (
            <div className={`p-3 rounded-lg border ${isOutbound ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
              <p className="text-xs font-medium text-slate-500 mb-1">Summary</p>
              <p className="text-sm text-slate-700 line-clamp-3">{content.summary}</p>
            </div>
          )}
        </div>
      );
    }

    if (isChatContent(content)) {
      const recentMessages = content.messages.slice(-2);
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
          <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
            {recentMessages.map((msg) => {
              const isPatient = msg.sender === 'patient';
              return (
                <div key={msg.id} className={`flex gap-2 ${isPatient ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-1 max-w-[80%] p-2 rounded-lg border ${
                    isPatient 
                      ? 'bg-blue-50 border-blue-100' 
                      : 'bg-red-50 border-red-100'
                  }`}>
                    <p className={`text-xs font-semibold mb-0.5 ${
                      isPatient ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {isPatient ? 'Patient' : msg.senderName || 'Agent'}
                    </p>
                    <p className="text-sm text-slate-700">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {content.messages.length > 2 && (
            <p className="text-xs text-slate-500">+{content.messages.length - 2} more messages</p>
          )}
        </div>
      );
    }

    if (isScreenViewContent(content)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-900">{content.screenName}</p>
          </div>
          {content.sessionId && (
            <p className="text-xs text-slate-500 font-mono">{content.sessionId}</p>
          )}
        </div>
      );
    }

    if (isSurveyContent(content)) {
      return (
        <div className="space-y-3">
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
          {content.verbatim && (
            <p className="text-sm text-slate-600 italic line-clamp-2">&ldquo;{content.verbatim}&rdquo;</p>
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
        </div>
      );
    }

    if (isMixpanelEventContent(content)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-900">{content.eventName}</p>
          </div>
          {Object.keys(content.properties).length > 0 && (
            <p className="text-xs text-slate-500">{Object.keys(content.properties).length} properties</p>
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

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-600 uppercase">
              {activityTypeLabels[content.activityType] || content.activityType}
            </span>
            {content.actor && (
              <span className="text-xs text-slate-400">by {content.actor}</span>
            )}
          </div>
          <p className="text-sm text-slate-700">{content.description}</p>
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

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase">
              {activityTypeLabels[content.activityType] || content.activityType}
            </span>
            {content.insurerName && (
              <span className="text-xs text-slate-400">{content.insurerName}</span>
            )}
          </div>
          <p className="text-sm text-slate-700">{content.description}</p>
          {content.paNumber && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
              PA# {content.paNumber}
            </span>
          )}
        </div>
      );
    }

    if (isVoiceBroadcastContent(content)) {
      return (
        <div className="space-y-3">
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
            <span className="text-sm text-slate-500">{Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            hasError ? 'bg-red-100 text-red-600 ring-2 ring-red-300' : config.color
          }`}>
            {hasError ? <AlertTriangle size={16} /> : config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{config.label}</span>
              {hasError && (
                <Badge variant="error">Error</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{formatTime(event.timestamp)}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{formatDate(event.timestamp)}</span>
            </div>
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
      <div className="mb-3">
        {renderContent()}
      </div>

      {/* Metadata */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Source: {event.metadata.source}
          {medication && ` • Medication: ${medication}`}
          {orderId && ` • Order: ${orderId}`}
          {event.metadata.sessionId && ` • Session: ${event.metadata.sessionId}`}
        </p>
      </div>
    </div>
  );
}
