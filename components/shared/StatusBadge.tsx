'use client';

import React from 'react';
import { Badge } from './Badge';
import type { JourneyStatus } from '@/types/journey';
import type { IssueStatus } from '@/types/feedback';

const journeyStatusConfig: Record<JourneyStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  new: { label: 'New', variant: 'info' },
  discovery: { label: 'Discovery', variant: 'info' },
  intake: { label: 'Intake', variant: 'info' },
  onboarding: { label: 'Onboarding', variant: 'warning' },
  escalated: { label: 'Escalated', variant: 'error' },
  cost_review: { label: 'Cost Review', variant: 'warning' },
  rph_review: { label: 'RPh Review', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'error' },
  transfer: { label: 'Transfer', variant: 'info' },
  dispense: { label: 'Dispense', variant: 'info' },
  dispense_review: { label: 'Dispense Review', variant: 'warning' },
  package: { label: 'Package', variant: 'info' },
  processed: { label: 'Processed', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  reprocess: { label: 'Reprocess', variant: 'warning' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  closed: { label: 'Closed', variant: 'default' },
  done: { label: 'Done', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

const issueStatusConfig: Record<IssueStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  backlog: { label: 'Backlog', variant: 'default' },
  triaged: { label: 'Triaged', variant: 'info' },
  assigned: { label: 'Assigned', variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  shipped: { label: 'Shipped', variant: 'success' },
  verified_solved: { label: 'Verified', variant: 'success' },
};

export function JourneyStatusBadge({ status }: { status: JourneyStatus }) {
  const config = journeyStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  const config = issueStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

