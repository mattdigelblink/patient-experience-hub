'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, MessageSquareWarning, Users, ArrowRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { MetricCard, PageHeader } from '@/components/shared';
import { mockFeedbackMetrics, mockMonthlyComplianceStats, mockJourneys, mockIssues } from '@/config/dummyData';

export default function AdminDashboard() {
  const recentJourneys = mockJourneys.slice(0, 3);
  const topIssues = mockIssues.filter(i => i.severity === 'sev1' || i.severity === 'sev2');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of patient journeys, feedback, and team compliance"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Journeys This Week"
          value={mockJourneys.length}
          change={12}
          changeLabel="vs last week"
          icon={<Eye size={24} />}
        />
        <MetricCard
          title="Open Issues"
          value={mockFeedbackMetrics.openIssues}
          change={-8}
          changeLabel="vs last week"
          icon={<MessageSquareWarning size={24} />}
        />
        <MetricCard
          title="Sev-1/Sev-2 Issues"
          value={mockFeedbackMetrics.sev1Count + mockFeedbackMetrics.sev2Count}
          icon={<AlertTriangle size={24} />}
          variant={mockFeedbackMetrics.sev1Count > 0 ? 'error' : 'warning'}
        />
        <MetricCard
          title="Team Compliance"
          value={`${mockMonthlyComplianceStats.complianceRate.toFixed(0)}%`}
          change={5}
          changeLabel="vs last month"
          icon={<Users size={24} />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Journeys */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Journeys</h2>
            <Link
              href="/journey"
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentJourneys.map((journey) => (
              <Link
                key={journey.id}
                href={`/journey/${journey.id}`}
                className="block p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{journey.metadata.drug}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Patient {journey.patientId} • {journey.metadata.pharmacy} • {journey.metadata.state}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    journey.status === 'completed' ? 'bg-green-100 text-green-700' :
                    journey.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {journey.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span>{journey.events.length} events</span>
                  <span>{journey.metadata.platform.toUpperCase()}</span>
                  <span>{new Date(journey.lastActivityTime).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* High Priority Issues */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">High Priority Issues</h2>
            <Link
              href="/feedback/issues"
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {topIssues.length > 0 ? (
            <div className="space-y-3">
              {topIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/feedback/issues/${issue.id}`}
                  className="block p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-1.5 rounded ${
                      issue.severity === 'sev1' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <AlertTriangle size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{issue.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {issue.affectedPatientCount} patients • {issue.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-slate-500 text-sm">No high priority issues</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/journey"
          className="group p-6 bg-red-600 rounded-xl text-white hover:bg-red-700 hover:shadow-lg transition-all"
        >
          <Eye size={32} className="mb-3 opacity-80" />
          <h3 className="text-lg font-semibold">Observe a Journey</h3>
          <p className="text-sm opacity-80 mt-1">Review patient experiences end-to-end</p>
          <ArrowRight className="mt-4 group-hover:translate-x-1 transition-transform" size={20} />
        </Link>

        <Link
          href="/feedback"
          className="group p-6 bg-slate-700 rounded-xl text-white hover:bg-slate-800 hover:shadow-lg transition-all"
        >
          <MessageSquareWarning size={32} className="mb-3 opacity-80" />
          <h3 className="text-lg font-semibold">Feedback Center</h3>
          <p className="text-sm opacity-80 mt-1">Triage and manage patient feedback</p>
          <ArrowRight className="mt-4 group-hover:translate-x-1 transition-transform" size={20} />
        </Link>

        <Link
          href="/compliance"
          className="group p-6 bg-slate-500 rounded-xl text-white hover:bg-slate-600 hover:shadow-lg transition-all"
        >
          <Users size={32} className="mb-3 opacity-80" />
          <h3 className="text-lg font-semibold">Team Compliance</h3>
          <p className="text-sm opacity-80 mt-1">Track monthly journey reviews</p>
          <ArrowRight className="mt-4 group-hover:translate-x-1 transition-transform" size={20} />
        </Link>
      </div>
    </div>
  );
}

