'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, X, AlertTriangle, User, Calendar, MessageSquare } from 'lucide-react';
import { PageHeader, DataTable, Badge } from '@/components/shared';
import { generateMockJourneys, mockEmployees } from '@/config/dummyData';
import type { Journey } from '@/types/journey';

// Mock escalation data - in real app, this would come from an API
interface Escalation {
  id: string;
  journeyId: string;
  journey: Journey;
  escalatedBy: {
    id: string;
    name: string;
    email: string;
    team: string;
  };
  escalatedAt: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_review' | 'resolved' | 'closed';
}

// Generate mock escalations - employees can escalate any journey
const allJourneys = generateMockJourneys(50);
// Select a mix of journeys to escalate (prioritize those with issues, but include various statuses)
const journeysToEscalate = allJourneys
  .filter(j => ['escalated', 'on_hold', 'rejected', 'cancelled', 'new', 'intake'].includes(j.status))
  .slice(0, 15)
  .concat(allJourneys.filter(j => !['escalated', 'on_hold', 'rejected', 'cancelled', 'new', 'intake'].includes(j.status)).slice(0, 5));

// Create mock escalations
const mockEscalations: Escalation[] = journeysToEscalate.map((journey, index) => {
  const employee = mockEmployees[index % mockEmployees.length];
  const priorities: Escalation['priority'][] = ['high', 'medium', 'low'];
  const statuses: Escalation['status'][] = ['open', 'in_review', 'resolved', 'closed'];
  
  const reasons = [
    'Patient experiencing multiple technical issues with app',
    'Insurance verification failing repeatedly',
    'Delivery delay with no communication to patient',
    'Patient frustrated with pricing changes',
    'Authentication errors preventing order completion',
    'Prescription transfer issues',
    'Payment processing failures',
    'Patient unable to reach customer support',
    'Medication availability concerns',
    'Prior authorization complications',
  ];

  return {
    id: `esc-${journey.id}`,
    journeyId: journey.id,
    journey,
    escalatedBy: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      team: employee.team,
    },
    escalatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    reason: reasons[index % reasons.length],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };
});

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'default',
} as const;

const statusColors = {
  open: 'error',
  in_review: 'warning',
  resolved: 'success',
  closed: 'default',
} as const;

export default function EscalationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Escalation['priority'][]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Escalation['status'][]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredEscalations = useMemo(() => {
    return mockEscalations.filter((escalation) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          escalation.journey.patientId.toLowerCase().includes(searchLower) ||
          escalation.journey.orderId?.toLowerCase().includes(searchLower) ||
          escalation.journey.metadata.drug.toLowerCase().includes(searchLower) ||
          escalation.reason.toLowerCase().includes(searchLower) ||
          escalation.escalatedBy.name.toLowerCase().includes(searchLower) ||
          escalation.escalatedBy.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (selectedPriority.length > 0 && !selectedPriority.includes(escalation.priority)) {
        return false;
      }

      // Status filter
      if (selectedStatus.length > 0 && !selectedStatus.includes(escalation.status)) {
        return false;
      }

      // Team filter
      if (selectedTeam.length > 0 && !selectedTeam.includes(escalation.escalatedBy.team)) {
        return false;
      }

      return true;
    });
  }, [search, selectedPriority, selectedStatus, selectedTeam]);

  const activeFilterCount = selectedPriority.length + selectedStatus.length + selectedTeam.length;

  const clearFilters = () => {
    setSelectedPriority([]);
    setSelectedStatus([]);
    setSelectedTeam([]);
  };

  const columns = [
    {
      key: 'journey',
      header: 'Journey',
      render: (escalation: Escalation) => (
        <div>
          <Link
            href={`/journey/${escalation.journeyId}`}
            className="font-medium text-red-600 hover:text-red-700 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {escalation.journey.metadata.drug}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient: {escalation.journey.patientInfo.initials} • {escalation.journey.patientId}
          </p>
          {escalation.journey.orderId && (
            <p className="text-xs text-slate-500">
              Order: {escalation.journey.orderId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (escalation: Escalation) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-900 line-clamp-2">{escalation.reason}</p>
        </div>
      ),
    },
    {
      key: 'escalatedBy',
      header: 'Escalated By',
      render: (escalation: Escalation) => (
        <div>
          <p className="font-medium text-slate-900">{escalation.escalatedBy.name}</p>
          <p className="text-xs text-slate-500">{escalation.escalatedBy.team}</p>
          <p className="text-xs text-slate-400">{escalation.escalatedBy.email}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (escalation: Escalation) => (
        <Badge variant={priorityColors[escalation.priority]}>
          {escalation.priority.charAt(0).toUpperCase() + escalation.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (escalation: Escalation) => (
        <Badge variant={statusColors[escalation.status]}>
          {escalation.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: 'escalatedAt',
      header: 'Escalated',
      render: (escalation: Escalation) => (
        <div>
          <p className="text-sm text-slate-900">
            {new Date(escalation.escalatedAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(escalation.escalatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      key: 'metadata',
      header: 'Details',
      render: (escalation: Escalation) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>{escalation.journey.metadata.pharmacy}</p>
          <p>{escalation.journey.metadata.state}</p>
          <p className="capitalize">{escalation.journey.metadata.platform}</p>
        </div>
      ),
    },
  ];

  const openCount = filteredEscalations.filter(e => e.status === 'open').length;
  const inReviewCount = filteredEscalations.filter(e => e.status === 'in_review').length;
  const resolvedCount = filteredEscalations.filter(e => e.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalations"
        description="Backlog of journeys escalated by employees for review"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Escalations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{filteredEscalations.length}</p>
            </div>
            <AlertTriangle className="text-slate-400" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{openCount}</p>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Review</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{inReviewCount}</p>
            </div>
            <MessageSquare className="text-amber-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
            </div>
            <Calendar className="text-emerald-500" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by patient ID, order ID, drug, reason, or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <div className="space-y-2">
                  {(['high', 'medium', 'low'] as Escalation['priority'][]).map((priority) => (
                    <label key={priority} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPriority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriority([...selectedPriority, priority]);
                          } else {
                            setSelectedPriority(selectedPriority.filter((p) => p !== priority));
                          }
                        }}
                        className="rounded text-red-500 focus:ring-red-500"
                      />
                      <span className="capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="space-y-2">
                  {(['open', 'in_review', 'resolved', 'closed'] as Escalation['status'][]).map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, status]);
                          } else {
                            setSelectedStatus(selectedStatus.filter((s) => s !== status));
                          }
                        }}
                        className="rounded text-red-500 focus:ring-red-500"
                      />
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Team Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Escalated By Team</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Array.from(new Set(mockEscalations.map(e => e.escalatedBy.team))).map((team) => (
                    <label key={team} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTeam.includes(team)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeam([...selectedTeam, team]);
                          } else {
                            setSelectedTeam(selectedTeam.filter((t) => t !== team));
                          }
                        }}
                        className="rounded text-red-500 focus:ring-red-500"
                      />
                      {team}
                    </label>
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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredEscalations.length} of {mockEscalations.length} escalations
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredEscalations}
        keyExtractor={(escalation) => escalation.id}
        onRowClick={(escalation) => router.push(`/journey/${escalation.journeyId}`)}
        emptyMessage="No escalations match your filters"
      />
    </div>
  );
}
