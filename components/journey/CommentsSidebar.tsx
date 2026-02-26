'use client';

import React from 'react';
import { X, MessageSquare } from 'lucide-react';
import { CommentThread, Comment } from './CommentThread';
import { EventPreview } from './EventPreview';
import type { JourneyEvent } from '@/types/journey';

interface CommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  event?: JourneyEvent | null;
  comments: Comment[];
  onAddComment: (eventId: string, content: string, mentions: string[]) => void;
  onAddReply: (eventId: string, parentCommentId: string, content: string, mentions: string[]) => void;
  medication?: string;
  orderId?: string;
  journeyId?: string;
  onEscalate?: (journeyId: string) => void;
  onCreateJiraTicket?: (journeyId: string, eventId?: string) => void;
}

export function CommentsSidebar({
  isOpen,
  onClose,
  eventId,
  event,
  comments,
  onAddComment,
  onAddReply,
  medication,
  orderId,
  journeyId,
  onEscalate,
  onCreateJiraTicket,
}: CommentsSidebarProps) {
  if (!isOpen || !eventId) return null;

  const isJourneyComment = eventId.startsWith('journey-');

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {!isJourneyComment && event && (
          <EventPreview event={event} medication={medication} orderId={orderId} />
        )}
        {isJourneyComment && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">Journey Notes</p>
            <p className="text-xs text-slate-500">Overall journey observations</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <CommentThread
          eventId={eventId}
          comments={comments}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
          journeyId={journeyId}
          onEscalate={onEscalate}
          onCreateJiraTicket={onCreateJiraTicket}
        />
      </div>
    </div>
  );
}
