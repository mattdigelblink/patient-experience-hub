'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { PageHeader, Badge, SeverityBadge, MetricCard, ComingSoon } from '@/components/shared';
import { mockIssues } from '@/config/dummyData';
import { menuConfig } from '@/config/menu';
import { SEVERITY_CONFIG } from '@/types/feedback';
import type { Severity } from '@/types/feedback';

export default function TriagePage() {
  // Show "coming soon" if configured
  if (menuConfig.feedback.comingSoon) {
    return <ComingSoon title="Triage Queue" description="The Triage Queue is currently under development and will be available soon." />;
  }

  const [triageQueue, setTriageQueue] = useState(
    mockIssues.filter((i) => i.status === 'backlog' || i.status === 'triaged').slice(0, 5)
  );
  const [triaged, setTriaged] = useState<string[]>([]);

  const handleTriage = (issueId: string, severity: Severity) => {
    setTriaged([...triaged, issueId]);
    // In real app, this would update the backend
  };

  const triagedCount = triaged.length;
  const totalCount = triageQueue.length;
  const progress = totalCount > 0 ? (triagedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Triage"
        description="Review and prioritize new feedback issues"
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
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Pending Triage"
          value={totalCount - triagedCount}
          icon={<Clock size={24} />}
        />
        <MetricCard
          title="Triaged This Session"
          value={triagedCount}
          icon={<CheckCircle size={24} />}
          variant="success"
        />
        <MetricCard
          title="High Priority Found"
          value={triageQueue.filter((i) => i.severity === 'sev1' || i.severity === 'sev2').length}
          icon={<AlertTriangle size={24} />}
          variant="warning"
        />
      </div>

      {/* Triage Queue */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">Triage Queue</h2>
          <p className="text-sm text-slate-500">Review each issue and assign severity</p>
        </div>

        <div className="divide-y">
          {triageQueue.map((issue) => {
            const isTriaged = triaged.includes(issue.id);
            
            return (
              <div
                key={issue.id}
                className={`p-4 ${isTriaged ? 'bg-emerald-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`mt-1 p-2 rounded-full ${
                    isTriaged ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isTriaged ? <CheckCircle size={20} /> : <Clock size={20} />}
                  </div>

                  {/* Issue details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-sm text-slate-500">
                        {issue.affectedPatientCount} patients
                      </span>
                    </div>
                    <Link
                      href={`/feedback/issues/${issue.id}`}
                      className="font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                    >
                      {issue.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{issue.summary}</p>
                    
                    {/* Feedback preview */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 mb-1">Sample feedback:</p>
                      <p className="text-sm text-slate-700 italic line-clamp-2">
                        &ldquo;{issue.feedbackItems[0]?.verbatim || 'No feedback available'}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {isTriaged ? (
                      <div className="text-center">
                        <CheckCircle className="text-emerald-500 mx-auto mb-1" size={24} />
                        <p className="text-xs text-emerald-600 font-medium">Triaged</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 text-center mb-2">Set Severity</p>
                        <div className="flex gap-1">
                          {(['sev1', 'sev2', 'sev3', 'sev4', 'sev5'] as Severity[]).map((sev) => (
                            <button
                              key={sev}
                              onClick={() => handleTriage(issue.id, sev)}
                              className="px-2 py-1 text-xs font-medium rounded hover:ring-2 hover:ring-offset-1 transition-all"
                              style={{
                                backgroundColor: SEVERITY_CONFIG[sev].bgColor,
                                color: SEVERITY_CONFIG[sev].color,
                              }}
                              title={SEVERITY_CONFIG[sev].description}
                            >
                              {sev.replace('sev', 'S')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {triageQueue.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle className="text-emerald-500 mx-auto mb-3" size={48} />
            <p className="text-lg font-medium text-slate-900">All caught up!</p>
            <p className="text-slate-500">No issues pending triage</p>
          </div>
        )}
      </div>

      {/* Completion */}
      {triagedCount === totalCount && totalCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <CheckCircle className="text-emerald-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">Triage Complete!</h3>
          <p className="text-emerald-700 mb-4">
            You&apos;ve reviewed all {totalCount} issues in the queue.
          </p>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

