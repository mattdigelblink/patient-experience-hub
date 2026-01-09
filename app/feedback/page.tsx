'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  MessageSquareWarning,
  Smartphone,
  Globe,
  Package,
} from 'lucide-react';
import { PageHeader, MetricCard, Badge, SeverityBadge, ComingSoon } from '@/components/shared';
import {
  mockFeedbackMetrics,
  mockIssues,
  mockFeedbackItems,
  mockIssueTrends,
} from '@/config/dummyData';
import { menuConfig } from '@/config/menu';

const sourceIcons: Record<string, React.ReactNode> = {
  nps: <MessageSquareWarning size={14} />,
  app_store: <Smartphone size={14} />,
  google_play: <Smartphone size={14} />,
  trustpilot: <Globe size={14} />,
  csat: <CheckCircle size={14} />,
};

export default function FeedbackDashboard() {
  // Show "coming soon" if configured
  if (menuConfig.feedback.comingSoon) {
    return <ComingSoon title="Feedback Center" description="The Patient Feedback Center is currently under development and will be available soon." />;
  }

  const recentFeedback = mockFeedbackItems.slice(0, 5);
  const topIssues = mockIssues.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Feedback Center"
        description="Centralized view of patient feedback and issues"
        actions={
          <Link
            href="/feedback/triage"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Start Triage
          </Link>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Open Issues"
          value={mockFeedbackMetrics.openIssues}
          icon={<Package size={24} />}
        />
        <MetricCard
          title="Sev-1 / Sev-2"
          value={mockFeedbackMetrics.sev1Count + mockFeedbackMetrics.sev2Count}
          icon={<AlertTriangle size={24} />}
          variant={mockFeedbackMetrics.sev1Count > 0 ? 'error' : 'warning'}
        />
        <MetricCard
          title="Triaged Rate"
          value={`${mockFeedbackMetrics.triagedPercentage}%`}
          change={5}
          changeLabel="this week"
          icon={<CheckCircle size={24} />}
        />
        <MetricCard
          title="Avg Time to Detection"
          value={`${mockFeedbackMetrics.avgTimeToDetection}h`}
          change={-12}
          changeLabel="improvement"
          icon={<Clock size={24} />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Issues */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Issues by Volume</h2>
            <Link
              href="/feedback/issues"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {topIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/feedback/issues/${issue.id}`}
                className="block p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={issue.severity} />
                      <Badge variant={issue.status === 'in_progress' ? 'warning' : 'default'}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium text-slate-900 truncate">{issue.title}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{issue.summary}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-slate-900">{issue.affectedPatientCount}</p>
                    <p className="text-xs text-slate-500">patients</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span>{issue.feedbackItemCount} feedback items</span>
                  <span>Owner: {issue.ownerTeam || 'Unassigned'}</span>
                  {issue.jiraTicketId && (
                    <span className="text-emerald-600">{issue.jiraTicketId}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Feedback</h2>
          </div>

          <div className="space-y-4">
            {recentFeedback.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 rounded bg-white">
                    {sourceIcons[item.source] || <MessageSquareWarning size={14} />}
                  </span>
                  <Badge variant="default">{item.source.replace('_', ' ')}</Badge>
                  {item.rating && (
                    <span className={`text-xs font-medium ${
                      item.rating <= 2 ? 'text-red-600' : 
                      item.rating <= 3 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {item.rating}/{item.maxRating}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 line-clamp-2">{item.verbatim}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Issue Trends (7 Days)</h2>
        <div className="h-64 flex items-end gap-2">
          {mockIssueTrends.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-1">
                <div
                  className="w-full bg-emerald-200 rounded-t"
                  style={{ height: `${day.resolvedIssues * 15}px` }}
                  title={`${day.resolvedIssues} resolved`}
                />
                <div
                  className="w-full bg-red-200 rounded-b"
                  style={{ height: `${day.newIssues * 15}px` }}
                  title={`${day.newIssues} new`}
                />
              </div>
              <span className="text-xs text-slate-500">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded" />
            <span className="text-slate-600">New Issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-200 rounded" />
            <span className="text-slate-600">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

