'use client';

import React, { useEffect } from 'react';
import { X, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { FeedbackItem } from '@/types/feedback';
import {
  getSourceLabel,
  getRatingDisplay,
  getRatingColor,
  canLinkToPatient,
} from '@/lib/feedback-utils';

interface FeedbackDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackItem | null;
}

export function FeedbackDetailSidebar({
  isOpen,
  onClose,
  feedback,
}: FeedbackDetailSidebarProps) {
  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !feedback) return null;

  const ratingColors = getRatingColor(feedback);

  return (
    <div
      className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col"
      role="dialog"
      aria-label="Feedback details"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Feedback Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          ID: {feedback.id}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Info Cards */}
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2">
            {/* Rating */}
            <div
              className="px-3 py-2 rounded-lg text-center"
              style={{ backgroundColor: ratingColors.bg }}
            >
              <div className="text-xs text-slate-600 mb-1">Rating</div>
              <div
                className="text-sm font-bold"
                style={{ color: ratingColors.text }}
              >
                {getRatingDisplay(feedback)}
              </div>
            </div>

            {/* Source */}
            <div className="px-3 py-2 rounded-lg text-center bg-blue-50">
              <div className="text-xs text-slate-600 mb-1">Source</div>
              <div className="text-sm font-semibold text-blue-700">
                {getSourceLabel(feedback.source)}
              </div>
            </div>

            {/* Date */}
            <div className="px-3 py-2 rounded-lg text-center bg-slate-50">
              <div className="text-xs text-slate-600 mb-1">Date</div>
              <div className="text-sm font-semibold text-slate-700">
                {new Date(feedback.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Program */}
            <div className="px-3 py-2 rounded-lg text-center bg-purple-50">
              <div className="text-xs text-slate-600 mb-1">Program</div>
              <div className="text-sm font-semibold text-purple-700">
                {feedback.metadata.program || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Verbatim Section */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Full Feedback
          </h3>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              &ldquo;{feedback.verbatim}&rdquo;
            </p>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Patient & Order Context
          </h3>
          <div className="space-y-2 text-sm">
            {feedback.metadata.patientId && (
              <div className="flex justify-between">
                <span className="text-slate-600">Patient ID:</span>
                <span className="font-mono text-slate-900">
                  {feedback.metadata.patientId}
                </span>
              </div>
            )}
            {feedback.metadata.orderId && (
              <div className="flex justify-between">
                <span className="text-slate-600">Order ID:</span>
                <span className="font-mono text-slate-900">
                  {feedback.metadata.orderId}
                </span>
              </div>
            )}
            {feedback.metadata.drug && (
              <div className="flex justify-between">
                <span className="text-slate-600">Drug:</span>
                <span className="text-slate-900">{feedback.metadata.drug}</span>
              </div>
            )}
            {feedback.metadata.pharmacy && (
              <div className="flex justify-between">
                <span className="text-slate-600">Pharmacy:</span>
                <span className="text-slate-900">{feedback.metadata.pharmacy}</span>
              </div>
            )}
            {feedback.metadata.state && (
              <div className="flex justify-between">
                <span className="text-slate-600">State:</span>
                <span className="text-slate-900">{feedback.metadata.state}</span>
              </div>
            )}
            {feedback.metadata.platform && (
              <div className="flex justify-between">
                <span className="text-slate-600">Platform:</span>
                <span className="text-slate-900">{feedback.metadata.platform}</span>
              </div>
            )}
            {feedback.metadata.appVersion && (
              <div className="flex justify-between">
                <span className="text-slate-600">App Version:</span>
                <span className="font-mono text-slate-900">
                  {feedback.metadata.appVersion}
                </span>
              </div>
            )}
            {!feedback.metadata.patientId &&
              !feedback.metadata.orderId &&
              !feedback.metadata.drug &&
              !feedback.metadata.pharmacy &&
              !feedback.metadata.state &&
              !feedback.metadata.platform &&
              !feedback.metadata.appVersion && (
                <div className="text-slate-500 italic">
                  No additional metadata available
                </div>
              )}
          </div>
        </div>

        {/* Links Section */}
        {(feedback.metadata.journeyId ||
          (feedback.metadata.patientId && canLinkToPatient(feedback.source))) && (
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Quick Links
            </h3>
            <div className="space-y-2">
              {feedback.metadata.journeyId && (
                <Link
                  href={`/journey/${feedback.metadata.journeyId}`}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink size={14} />
                  View Patient Journey
                </Link>
              )}
              {feedback.metadata.patientId && canLinkToPatient(feedback.source) && (
                <a
                  href={`https://rxos.blinkhealth.com/patient/${feedback.metadata.patientId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  <ExternalLink size={14} />
                  View RxOS Patient Profile
                </a>
              )}
            </div>
          </div>
        )}

        {/* Assignment Section */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Assignment
          </h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Assigned STL:</span>
            <span className="font-medium text-slate-900">
              {feedback.assignedSTL || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
