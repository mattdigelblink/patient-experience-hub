'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Users,
  MessageSquare,
  Calendar,
  GitMerge,
  Scissors,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { PageHeader, Badge, SeverityBadge, IssueStatusBadge, ComingSoon } from '@/components/shared';
import { mockIssues, mockFeedbackItems } from '@/config/dummyData';
import { menuConfig } from '@/config/menu';
import { SEVERITY_CONFIG, STATUS_CONFIG } from '@/types/feedback';
import type { Severity, IssueStatus } from '@/types/feedback';

export default function IssueDetailPage() {
  // All hooks must be called at the top level, before any conditional returns
  const params = useParams();
  const router = useRouter();
  const issueId = params.issueId as string;

  const issue = useMemo(() => {
    return mockIssues.find((i) => i.id === issueId);
  }, [issueId]);

  const [selectedSeverity, setSelectedSeverity] = useState<Severity>(issue?.severity || 'sev3');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue?.status || 'backlog');
  const [isCreatingJira, setIsCreatingJira] = useState(false);

  // Show "coming soon" if configured (after hooks)
  if (menuConfig.feedback.comingSoon) {
    return <ComingSoon title="Issue Details" description="The Issue Details page is currently under development and will be available soon." />;
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500 mb-4">Issue not found</p>
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

  const relatedFeedback = mockFeedbackItems.filter((f) => f.issueId === issue.id);

  const handleCreateJira = async () => {
    setIsCreatingJira(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCreatingJira(false);
    // In real app, this would create a Jira ticket
    alert('Jira ticket created! (simulated)');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/feedback/issues"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to issues
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <SeverityBadge severity={issue.severity} />
              <IssueStatusBadge status={issue.status} />
              {issue.jiraTicketId && (
                <a
                  href={issue.jiraTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {issue.jiraTicketId}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
            <p className="text-slate-500 mt-2">{issue.summary}</p>
          </div>

          <div className="flex gap-2">
            {!issue.jiraTicketId && (
              <button
                onClick={handleCreateJira}
                disabled={isCreatingJira}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isCreatingJira ? 'Creating...' : 'Create Jira Ticket'}
              </button>
            )}
            <button className="px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <GitMerge size={16} />
              Merge
            </button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Scissors size={16} />
              Split
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Users size={16} />
              <span className="text-sm">Affected Patients</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{issue.affectedPatientCount}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <MessageSquare size={16} />
              <span className="text-sm">Feedback Items</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{issue.feedbackItemCount}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">First Seen</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {new Date(issue.firstOccurrence).toLocaleDateString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">Last Seen</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {new Date(issue.lastOccurrence).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Linked Feedback ({relatedFeedback.length})
          </h2>

          <div className="space-y-4">
            {relatedFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">{feedback.source.replace('_', ' ')}</Badge>
                  {feedback.rating && (
                    <span className={`text-sm font-medium ${
                      feedback.rating <= 2 ? 'text-red-600' : 
                      feedback.rating <= 3 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {feedback.rating}/{feedback.maxRating}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(feedback.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{feedback.verbatim}</p>
                {feedback.metadata.patientId && (
                  <p className="text-xs text-slate-500 mt-2">
                    Patient: {feedback.metadata.patientId}
                    {feedback.metadata.state && ` • ${feedback.metadata.state}`}
                    {feedback.metadata.platform && ` • ${feedback.metadata.platform}`}
                  </p>
                )}
              </div>
            ))}

            {relatedFeedback.length === 0 && (
              <p className="text-center text-slate-500 py-8">No feedback items linked yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Issue Controls */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Issue Details</h2>

            {/* Severity Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as Severity)}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} - {config.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as IssueStatus)}
                className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Owner</label>
              <div className="p-3 bg-slate-50 rounded-lg">
                {issue.ownerEmail ? (
                  <div>
                    <p className="font-medium text-slate-900">{issue.ownerEmail.split('@')[0]}</p>
                    <p className="text-xs text-slate-500">{issue.ownerTeam}</p>
                  </div>
                ) : (
                  <p className="text-slate-500">Unassigned</p>
                )}
              </div>
            </div>

            {/* Product Surface */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Surface</label>
              <Badge variant="info">{issue.productSurface}</Badge>
            </div>
          </div>

          {/* AI Confidence */}
          {issue.aiConfidenceScore && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Grouping</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${issue.aiConfidenceScore * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {Math.round(issue.aiConfidenceScore * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Confidence in feedback grouping</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

