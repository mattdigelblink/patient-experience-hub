'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { PageHeader, DataTable, Badge, SeverityBadge, IssueStatusBadge, ComingSoon } from '@/components/shared';
import { mockIssues } from '@/config/dummyData';
import { menuConfig } from '@/config/menu';
import type { Issue, Severity, IssueStatus } from '@/types/feedback';

const severityOptions: Severity[] = ['sev1', 'sev2', 'sev3', 'sev4', 'sev5'];
const statusOptions: IssueStatus[] = ['backlog', 'triaged', 'assigned', 'in_progress', 'shipped', 'verified_solved'];

export default function IssuesListPage() {
  // All hooks must be called at the top level, before any conditional returns
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<IssueStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredIssues = useMemo(() => {
    return mockIssues.filter((issue) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          issue.title.toLowerCase().includes(searchLower) ||
          issue.summary.toLowerCase().includes(searchLower) ||
          issue.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (selectedSeverities.length > 0 && !selectedSeverities.includes(issue.severity)) {
        return false;
      }

      if (selectedStatuses.length > 0 && !selectedStatuses.includes(issue.status)) {
        return false;
      }

      return true;
    });
  }, [search, selectedSeverities, selectedStatuses]);

  // Show "coming soon" if configured (after hooks)
  if (menuConfig.feedback.comingSoon) {
    return <ComingSoon title="Broken Windows" description="The Broken Windows page is currently under development and will be available soon." />;
  }

  const activeFilterCount = selectedSeverities.length + selectedStatuses.length;

  const clearFilters = () => {
    setSelectedSeverities([]);
    setSelectedStatuses([]);
  };

  const columns = [
    {
      key: 'severity',
      header: 'Severity',
      width: '100px',
      render: (issue: Issue) => <SeverityBadge severity={issue.severity} />,
    },
    {
      key: 'title',
      header: 'Issue',
      render: (issue: Issue) => (
        <div>
          <p className="font-medium text-slate-900">{issue.title}</p>
          <p className="text-sm text-slate-500 truncate max-w-md">{issue.summary}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (issue: Issue) => <IssueStatusBadge status={issue.status} />,
    },
    {
      key: 'affected',
      header: 'Affected',
      width: '100px',
      render: (issue: Issue) => (
        <div className="text-center">
          <p className="font-bold text-slate-900">{issue.affectedPatientCount}</p>
          <p className="text-xs text-slate-500">patients</p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '120px',
      render: (issue: Issue) => (
        <span className="text-sm text-slate-600">{issue.ownerTeam || 'Unassigned'}</span>
      ),
    },
    {
      key: 'jira',
      header: 'Jira',
      width: '100px',
      render: (issue: Issue) =>
        issue.jiraTicketId ? (
          <a
            href={issue.jiraTicketUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {issue.jiraTicketId}
          </a>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      key: 'lastOccurrence',
      header: 'Last Seen',
      width: '120px',
      render: (issue: Issue) => (
        <span className="text-sm text-slate-500">
          {new Date(issue.lastOccurrence).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broken Windows"
        description="All grouped feedback issues"
        actions={
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Create Issue
          </button>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((sev) => (
                    <button
                      key={sev}
                      onClick={() => {
                        if (selectedSeverities.includes(sev)) {
                          setSelectedSeverities(selectedSeverities.filter((s) => s !== sev));
                        } else {
                          setSelectedSeverities([...selectedSeverities, sev]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedSeverities.includes(sev)
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sev.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (selectedStatuses.includes(status)) {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                        } else {
                          setSelectedStatuses([...selectedStatuses, status]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedStatuses.includes(status)
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredIssues.length} of {mockIssues.length} issues
        </p>
      </div>

      <DataTable
        columns={columns}
        data={filteredIssues}
        keyExtractor={(issue) => issue.id}
        onRowClick={(issue) => router.push(`/feedback/issues/${issue.id}`)}
        emptyMessage="No issues match your filters"
      />
    </div>
  );
}

