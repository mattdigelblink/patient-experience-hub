/**
 * Patient Flow Charts
 * Mermaid diagrams representing different patient journey scenarios
 */

export interface FlowChart {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'ordering' | 'fulfillment' | 'support' | 'notifications';
  diagram: string;
  lastUpdated: string;
  owner: string;
}

export const flowCharts: FlowChart[] = [
  {
    id: 'new-patient-onboarding',
    title: 'New Patient Onboarding Flow',
    description: 'The complete journey a new patient takes from first visit to first order completion.',
    category: 'onboarding',
    lastUpdated: '2026-01-05',
    owner: 'Product Team',
    diagram: `graph TD
    A[Patient Visits Blink] --> B{Has Account?}
    B -->|No| C[Create Account]
    B -->|Yes| D[Login]
    C --> E[Verify Email]
    E --> F{Email Verified?}
    F -->|No| G[Resend Email]
    G --> E
    F -->|Yes| H[Complete Profile]
    D --> I{Login Success?}
    I -->|No| J[Forgot Password]
    J --> D
    I -->|Yes| K[Dashboard]
    H --> L{Add Insurance?}
    L -->|Yes| M[Upload Insurance Card]
    L -->|No| K
    M --> N[Verify Insurance]
    N --> O{Valid?}
    O -->|No| P[Manual Review]
    P --> M
    O -->|Yes| K
    K --> Q[Search for Medication]
    Q --> R[View Pricing]
    R --> S[Add to Cart]
    S --> T[Checkout]
    T --> U[Order Complete]
    
    style A fill:#3B82F6,color:#fff
    style U fill:#10B981,color:#fff
    style P fill:#F59E0B,color:#fff
    style J fill:#F59E0B,color:#fff`,
  },
  {
    id: 'prescription-transfer',
    title: 'Prescription Transfer Flow',
    description: 'How patients transfer existing prescriptions from another pharmacy to Blink.',
    category: 'ordering',
    lastUpdated: '2026-01-03',
    owner: 'Pharmacy Ops',
    diagram: `graph TD
    A[Patient Requests Transfer] --> B{Has Rx Info?}
    B -->|Yes| C[Enter Rx Details]
    B -->|No| D[Search Provider]
    D --> C
    C --> E[Validate Prescription]
    E --> F{Rx Valid?}
    F -->|No| G[Contact Pharmacy]
    G --> H{Found?}
    H -->|Yes| E
    H -->|No| I[Notify Patient]
    I --> J[Transfer Failed]
    F -->|Yes| K{Refills Available?}
    K -->|No| L[Contact Prescriber]
    L --> M{New Rx?}
    M -->|No| N[Needs New Rx]
    M -->|Yes| O[Process Transfer]
    K -->|Yes| O
    O --> P[Select Pharmacy]
    P --> Q[Confirm Transfer]
    Q --> R[Transfer Complete]
    
    style A fill:#3B82F6,color:#fff
    style R fill:#10B981,color:#fff
    style J fill:#EF4444,color:#fff
    style N fill:#F59E0B,color:#fff`,
  },
  {
    id: 'order-fulfillment',
    title: 'Order Fulfillment Flow',
    description: 'The backend process from order placement to delivery/pickup.',
    category: 'fulfillment',
    lastUpdated: '2026-01-04',
    owner: 'Operations',
    diagram: `graph TD
    A[Order Placed] --> B[Process Payment]
    B --> C{Payment OK?}
    C -->|No| D[Payment Failed]
    D --> E[Notify Patient]
    E --> F{Retry?}
    F -->|Yes| B
    F -->|No| G[Order Cancelled]
    C -->|Yes| H[Route to Pharmacy]
    H --> I{Pharmacy Type?}
    I -->|Blink Direct| J[Blink Fulfillment]
    I -->|Partner| K[Partner Pharmacy]
    J --> L{In Stock?}
    K --> M{In Stock?}
    L -->|No| N[Backorder]
    M -->|No| O[Find Alternate]
    L -->|Yes| P[Dispense]
    M -->|Yes| Q[Dispense]
    P --> R[Quality Check]
    Q --> R
    R --> S{Delivery Method?}
    S -->|Delivery| T[Ship Order]
    S -->|Pickup| U[Ready for Pickup]
    T --> V[Track Shipment]
    V --> W[Delivered]
    U --> X[Notify Patient]
    X --> Y[Picked Up]
    
    style A fill:#3B82F6,color:#fff
    style W fill:#10B981,color:#fff
    style Y fill:#10B981,color:#fff
    style G fill:#EF4444,color:#fff`,
  },
  {
    id: 'insurance-verification',
    title: 'Insurance Verification Flow',
    description: 'How we verify and process patient insurance information.',
    category: 'onboarding',
    lastUpdated: '2026-01-02',
    owner: 'Insurance Team',
    diagram: `graph TD
    A[Insurance Submitted] --> B{Image Quality OK?}
    B -->|No| C[Request New Image]
    C --> D{Received?}
    D -->|Yes| B
    D -->|No| E[Manual Entry]
    B -->|Yes| F[OCR Processing]
    F --> G[Extract Data]
    G --> H{Format Valid?}
    H -->|No| E
    H -->|Yes| I[Lookup Payer]
    I --> J{Payer Found?}
    J -->|No| K[Flag Unknown]
    K --> L[Manual Review]
    J -->|Yes| M[Check Eligibility]
    M --> N{Eligible?}
    N -->|No| O[Not Eligible]
    O --> P[Notify Patient]
    P --> Q[Offer Cash Price]
    N -->|Yes| R[Fetch Benefits]
    R --> S[Store Benefits]
    S --> T[Calculate Copay]
    T --> U[Insurance Verified]
    E --> L
    L --> V{Approved?}
    V -->|Yes| I
    V -->|No| P
    
    style A fill:#8B5CF6,color:#fff
    style U fill:#10B981,color:#fff
    style Q fill:#F59E0B,color:#fff`,
  },
  {
    id: 'customer-support-escalation',
    title: 'Customer Support Escalation Flow',
    description: 'How customer issues are triaged and escalated through support channels.',
    category: 'support',
    lastUpdated: '2026-01-06',
    owner: 'Customer Care',
    diagram: `graph TD
    A[Customer Contact] --> B{Channel?}
    B -->|Chat| C[Chat Bot]
    B -->|Phone| D[IVR System]
    B -->|Email| E[Email Queue]
    C --> F{Bot Resolved?}
    F -->|Yes| G[Resolved]
    F -->|No| H[Live Agent]
    D --> I{IVR Resolved?}
    I -->|Yes| J[Resolved]
    I -->|No| H
    E --> K[Agent Assigned]
    K --> H
    H --> L{Severity?}
    L -->|Low| M[Tier 1]
    L -->|Medium| N[Tier 2]
    L -->|High| O[Escalation]
    M --> P{T1 Resolved?}
    P -->|Yes| Q[Resolved]
    P -->|No| N
    N --> R{T2 Resolved?}
    R -->|Yes| S[Resolved]
    R -->|No| O
    O --> T{Type?}
    T -->|Technical| U[Engineering]
    T -->|Pharmacy| V[Pharmacy Ops]
    T -->|Billing| W[Finance]
    U --> X[Create Ticket]
    V --> X
    W --> X
    X --> Y[Track Resolution]
    Y --> Z[Resolved]
    
    style A fill:#6366F1,color:#fff
    style G fill:#10B981,color:#fff
    style J fill:#10B981,color:#fff
    style Q fill:#10B981,color:#fff
    style S fill:#10B981,color:#fff
    style Z fill:#10B981,color:#fff
    style O fill:#F59E0B,color:#fff`,
  },
  {
    id: 'notification-decision',
    title: 'Notification Decision Flow',
    description: 'Logic for determining when and how to send patient notifications.',
    category: 'notifications',
    lastUpdated: '2026-01-06',
    owner: 'Engineering',
    diagram: `graph TD
    A[Send Notification?] --> B{Channel Muted?}
    B -->|Yes| C[NO]
    B -->|No| D{User in DnD?}
    D -->|Yes| E{DnD Override?}
    E -->|No| F[NO]
    E -->|Yes| G[Check Mentions]
    D -->|No| G
    G --> H{Has @mention?}
    H -->|Yes| I{Suppressed?}
    I -->|No| J[YES]
    I -->|Yes| K[Check Pref]
    H -->|No| K
    K --> L{Channel Pref?}
    L -->|Nothing| M[NO]
    L -->|Everything| N[YES]
    L -->|Mentions Only| O{Is DM?}
    O -->|Yes| P[YES]
    O -->|No| Q{Has @mention?}
    Q -->|Yes| R[YES]
    Q -->|No| S{User Active?}
    S -->|Yes| T[NO]
    S -->|No| U{Subscribed?}
    U -->|Yes| V[YES]
    U -->|No| W[NO]
    L -->|Default| X{Global Pref?}
    X -->|All| Y[YES]
    X -->|Never| Z[NO]
    
    style A fill:#3B82F6,color:#fff
    style J fill:#10B981,color:#fff
    style N fill:#10B981,color:#fff
    style P fill:#10B981,color:#fff
    style R fill:#10B981,color:#fff
    style V fill:#10B981,color:#fff
    style Y fill:#10B981,color:#fff
    style C fill:#EF4444,color:#fff
    style F fill:#EF4444,color:#fff
    style M fill:#EF4444,color:#fff
    style T fill:#EF4444,color:#fff
    style W fill:#EF4444,color:#fff
    style Z fill:#EF4444,color:#fff`,
  },
  {
    id: 'refill-reminder',
    title: 'Refill Reminder Flow',
    description: 'Automated system for sending refill reminders to patients.',
    category: 'notifications',
    lastUpdated: '2026-01-01',
    owner: 'Growth Team',
    diagram: `graph TD
    A[Daily Refill Check] --> B[Query Due Orders]
    B --> C{Orders Found?}
    C -->|No| D[No Action]
    C -->|Yes| E[For Each Order]
    E --> F{Refills Left?}
    F -->|No| G[Flag Needs New Rx]
    G --> H[Queue Provider Outreach]
    F -->|Yes| I{Patient Opted Out?}
    I -->|Yes| J[Skip]
    I -->|No| K{Contacted Recently?}
    K -->|Yes| L[Skip]
    K -->|No| M{Preferred Channel?}
    M -->|SMS| N[Send SMS]
    M -->|Email| O[Send Email]
    M -->|Push| P[Send Push]
    M -->|None| N
    N --> Q[Log Contact]
    O --> Q
    P --> Q
    Q --> R{Response in 48h?}
    R -->|Yes| S{Order Placed?}
    S -->|Yes| T[Conversion!]
    S -->|No| U[Queue Follow-up]
    R -->|No| U
    U --> V{Max Reminders?}
    V -->|No| M
    V -->|Yes| W[Mark Inactive]
    W --> X[End Sequence]
    
    style A fill:#8B5CF6,color:#fff
    style T fill:#10B981,color:#fff
    style J fill:#94A3B8,color:#fff
    style L fill:#94A3B8,color:#fff
    style D fill:#94A3B8,color:#fff
    style X fill:#94A3B8,color:#fff
    style G fill:#F59E0B,color:#fff`,
  },
];

export const flowChartCategories = [
  { id: 'onboarding', label: 'Onboarding', color: 'bg-purple-100 text-purple-700' },
  { id: 'ordering', label: 'Ordering', color: 'bg-blue-100 text-blue-700' },
  { id: 'fulfillment', label: 'Fulfillment', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'support', label: 'Support', color: 'bg-amber-100 text-amber-700' },
  { id: 'notifications', label: 'Notifications', color: 'bg-indigo-100 text-indigo-700' },
];
