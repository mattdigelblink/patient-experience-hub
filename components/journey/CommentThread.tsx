'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, AtSign, X, User, AlertTriangle, ExternalLink } from 'lucide-react';

export interface Comment {
  id: string;
  eventId: string;
  author: string;
  authorEmail?: string;
  content: string;
  mentions?: string[]; // Array of mentioned employee names
  createdAt: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  eventId: string;
  comments: Comment[];
  onAddComment: (eventId: string, content: string, mentions: string[]) => void;
  onAddReply: (eventId: string, parentCommentId: string, content: string, mentions: string[]) => void;
  currentUser?: { name: string; email?: string };
  journeyId?: string;
  onEscalate?: (journeyId: string) => void;
  onCreateJiraTicket?: (journeyId: string, eventId?: string) => void;
}

const EMPLOYEES = [
  { name: 'Debapriyo Ganguly', location: 'Office', isOrganizer: true },
  { name: 'Abhijit Pati', location: 'Office' },
  { name: 'Abhishek Shah', location: 'Office' },
  { name: 'Aravindan Gunathilagaraj', location: 'Office' },
  { name: 'John Matthew', location: 'Office' },
  { name: 'Manikandan Varadaraj', location: 'Office' },
  { name: 'Dharmik Ghelani', location: 'Home' },
  { name: 'Dinesh Makhija', location: 'Home' },
  { name: 'Drew Holland', location: 'Home' },
  { name: 'Felix Chan', location: 'Home' },
  { name: 'Ganeshan Jayaraman', location: 'Home' },
  { name: 'Jason Carlisle', location: 'Home' },
  { name: 'Jeff Harmon', location: 'Home' },
  { name: 'Jordan Tom', location: 'Home' },
  { name: 'Krishna Krishnamurthy', location: 'Home' },
  { name: 'Naveen Nattala', location: 'Home' },
  { name: 'Naveenan Arjunan', location: 'Home' },
  { name: 'Owais Khan', location: 'Home' },
  { name: 'Prasanna Begamudra Rangavittal', location: 'Home' },
  { name: 'Selvam Velmurugan', location: 'Home' },
  { name: 'Suryaveer Singh', location: 'Home' },
  { name: 'Tricia Bailey', location: 'Home' },
  { name: 'Vishal Prabhukhanolkar', location: 'Home' },
  { name: 'Rhoda Rahaii', location: 'Home/NYC' },
  { name: 'Naresh Moorthy', location: 'San Jose, CA' },
  { name: 'Yulee Jun', location: '' },
  { name: 'Christopher Loh', location: '' },
  { name: 'David Lee', location: '' },
  { name: 'Deepashree Mohan', location: '' },
  { name: 'Derrick Pace', location: '' },
  { name: 'Francisco Muñoz', location: '' },
  { name: 'Hema Balachandran', location: '' },
  { name: 'Jacqueline Rupert', location: '' },
  { name: 'Khushru Irani', location: '' },
  { name: 'Kurban Slonim', location: '' },
  { name: 'Matthew Digel', location: '' },
  { name: 'Miriam Prathiba', location: '' },
  { name: 'Rahul Raheja', location: '' },
];

function CommentInput({
  onSubmit,
  placeholder = 'Add a comment...',
  autoFocus = false,
}: {
  onSubmit: (content: string, mentions: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  const findMentionTrigger = (text: string, cursorPos: number) => {
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) return null;
    
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) return null;
    
    return {
      start: lastAtIndex,
      query: textAfterAt,
    };
  };

  const extractMentions = (text: string): string[] => {
    const mentions: string[] = [];
    const mentionRegex = /@([^\s@]+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1];
      if (EMPLOYEES.some(emp => emp.name === mentionedName)) {
        mentions.push(mentionedName);
      }
    }
    return Array.from(new Set(mentions)); // Remove duplicates
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setText(value);

    const mention = findMentionTrigger(value, cursorPos);
    if (mention) {
      setShowMentions(true);
      setMentionQuery(mention.query);
      setMentionIndex(mention.start);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const filteredEmployees = EMPLOYEES.filter(emp =>
    emp.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleMentionSelect = (employee: typeof EMPLOYEES[0]) => {
    if (mentionIndex === -1) return;
    
    const beforeMention = text.substring(0, mentionIndex);
    const afterMention = text.substring(mentionIndex + 1 + mentionQuery.length);
    const newText = `${beforeMention}@${employee.name} ${afterMention}`;
    
    setText(newText);
    setShowMentions(false);
    setMentionQuery('');
    setMentionIndex(-1);
    
    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionIndex + employee.name.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredEmployees.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < filteredEmployees.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleMentionSelect(filteredEmployees[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault();
      const mentions = extractMentions(text);
      onSubmit(text.trim(), mentions);
      setText('');
    }
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            rows={2}
            style={{ minHeight: '44px' }}
          />
          
          {showMentions && filteredEmployees.length > 0 && (
            <div
              ref={mentionsRef}
              className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
            >
              {filteredEmployees.map((employee, index) => (
                <button
                  key={employee.name}
                  onClick={() => handleMentionSelect(employee)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${
                    index === selectedMentionIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AtSign size={12} className="text-blue-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {employee.name}
                        {employee.isOrganizer && (
                          <span className="ml-1 text-xs text-slate-500">(Organizer)</span>
                        )}
                      </p>
                      {employee.location && (
                        <p className="text-xs text-slate-500 truncate">{employee.location}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {text.trim() && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  const mentions = extractMentions(text);
                  onSubmit(text.trim(), mentions);
                  setText('');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Send size={12} />
                Comment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  currentUser,
}: {
  comment: Comment;
  onReply: (parentId: string, content: string, mentions: string[]) => void;
  currentUser?: { name: string; email?: string };
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [expanded, setExpanded] = useState(true);
  
  // Get all replies for this comment (including nested)
  const getAllReplies = (comment: Comment): Comment[] => {
    if (!comment.replies || comment.replies.length === 0) return [];
    return comment.replies.flatMap(reply => [reply, ...getAllReplies(reply)]);
  };
  
  const totalReplies = getAllReplies(comment).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderContent = (content: string) => {
    // Highlight @ mentions
    const parts = content.split(/(@[^\s@]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const name = part.substring(1);
        return (
          <span key={index} className="text-blue-600 font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="pb-4">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-900">{comment.author}</span>
            <span className="text-xs text-slate-500">{formatTime(comment.createdAt)}</span>
          </div>
          <div className="text-sm text-slate-700 mb-2">
            {renderContent(comment.content)}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Reply
            </button>
            {totalReplies > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {expanded ? 'Hide' : 'Show'} {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
          
          {showReplyInput && (
            <div className="mt-3">
              <CommentInput
                onSubmit={(content, mentions) => {
                  onReply(comment.id, content, mentions);
                  setShowReplyInput(false);
                }}
                placeholder="Reply to this comment..."
                autoFocus
              />
            </div>
          )}
          
          {expanded && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-slate-200 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  eventId,
  comments,
  onAddComment,
  onAddReply,
  currentUser = { name: 'You', email: 'you@blinkhealth.com' },
  journeyId,
  onEscalate,
  onCreateJiraTicket,
}: CommentThreadProps) {
  // Filter for top-level comments (comments that are not replies to other comments)
  // Top-level comments are those that match the eventId and are not nested as replies
  const threadComments = comments.filter(c => {
    if (c.eventId !== eventId) return false;
    // Check if this comment is a reply to another comment
    const isReply = comments.some(parent => 
      parent.replies?.some(reply => reply.id === c.id)
    );
    return !isReply;
  });

  const handleReply = (parentId: string, content: string, mentions: string[]) => {
    onAddReply(eventId, parentId, content, mentions);
  };

  const handleEscalate = () => {
    if (journeyId && onEscalate) {
      onEscalate(journeyId);
    }
  };

  const handleCreateJiraTicket = () => {
    if (journeyId && onCreateJiraTicket) {
      const isJourneyComment = eventId.startsWith('journey-');
      onCreateJiraTicket(journeyId, isJourneyComment ? undefined : eventId);
    }
  };

  const showActionButtons = !!journeyId;

  return (
    <div className="space-y-4">
      {threadComments.length > 0 ? (
        <div className="space-y-4">
          {threadComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">No comments yet</p>
      )}
      
      <div className="pt-2 border-t border-slate-200">
        <CommentInput
          onSubmit={(content, mentions) => onAddComment(eventId, content, mentions)}
          placeholder="Add a comment..."
          autoFocus={threadComments.length === 0}
        />
        
        {/* Action Buttons */}
        {showActionButtons && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleEscalate}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <AlertTriangle size={14} />
                Escalate
              </button>
              <button
                onClick={handleCreateJiraTicket}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={14} />
                Create Jira Ticket
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-medium">Escalate:</span> For problems that aren&apos;t quick fixes by one team and will require multiple teams to fix or require a new feature/BRD thinking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
