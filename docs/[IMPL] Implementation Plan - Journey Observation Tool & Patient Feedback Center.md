# Implementation Plan: Journey Observation Tool & Patient Feedback Center

---

## Executive Summary

This plan outlines the implementation of **two major features** into the Journey Observation Tool Next.js project:

1. **Journey Observation Tool** — A unified timeline for viewing patient journeys
2. **Patient Feedback Center** — A centralized system for managing patient feedback issues

---

## Part 1: Project Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| UI Components | `ui-tools` component library + custom components |
| Styling | Tailwind CSS + MUI (via ui-tools) |
| State Management | React Context + TanStack Query (for server state) |
| Forms | React Hook Form |
| Date Handling | date-fns (already in ui-tools) |

### Recommended Folder Structure

```
Journey Observation Tool/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Dashboard/Home
│   ├── journey/
│   │   ├── page.tsx                  # Journey list/search
│   │   ├── [journeyId]/
│   │   │   └── page.tsx              # Journey timeline view
│   │   └── live/
│   │       └── page.tsx              # Live observation mode
│   ├── feedback/
│   │   ├── page.tsx                  # Feedback center dashboard
│   │   ├── issues/
│   │   │   ├── page.tsx              # Issue list
│   │   │   └── [issueId]/
│   │   │       └── page.tsx          # Issue detail view
│   │   └── triage/
│   │       └── page.tsx              # Weekly triage view
│   ├── compliance/
│   │   └── page.tsx                  # Employee compliance dashboard
│   └── api/                          # API routes (when ready)
├── components/
│   ├── journey/                      # Journey-specific components
│   ├── feedback/                     # Feedback center components
│   ├── shared/                       # Shared custom components
│   └── layout/                       # App shell components
├── hooks/                            # Custom React hooks
├── types/                            # TypeScript interfaces
├── utils/                            # Utility functions
├── config/
│   └── dummyData.ts                  # Mock data for prototyping
└── services/                         # API service layer
```

---

## Part 2: ui-tools Component Mapping

### Components to Reuse from ui-tools

| Use Case | ui-tools Component | Purpose |
|----------|-------------------|---------|
| **Navigation** | `MenuAppBar` | Top navigation bar |
| **Data Tables** | `BlinkTable`, `BlinkTableContainer`, `BlinkTablePagination` | Feedback issue lists, compliance tables |
| **Filters** | `BlinkMultiSelectFilter`, `BlinkDateRangeFilter`, `BlinkSingleSelectFilter`, `SearchBox` | Journey & issue filtering |
| **Filter Chips** | `FilteredChips`, `NewFilterChips` | Active filter display |
| **Activity Feed** | `ActivityEvents` | **Perfect for timeline events** |
| **Notes** | `NoteInputBox` | Employee observation notes |
| **Badges/Status** | `BlinkBadge`, `HeaderStatusBadge` | Severity indicators, status tags |
| **Data Display** | `DataRow`, `ReadOnlySection` | Journey metadata display |
| **Dialogs** | `BlinkDialog` | Jira creation, confirmations |
| **Error Handling** | `BlinkErrorBoundary`, `APIResponseErrorHandler` | Error states |
| **Banners** | `BlinkMessageBanner` | Alerts, notifications |
| **Toasts** | `BlinkToast` | Success/error notifications |
| **Tooltips** | `BlinkToolTip`, `InfoTooltipIcon` | Help text |
| **Buttons** | `Button`, `ProgressButton` | Actions |
| **Icons** | Full icon library (44+ icons) | Visual indicators |
| **Theme** | `BlinkHealthThemeProvider` | Consistent theming |
| **Pagination** | `Pagination`, `NewPagination` | List navigation |
| **Tabs** | `BlinkTab` | View switching |
| **Accordions** | `WorkflowStageAccordion`, `EditableAccordion` | Expandable sections |

### Custom Components Needed

| Component | Description | Reason |
|-----------|-------------|--------|
| `TimelineEvent` | Enhanced event card for journey timeline | Needs rich media support (audio, video, chat) |
| `AudioPlayer` | Audio playback for voice broadcasts/calls | Media-specific functionality |
| `ChatTranscript` | Chat message display with full history | Specialized chat UI |
| `ScreenViewCard` | Display Mixpanel screen views/screenshots | Visual display needs |
| `SurveyResponseCard` | NPS/CSAT/DNPU display with ratings | Survey-specific formatting |
| `ErrorIndicator` | API 400/500 error highlighting | Error visualization |
| `LiveStatusIndicator` | Real-time connection status | Live mode specific |
| `SeveritySelector` | Sev-1 through Sev-5 picker | Feedback center specific |
| `IssueGroupingPanel` | AI clustering visualization | Issue grouping UI |
| `ComplianceProgressCard` | Monthly progress tracking | Compliance specific |

---

## Part 3: Feature 1 — Journey Observation Tool

### Phase 1.1: Core Infrastructure (Week 1-2)

**Tasks:**
1. Set up `BlinkHealthThemeProvider` in root layout
2. Create app shell with `MenuAppBar` navigation
3. Define TypeScript interfaces for journey data:

```typescript
// types/journey.ts
interface JourneyEvent {
  id: string;
  type: 'sms' | 'email' | 'voice_broadcast' | 'call' | 'chat' | 'screen_view' | 'survey' | 'system_log' | 'mixpanel_event';
  timestamp: string;
  content: EventContent;
  metadata: EventMetadata;
  errorIndicators?: ErrorIndicator[];
}

interface Journey {
  id: string;
  patientId: string;
  orderId?: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  category: 'successful_purchase_delivery' | 'successful_purchase_no_delivery' | 'no_purchase';
  metadata: JourneyMetadata;
  events: JourneyEvent[];
}
```

4. Create mock data generator in `config/dummyData.ts`

**ui-tools used:** `BlinkHealthThemeProvider`, `MenuAppBar`

---

### Phase 1.2: Journey List & Search (Week 2-3)

**Tasks:**
1. Build journey search page with filters
2. Implement filter controls for:
   - Journey category
   - Platform (iOS/Android/Web)
   - Drug
   - Pharmacy
   - Insurance type
   - State
   - Timeframe

**Components:**

```
JourneyListPage
├── BlinkQueueHeader (page header)
├── BlinkQueueFilterContainer
│   ├── SearchBox (patient/order search)
│   ├── BlinkMultiSelectFilter (category)
│   ├── BlinkSingleSelectFilter (platform)
│   ├── BlinkDateRangeFilter (timeframe)
│   └── FilteredChips (active filters)
├── BlinkTableContainer
│   ├── BlinkTable (journey list)
│   │   └── BlinkTableRow (each journey)
│   │       ├── BlinkBadge (status)
│   │       └── DataRow (quick metadata)
│   └── BlinkTablePagination
└── BlinkTableSkeleton (loading state)
```

**ui-tools used:** `BlinkQueueHeader`, `BlinkQueueFilterContainer`, `SearchBox`, `BlinkMultiSelectFilter`, `BlinkSingleSelectFilter`, `BlinkDateRangeFilter`, `FilteredChips`, `BlinkTable*`, `BlinkBadge`, `DataRow`

---

### Phase 1.3: Unified Timeline View (Week 3-5)

**Tasks:**
1. Build timeline view page
2. Create custom `TimelineEvent` component (extends `ActivityEvents` concept)
3. Implement event type handlers:

**Timeline Structure:**

```
JourneyTimelinePage
├── JourneyHeader
│   ├── DataRow (Order ID, Patient ID, Drug, etc.)
│   └── HeaderStatusBadge (journey status)
├── MetadataPanel
│   ├── ReadOnlySection (device, app version, insurance, state)
│   └── BlinkToolTip (field explanations)
├── TimelineContainer (custom - vertical scrolling)
│   └── TimelineEvent[] (custom component)
│       ├── EventTypeIcon (from icons library)
│       ├── EventContent (varies by type)
│       │   ├── SMSContent (message body)
│       │   ├── EmailContent (subject + body preview)
│       │   ├── VoiceBroadcastContent (AudioPlayer + transcript)
│       │   ├── CallContent (LevelAI link + AudioPlayer)
│       │   ├── ChatContent (ChatTranscript)
│       │   ├── ScreenViewContent (ScreenViewCard)
│       │   ├── SurveyContent (SurveyResponseCard)
│       │   └── SystemLogContent (error highlighting)
│       ├── ErrorIndicator (if 400/500 error)
│       └── EventMetadata (timestamp, source)
├── EmployeeNotesSection
│   ├── NoteInputBox (with guidance placeholder)
│   └── Button (Submit to Feedback Center)
└── LiveModeToggle (for live observation)
```

**Custom components to build:**
- `TimelineEvent` — Main event card wrapper
- `AudioPlayer` — For voice broadcasts and call recordings  
- `ChatTranscript` — Expandable chat history
- `ScreenViewCard` — Screenshot/screen view display
- `SurveyResponseCard` — Rating + verbatim feedback
- `ErrorIndicator` — Visual API error highlighting

**ui-tools used:** `DataRow`, `HeaderStatusBadge`, `ReadOnlySection`, `BlinkToolTip`, icons, `NoteInputBox`, `Button`

---

### Phase 1.4: Live Observation Mode (Week 5-6)

**Tasks:**
1. Create live journey observation page
2. Implement WebSocket/polling for real-time updates
3. Build escalation workflow

**Components:**
```
LiveObservationPage
├── LiveStatusIndicator (custom - connection status)
├── PatientAssignment
│   └── Button ("Observe Random Patient")
├── LiveTimeline (extends TimelineContainer)
│   ├── NewEventAnimation (visual indicator)
│   └── AutoScroll (to latest events)
├── EscalationPanel
│   ├── Button ("Report Issue")
│   └── BlinkDialog (escalation form)
└── BlinkMessageBanner (connection alerts)
```

**ui-tools used:** `Button`, `BlinkDialog`, `BlinkMessageBanner`

---

### Phase 1.5: Employee Notes Integration (Week 6-7)

**Tasks:**
1. Connect notes to Feedback Center
2. Implement note submission flow
3. Add note metadata (employee ID, timestamp, journey link)

**ui-tools used:** `NoteInputBox`, `Button`, `BlinkToast`

---

## Part 4: Feature 2 — Patient Feedback Center

### Phase 2.1: Feedback Dashboard (Week 7-8)

**Tasks:**
1. Build feedback center home dashboard
2. Create severity distribution cards
3. Implement top issues widget

**Components:**
```
FeedbackDashboardPage
├── DashboardHeader
│   └── BlinkQueueHeader
├── MetricsRow (custom - 4-card grid)
│   ├── MetricCard (Total Issues)
│   ├── MetricCard (Sev-1/Sev-2 Count)
│   ├── MetricCard (Triaged %)
│   └── MetricCard (Resolution Rate)
├── TopIssuesWidget
│   ├── BlinkTable (top 10 by volume)
│   └── IssueRow
│       ├── SeverityBadge (BlinkBadge)
│       └── TrendIndicator (custom)
├── FeedbackSourceBreakdown (custom chart)
└── RecentFeedbackFeed
    └── ActivityEvents (latest feedback items)
```

**ui-tools used:** `BlinkQueueHeader`, `BlinkTable*`, `BlinkBadge`, `ActivityEvents`

---

### Phase 2.2: Unified Feedback Feed (Week 8-9)

**Tasks:**
1. Create feedback item list with filters
2. Implement source filtering (NPS, App Store, Trustpilot, etc.)
3. Add severity filtering

**Components:**
```
FeedbackFeedPage
├── BlinkQueueFilterContainer
│   ├── SearchBox
│   ├── BlinkMultiSelectFilter (source)
│   ├── BlinkMultiSelectFilter (severity)
│   ├── BlinkSingleSelectFilter (product surface)
│   ├── BlinkDateRangeFilter
│   └── FilteredChips
├── BlinkTableContainer
│   └── BlinkTable
│       └── FeedbackRow
│           ├── SourceIcon
│           ├── RatingDisplay
│           ├── VerbatimPreview
│           ├── SeverityBadge
│           └── ThreeDotMenu (actions)
└── BlinkTablePagination
```

**ui-tools used:** All filter components, `BlinkTable*`, `BlinkBadge`, `ThreeDotMenu`

---

### Phase 2.3: Issue Grouping & Management (Week 9-11)

**Tasks:**
1. Build issue detail page
2. Implement AI clustering visualization
3. Create merge/split functionality
4. Build issue lifecycle management

**Components:**
```
IssueDetailPage
├── IssueHeader
│   ├── IssueTitleEditable
│   ├── SeveritySelector (custom dropdown)
│   ├── OwnerSelector (BlinkSingleSelectFilter)
│   └── StatusBadge (BlinkBadge)
├── IssueMetrics
│   ├── DataRow (affected patients, occurrences, etc.)
│   └── TrendChart (custom)
├── LinkedFeedbackSection
│   ├── WorkflowStageAccordion (expandable list)
│   └── FeedbackItemCard[] (raw feedback drill-down)
├── ActionPanel
│   ├── Button ("Create Jira Ticket")
│   ├── Button ("Merge with Issue")
│   ├── Button ("Split Issue")
│   └── ThreeDotMenu (more actions)
├── LifecycleTimeline
│   └── ActivityEvents (status changes)
├── JiraIntegration
│   └── BlinkDialog (Jira ticket form)
│       ├── Pre-filled description
│       ├── Board selector
│       └── Button ("Create")
└── RelatedIssuesSection
```

**Custom components:**
- `SeveritySelector` — Sev-1 through Sev-5 with color coding
- `IssueGroupingPanel` — Drag-and-drop merge UI
- `TrendChart` — Issue volume over time

**ui-tools used:** `DataRow`, `WorkflowStageAccordion`, `BlinkBadge`, `Button`, `ThreeDotMenu`, `BlinkDialog`, `ActivityEvents`, `BlinkSingleSelectFilter`

---

### Phase 2.4: Weekly Triage Workflow (Week 11-12)

**Tasks:**
1. Build triage queue view
2. Implement bulk actions
3. Create triage completion tracking

**Components:**
```
TriagePage
├── TriageHeader
│   ├── DateRangeDisplay
│   └── CompletionProgress
├── TriageQueue
│   ├── BlinkTable (issues pending triage)
│   │   └── TriageRow
│   │       ├── IssuePreview
│   │       ├── SeveritySelector
│   │       ├── OwnerSelector
│   │       └── ActionButtons
├── BulkActionBar
│   └── Button[] (Assign, Set Severity, etc.)
└── TriageSummary
    └── DataRow (triaged count, remaining, etc.)
```

**ui-tools used:** `BlinkTable*`, `Button`, `DataRow`

---

### Phase 2.5: Alerts & Notifications (Week 12-13)

**Tasks:**
1. Implement Slack alert configuration (UI only for V1)
2. Build in-app notification system
3. Create weekly summary email template

**Components:**
```
AlertConfigPage
├── AlertRules
│   └── EditableAccordion[] (each rule)
│       ├── RuleCondition (Sev-1, burst detection, etc.)
│       └── NotificationChannel (Slack, Email)
├── Button ("Add Rule")
└── BlinkToast (save confirmation)
```

**ui-tools used:** `EditableAccordion`, `Button`, `BlinkToast`

---

### Phase 2.6: Dashboards & Reporting (Week 13-14)

**Tasks:**
1. Build reporting dashboard
2. Implement key metrics:
   - Top 10 issues by volume
   - Issue trendlines
   - Time-to-detection
   - Time-to-first-action
   - Affected patients per issue
   - Issues by ownership team

**Components:**
```
ReportingDashboardPage
├── BlinkTab (weekly/monthly toggle)
├── MetricsGrid
│   └── MetricCard[] (key KPIs)
├── TopIssuesChart (custom)
├── TrendlineChart (custom)
├── TeamBreakdownTable
│   └── BlinkTable
└── ExportButton
    └── Button ("Export CSV")
```

**ui-tools used:** `BlinkTab`, `BlinkTable*`, `Button`

---

## Part 5: Employee Compliance Module

### Phase 5.1: Compliance Dashboard (Week 14-15)

**Tasks:**
1. Build compliance tracking page
2. Implement monthly progress tracking
3. Create team-level reporting

**Components:**
```
ComplianceDashboardPage
├── MonthSelector (BlinkDateFilter)
├── ComplianceOverview
│   ├── DataRow (total employees, completed %, etc.)
│   └── ProgressBar (custom)
├── TeamBreakdownTable
│   └── BlinkTable
│       └── TeamRow
│           ├── TeamName
│           ├── CompletionRate
│           └── ProgressIndicator
├── IncompleteList
│   └── BlinkTable (employees not yet completed)
└── Button ("Export Report")
```

**ui-tools used:** `BlinkDateFilter`, `DataRow`, `BlinkTable*`, `Button`

---

## Part 6: Implementation Timeline Summary

| Phase | Feature | Weeks | Key Deliverables |
|-------|---------|-------|------------------|
| 1.1 | Core Infrastructure | 1-2 | App shell, types, theme setup |
| 1.2 | Journey List | 2-3 | Search & filter, journey table |
| 1.3 | Timeline View | 3-5 | Unified timeline, all event types |
| 1.4 | Live Mode | 5-6 | Real-time observation |
| 1.5 | Notes Integration | 6-7 | Employee notes → Feedback Center |
| 2.1 | Feedback Dashboard | 7-8 | Overview metrics, top issues |
| 2.2 | Feedback Feed | 8-9 | Unified feed with filters |
| 2.3 | Issue Management | 9-11 | Grouping, merge/split, Jira |
| 2.4 | Triage Workflow | 11-12 | Weekly triage queue |
| 2.5 | Alerts | 12-13 | Notification configuration |
| 2.6 | Reporting | 13-14 | Dashboards & metrics |
| 5.1 | Compliance | 14-15 | Employee tracking |

**Total estimated timeline: 15 weeks**

---

## Part 7: Technical Dependencies

### Required Additions to `package.json`

```json
{
  "dependencies": {
    "@blinkhealth/ui-tools": "^latest",
    "@tanstack/react-query": "^5.x",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x",
    "@mui/material": "^5.x",
    "@mui/icons-material": "^5.x",
    "react-hook-form": "^7.x",
    "date-fns": "^3.x",
    "recharts": "^2.x"
  }
}
```

### Backend API Requirements (for future integration)

1. **Journey Service API**
   - `GET /journeys` — List with filters
   - `GET /journeys/:id` — Full timeline
   - `GET /journeys/live` — Live observation stream
   - `POST /journeys/:id/notes` — Submit observation note

2. **Feedback Center API**
   - `GET /feedback` — Unified feed
   - `GET /issues` — Grouped issues
   - `POST /issues/:id/jira` — Create Jira ticket
   - `PUT /issues/:id` — Update severity/owner/status
   - `POST /issues/merge` — Merge issues

3. **Compliance API**
   - `GET /compliance/monthly` — Monthly report
   - `GET /compliance/employees` — Individual status

---

## Part 8: Mock Data Strategy

For prototyping, create comprehensive mock data in `config/dummyData.ts`:

```typescript
// Example structure
export const mockJourneys: Journey[] = [
  {
    id: 'j-001',
    patientId: 'p-12345',
    orderId: 'ord-67890',
    status: 'completed',
    category: 'successful_purchase_delivery',
    metadata: {
      drug: 'Lipitor 10mg',
      pharmacy: 'CVS',
      platform: 'iOS',
      appVersion: '4.2.1',
      insurance: 'BlueCross',
      state: 'CA'
    },
    events: [
      {
        id: 'e-001',
        type: 'sms',
        timestamp: '2026-01-05T10:30:00Z',
        content: { body: 'Your prescription is ready!' },
        metadata: { source: 'twilio' }
      },
      // ... more events
    ]
  }
];

export const mockFeedbackItems: FeedbackItem[] = [...];
export const mockIssues: Issue[] = [...];
```

---

## Part 9: Next Steps

1. **Immediate**: Set up `ui-tools` as a dependency in the Journey Observation Tool project
2. **Week 1**: Implement core infrastructure and app shell
3. **Parallel**: Data team begins work on Databricks ETL tables for frontend consumption
4. **Review checkpoint**: End of Week 3 — Demo journey list and basic timeline

---

## Appendix: Key Design Decisions

### Why ui-tools?
- Consistent Blink branding and UX patterns
- Reduces development time with pre-built components
- Ensures accessibility compliance
- Easier maintenance and updates

### Why Next.js App Router?
- Server components for better performance
- Built-in API routes for future backend integration
- File-based routing matches feature structure
- Better SEO if needed for public-facing pages

### Why TanStack Query?
- Powerful caching and refetching
- Optimistic updates for better UX
- DevTools for debugging
- Works well with Next.js

---

*Document created: January 6, 2026*  
*Last updated: January 6, 2026*


