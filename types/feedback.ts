/**
 * Patient Feedback Center - Core Types
 */

// ============================================
// Severity & Status
// ============================================

export type Severity = 'sev1' | 'sev2' | 'sev3' | 'sev4' | 'sev5';

export type IssueStatus =
  | 'backlog'
  | 'triaged'
  | 'assigned'
  | 'in_progress'
  | 'shipped'
  | 'verified_solved';

export type FeedbackSource =
  | 'nps'
  | 'csat'
  | 'app_store'
  | 'google_play'
  | 'trustpilot'
  | 'dnpu'
  | 'agent_flagged_call'
  | 'agent_flagged_chat'
  | 'agent_flagged_email'
  | 'employee_observation';

export type ProductSurface =
  | 'app'
  | 'web'
  | 'fulfillment'
  | 'pricing'
  | 'insurance'
  | 'pharmacy'
  | 'customer_service'
  | 'other';

// ============================================
// Feedback Item
// ============================================

export interface FeedbackItemMetadata {
  patientId?: string;
  orderId?: string;
  drug?: string;
  pharmacy?: string;
  platform?: string;
  appVersion?: string;
  state?: string;
  journeyId?: string; // Link to Journey Observation Tool
  program?: string; // Program name (only for surveys, calls, etc - not public reviews)
}

export interface FeedbackItem {
  id: string;
  source: FeedbackSource;
  rating?: number;
  maxRating?: number;
  verbatim: string;
  timestamp: string;
  metadata: FeedbackItemMetadata;
  issueId?: string; // Grouped issue
  isProcessed: boolean;
  agentId?: string; // For agent-flagged items
  assignedSTL?: string; // Assigned STL (Service Team Lead)
}

// ============================================
// Issue (Grouped Feedback)
// ============================================

export interface Issue {
  id: string;
  title: string;
  summary: string;
  severity: Severity;
  status: IssueStatus;
  productSurface: ProductSurface;
  
  // Ownership
  ownerId?: string;
  ownerEmail?: string;
  ownerTeam?: string;
  
  // Linked items
  feedbackItems: FeedbackItem[];
  feedbackItemCount: number;
  affectedPatientCount: number;
  
  // Jira integration
  jiraTicketId?: string;
  jiraTicketUrl?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  firstOccurrence: string;
  lastOccurrence: string;
  
  // AI-suggested grouping
  aiConfidenceScore?: number;
  suggestedSimilarIssues?: string[];
}

// ============================================
// Issue History
// ============================================

export type IssueActionType =
  | 'created'
  | 'severity_changed'
  | 'status_changed'
  | 'owner_assigned'
  | 'jira_created'
  | 'feedback_added'
  | 'issues_merged'
  | 'issue_split'
  | 'comment_added';

export interface IssueHistoryEntry {
  id: string;
  issueId: string;
  actionType: IssueActionType;
  actorId: string;
  actorEmail: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  comment?: string;
}

// ============================================
// Triage
// ============================================

export interface TriageSession {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalIssues: number;
  triagedCount: number;
  isComplete: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface TriageDecision {
  issueId: string;
  decision: 'backlog' | 'investigate' | 'create_jira' | 'known_not_fixing' | 'duplicate';
  severity: Severity;
  ownerId?: string;
  notes?: string;
  decidedBy: string;
  decidedAt: string;
}

// ============================================
// Alerts
// ============================================

export type AlertType =
  | 'new_sev1'
  | 'new_sev2'
  | 'burst_detection'
  | 'trend_spike'
  | 'weekly_summary';

export interface AlertRule {
  id: string;
  type: AlertType;
  isEnabled: boolean;
  threshold?: number; // For burst detection
  slackChannel?: string;
  emailRecipients?: string[];
  createdBy: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  type: AlertType;
  message: string;
  issueId?: string;
  isRead: boolean;
  createdAt: string;
  sentToSlack: boolean;
  sentToEmail: boolean;
}

// ============================================
// Dashboard Metrics
// ============================================

export interface FeedbackMetrics {
  totalIssues: number;
  openIssues: number;
  sev1Count: number;
  sev2Count: number;
  triagedPercentage: number;
  resolutionRate: number;
  avgTimeToDetection: number; // hours
  avgTimeToFirstAction: number; // hours
}

export interface IssueTrend {
  date: string;
  newIssues: number;
  resolvedIssues: number;
  totalOpen: number;
}

export interface TopIssue {
  issue: Issue;
  trend: 'increasing' | 'stable' | 'decreasing';
  weekOverWeekChange: number; // percentage
}

// ============================================
// Filters
// ============================================

export interface FeedbackFilters {
  search?: string;
  source?: FeedbackSource[];
  severity?: Severity[];
  status?: IssueStatus[];
  productSurface?: ProductSurface[];
  ownerTeam?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// Jira Integration
// ============================================

export interface JiraBoard {
  id: string;
  name: string;
  projectKey: string;
}

export interface JiraTicketCreate {
  issueId: string;
  boardId: string;
  title: string;
  description: string;
  priority: string;
  labels?: string[];
}

// ============================================
// Severity Helpers
// ============================================

export const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  sev1: {
    label: 'Sev-1',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    description: 'Patient cannot access care / system down',
  },
  sev2: {
    label: 'Sev-2',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    description: 'Major product functionality blocked',
  },
  sev3: {
    label: 'Sev-3',
    color: '#CA8A04',
    bgColor: '#FEF9C3',
    description: 'Noticeable friction affecting many patients',
  },
  sev4: {
    label: 'Sev-4',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    description: 'Minor friction or isolated feedback',
  },
  sev5: {
    label: 'Sev-5',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    description: 'Cosmetic or informative suggestion',
  },
};

export const STATUS_CONFIG: Record<IssueStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  backlog: {
    label: 'Backlog',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
  triaged: {
    label: 'Triaged',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  assigned: {
    label: 'Assigned',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  in_progress: {
    label: 'In Progress',
    color: '#CA8A04',
    bgColor: '#FEF9C3',
  },
  shipped: {
    label: 'Shipped',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  verified_solved: {
    label: 'Verified',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
};

