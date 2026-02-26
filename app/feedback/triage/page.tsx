'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { mockFeedbackItems, mockSTLs, generateMockJourneys } from '@/config/dummyData';
import type { FeedbackItem } from '@/types/feedback';

// Get journeys for patient lookup
const allJourneys = generateMockJourneys(50);

interface TriageState {
  feedbackId: string;
  assignedSTL: string | null;
  isNew: boolean | null; // true = new issue, false = existing issue, null = not decided
}

export default function TriagePage() {
  // Helper to get patient initials from journey
  const getPatientInfo = (journeyId: string | undefined) => {
    if (!journeyId) return null;
    const journey = allJourneys.find(j => j.id === journeyId);
    return journey?.patientInfo;
  };

  // Filter for negative feedback that hasn't been triaged yet
  const negativeFeedback = useMemo(() => {
    return mockFeedbackItems.filter((item) => {
      // Consider feedback negative if rating is low
      if (item.rating && item.maxRating) {
        const percentage = (item.rating / item.maxRating) * 100;
        return percentage < 50; // Less than 50% rating
      }
      // For agent-flagged items, consider them all as needing triage
      if (item.source.includes('agent_flagged')) {
        return true;
      }
      return false;
    });
  }, []);

  const [triageStates, setTriageStates] = useState<Record<string, TriageState>>({});

  const handleSTLSelect = (feedbackId: string, stlId: string) => {
    setTriageStates((prev) => ({
      ...prev,
      [feedbackId]: {
        ...prev[feedbackId],
        feedbackId,
        assignedSTL: stlId,
      },
    }));
  };

  const handleIssueTypeSelect = (feedbackId: string, isNew: boolean) => {
    setTriageStates((prev) => ({
      ...prev,
      [feedbackId]: {
        ...prev[feedbackId],
        feedbackId,
        isNew,
      },
    }));
  };

  const triagedCount = Object.values(triageStates).filter(
    (state) => state.assignedSTL && state.isNew !== null
  ).length;
  const totalCount = negativeFeedback.length;
  const progress = totalCount > 0 ? (triagedCount / totalCount) * 100 : 0;

  const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      nps: 'NPS Survey',
      csat: 'CSAT Survey',
      app_store: 'App Store',
      google_play: 'Google Play',
      trustpilot: 'Trustpilot',
      dnpu: 'DNPU Survey',
      agent_flagged_call: 'Agent Call',
      agent_flagged_chat: 'Agent Chat',
      agent_flagged_email: 'Agent Email',
      employee_observation: 'Employee',
    };
    return labels[source] || source;
  };

  const getRatingDisplay = (item: FeedbackItem): string => {
    if (!item.rating || !item.maxRating) return '';
    return `${item.rating}/${item.maxRating}`;
  };

  const getRatingColor = (item: FeedbackItem): string => {
    if (!item.rating || !item.maxRating) return 'bg-slate-100 text-slate-700';
    const percentage = (item.rating / item.maxRating) * 100;
    if (percentage < 30) return 'bg-red-100 text-red-700 border border-red-300';
    if (percentage < 50) return 'bg-orange-100 text-orange-700 border border-orange-300';
    return 'bg-slate-100 text-slate-700';
  };

  const canLinkToPatient = (source: string): boolean => {
    // Public review sources don't have patient linkage
    return !['app_store', 'google_play', 'trustpilot'].includes(source);
  };

  return (
    <div className="space-y-6">
      <div className="mt-6 mx-6">
        <PageHeader
          title="Feedback Triage"
          description="Review negative feedback and assign to Single Threaded Leaders"
          actions={
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Progress</p>
                <p className="text-lg font-bold text-slate-900">
                  {triagedCount}/{totalCount}
                </p>
              </div>
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Triage Queue */}
      <div className="mx-6 space-y-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Incoming Negative Feedback</h2>
          <p className="text-sm text-slate-500">Determine if each issue is new or existing, and assign to a Single Threaded Leader</p>
        </div>

        <div className="space-y-4">
          {negativeFeedback.map((feedback) => {
            const state = triageStates[feedback.id];
            const isTriaged = state?.assignedSTL && state?.isNew !== null;
            const selectedSTL = mockSTLs.find((stl) => stl.id === state?.assignedSTL);

            const patientInfo = getPatientInfo(feedback.metadata.journeyId);

            return (
              <div
                key={feedback.id}
                className={`bg-white border p-6 transition-all ${isTriaged ? 'border-teal-300 bg-teal-50' : 'border-slate-200'}`}
                style={{ borderRadius: '16px' }}
              >
                <div className="flex items-start gap-6">
                  {/* Left side: Patient Feedback */}
                  <div className="flex-1 min-w-0">
                    {/* Patient Header - Only show if we have patient data */}
                    {canLinkToPatient(feedback.source) && (
                      <div className="mb-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                          {patientInfo?.initials ? (
                            <span className="text-base font-semibold text-slate-900">
                              {patientInfo.initials}
                            </span>
                          ) : feedback.metadata.patientId && (
                            <span className="text-sm font-medium text-slate-900">
                              Patient: {feedback.metadata.patientId}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          {feedback.metadata.patientId && (
                            <span>ID: {feedback.metadata.patientId}</span>
                          )}
                          {feedback.metadata.orderId && (
                            <span>Order: {feedback.metadata.orderId}</span>
                          )}
                          {feedback.metadata.drug && (
                            <span>Drug: {feedback.metadata.drug}</span>
                          )}
                          {feedback.metadata.state && (
                            <span>State: {feedback.metadata.state}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Header with source and rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {getSourceLabel(feedback.source)}
                      </span>
                      {getRatingDisplay(feedback) && (
                        <span className={`px-3 py-1 text-sm font-bold rounded-lg ${getRatingColor(feedback)}`}>
                          {getRatingDisplay(feedback)}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(feedback.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Patient feedback verbatim */}
                    <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm text-slate-700 italic leading-relaxed">
                        &ldquo;{feedback.verbatim}&rdquo;
                      </p>
                    </div>

                    {/* Patient links */}
                    {canLinkToPatient(feedback.source) ? (
                      <div className="flex items-center gap-3">
                        {feedback.metadata.journeyId && (
                          <Link
                            href={`/journey/${feedback.metadata.journeyId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                          >
                            View Patient Journey
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        {feedback.metadata.patientId && (
                          <a
                            href={`https://rxos.blinkhealth.com/patient/${feedback.metadata.patientId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                          >
                            Patient Profile
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <span className="font-medium">Note:</span> Public reviews from {getSourceLabel(feedback.source)} cannot be linked to specific patients.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right side: Actions */}
                  <div className="w-80 flex-shrink-0 space-y-4">
                    {/* Status indicator */}
                    {isTriaged ? (
                      <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                        <CheckCircle className="text-teal-600 flex-shrink-0" size={20} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-teal-900">
                            {state.isNew ? 'New Issue' : 'Existing Issue'}
                          </p>
                          <p className="text-sm text-teal-700 truncate">
                            {selectedSTL?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => setTriageStates((prev) => {
                            const newState = { ...prev };
                            delete newState[feedback.id];
                            return newState;
                          })}
                          className="text-sm text-teal-700 hover:text-teal-800 font-medium flex-shrink-0"
                        >
                          Undo
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Issue type selector */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Issue Type
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleIssueTypeSelect(feedback.id, true)}
                              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                state?.isNew === true
                                  ? 'bg-orange-50 border-orange-500 text-orange-700'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              New Issue
                            </button>
                            <button
                              onClick={() => handleIssueTypeSelect(feedback.id, false)}
                              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                state?.isNew === false
                                  ? 'bg-teal-50 border-teal-500 text-teal-700'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              Existing Issue
                            </button>
                          </div>
                        </div>

                        {/* STL selector */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Assign to STL
                          </label>
                          <select
                            value={state?.assignedSTL || ''}
                            onChange={(e) => handleSTLSelect(feedback.id, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="">Select STL...</option>
                            {mockSTLs.map((stl) => (
                              <option key={stl.id} value={stl.id}>
                                {stl.name} ({stl.team})
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {negativeFeedback.length === 0 && (
          <div className="bg-white border p-12 text-center" style={{ borderRadius: '16px' }}>
            <CheckCircle className="text-teal-500 mx-auto mb-3" size={48} />
            <p className="text-lg font-medium text-slate-900">No negative feedback!</p>
            <p className="text-slate-500">The queue is empty</p>
          </div>
        )}
      </div>

      {/* Completion */}
      {triagedCount === totalCount && totalCount > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center mx-6">
          <CheckCircle className="text-teal-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-teal-900 mb-2">Triage Complete!</h3>
          <p className="text-teal-700 mb-4">
            You&apos;ve triaged all {totalCount} pieces of negative feedback.
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

