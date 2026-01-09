'use client';

import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Download,
  ChevronDown,
} from 'lucide-react';
import { PageHeader, MetricCard, DataTable, Badge } from '@/components/shared';
import {
  mockMonthlyComplianceStats,
  mockTeamComplianceStats,
  mockAssignments,
  mockEmployees,
} from '@/config/dummyData';
import type { JourneyAssignment, Employee } from '@/types/compliance';

export default function ComplianceDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  
  const stats = mockMonthlyComplianceStats;
  const teamStats = mockTeamComplianceStats;

  const employeeRecords = mockEmployees.map((emp) => {
    const assignment = mockAssignments.find((a) => a.employeeId === emp.id);
    return {
      employee: emp,
      assignment,
      status: assignment?.status || 'pending',
    };
  });

  const teamColumns = [
    {
      key: 'team',
      header: 'Team',
      render: (row: typeof teamStats[0]) => (
        <span className="font-medium text-slate-900">{row.team}</span>
      ),
    },
    {
      key: 'employees',
      header: 'Employees',
      render: (row: typeof teamStats[0]) => row.totalEmployees,
    },
    {
      key: 'completed',
      header: 'Completed',
      render: (row: typeof teamStats[0]) => (
        <span className={row.completedCount === row.totalEmployees ? 'text-emerald-600 font-medium' : ''}>
          {row.completedCount}/{row.totalEmployees}
        </span>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      render: (row: typeof teamStats[0]) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.complianceRate === 100 ? 'bg-emerald-500' :
                row.complianceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${row.complianceRate}%` }}
            />
          </div>
          <span className="text-sm font-medium">{row.complianceRate}%</span>
        </div>
      ),
    },
    {
      key: 'avgTime',
      header: 'Avg Time',
      render: (row: typeof teamStats[0]) => (
        row.avgTimeSpentSeconds > 0
          ? `${Math.round(row.avgTimeSpentSeconds / 60)} min`
          : '—'
      ),
    },
  ];

  const employeeColumns = [
    {
      key: 'name',
      header: 'Employee',
      render: (row: typeof employeeRecords[0]) => (
        <div>
          <p className="font-medium text-slate-900">{row.employee.name}</p>
          <p className="text-xs text-slate-500">{row.employee.email}</p>
        </div>
      ),
    },
    {
      key: 'team',
      header: 'Team',
      render: (row: typeof employeeRecords[0]) => row.employee.team,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: typeof employeeRecords[0]) => {
        const statusConfig = {
          completed: { variant: 'success' as const, label: 'Completed' },
          in_progress: { variant: 'warning' as const, label: 'In Progress' },
          pending: { variant: 'default' as const, label: 'Pending' },
          skipped: { variant: 'error' as const, label: 'Skipped' },
        };
        const config = statusConfig[row.status as keyof typeof statusConfig];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'completedAt',
      header: 'Completed',
      render: (row: typeof employeeRecords[0]) => (
        row.assignment?.completedAt
          ? new Date(row.assignment.completedAt).toLocaleDateString()
          : '—'
      ),
    },
    {
      key: 'timeSpent',
      header: 'Time Spent',
      render: (row: typeof employeeRecords[0]) => (
        row.assignment?.timeSpentSeconds
          ? `${Math.round(row.assignment.timeSpentSeconds / 60)} min`
          : '—'
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Compliance"
        description="Monthly journey observation tracking"
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="2026-01">January 2026</option>
                <option value="2025-12">December 2025</option>
                <option value="2025-11">November 2025</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={16} />
              Export Report
            </button>
          </div>
        }
      />

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users size={24} />}
        />
        <MetricCard
          title="Completed"
          value={stats.completedCount}
          icon={<CheckCircle size={24} />}
          variant="success"
        />
        <MetricCard
          title="In Progress"
          value={stats.inProgressCount}
          icon={<Clock size={24} />}
        />
        <MetricCard
          title="Compliance Rate"
          value={`${stats.complianceRate.toFixed(0)}%`}
          icon={<Calendar size={24} />}
          variant={stats.complianceRate >= 80 ? 'success' : stats.complianceRate >= 50 ? 'warning' : 'error'}
        />
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Progress</h2>
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {stats.completedCount} of {stats.totalEmployees} employees completed
            </span>
            <span className="text-sm font-bold text-emerald-600">
              {stats.complianceRate.toFixed(0)}%
            </span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.complianceRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Start of month</span>
            <span>{stats.complianceRate >= 100 ? 'Complete!' : `${stats.pendingCount} remaining`}</span>
          </div>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Team Breakdown</h2>
        <DataTable
          columns={teamColumns}
          data={teamStats}
          keyExtractor={(row) => row.team}
          emptyMessage="No team data available"
        />
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Employee Status</h2>
          <div className="flex items-center gap-2">
            <Badge variant="success">{stats.completedCount} Completed</Badge>
            <Badge variant="warning">{stats.inProgressCount} In Progress</Badge>
            <Badge variant="default">{stats.pendingCount} Pending</Badge>
          </div>
        </div>
        <DataTable
          columns={employeeColumns}
          data={employeeRecords}
          keyExtractor={(row) => row.employee.id}
          emptyMessage="No employees found"
        />
      </div>

      {/* Alert for Low Compliance */}
      {stats.complianceRate < 50 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-amber-900">Low Compliance Alert</h3>
              <p className="text-amber-700 mt-1">
                Only {stats.complianceRate.toFixed(0)}% of employees have completed their monthly journey review.
                Consider sending reminders to ensure 100% compliance by end of month.
              </p>
              <button className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
                Send Reminder Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

