/**
 * Comprehensive Mock Data for Journey Observation Tool
 * This will be replaced with backend API calls once the frontend is finalized
 */

import {
  Journey,
  JourneyEvent,
  EmployeeNote,
  RxOSActivityContent,
  PriorAuthActivityContent,
  Program,
  JourneyStep,
} from '@/types/journey';

import {
  FeedbackItem,
  Issue,
  FeedbackMetrics,
  TopIssue,
  IssueTrend,
} from '@/types/feedback';

import {
  Employee,
  JourneyAssignment,
  MonthlyComplianceStats,
  TeamComplianceStats,
} from '@/types/compliance';

// ============================================
// Reference Data
// ============================================

export const DRUGS = [
  'Lipitor 10mg',
  'Metformin 500mg',
  'Lisinopril 20mg',
  'Atorvastatin 40mg',
  'Omeprazole 20mg',
  'Amlodipine 5mg',
  'Gabapentin 300mg',
  'Sertraline 50mg',
  'Losartan 50mg',
  'Levothyroxine 50mcg',
];

export const PHARMACIES = [
  'CVS',
  'Walgreens',
  'Rite Aid',
  'Walmart Pharmacy',
  'Costco Pharmacy',
  'Blink Direct',
];

export const STATES = [
  'CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
];

export const TEAMS = [
  'Product',
  'Engineering',
  'Operations',
  'Customer Care',
  'Data',
  'Design',
  'Marketing',
  'Finance',
];

export const PROGRAMS: Program[] = [
  'Tarsus',
  'Bausch and Lomb',
  'ARS',
  'Shield',
];

export const JOURNEY_STEPS: JourneyStep[] = [
  'initial_comm_delivered',
  'patient_acted',
  'created_account',
  'added_med_to_cart',
  'purchased',
  'shipped',
  'delivered',
  'refill_price_published',
  'refill_comm_delivered',
];

export const STATUSES: Journey['status'][] = [
  'new',
  'discovery',
  'intake',
  'onboarding',
  'escalated',
  'cost_review',
  'rph_review',
  'rejected',
  'transfer',
  'dispense',
  'dispense_review',
  'package',
  'processed',
  'completed',
  'reprocess',
  'on_hold',
  'closed',
  'done',
  'cancelled',
];

// ============================================
// Mock Journeys
// ============================================

// RxOS Activity Events - Backend/Pharmacy Events
export const mockRxOSActivityEvents: JourneyEvent[] = [
  {
    id: 'rxos-001',
    type: 'rxos_activity',
    timestamp: '2026-01-05T08:00:00Z',
    content: {
      activityType: 'prescription_received',
      description: 'Prescription received from provider via e-prescribe',
      actor: 'System',
      prescriptionId: 'rx-12345',
      details: { provider: 'Dr. Jane Smith', npi: '1234567890' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-002',
    type: 'rxos_activity',
    timestamp: '2026-01-05T08:15:00Z',
    content: {
      activityType: 'pharmacist_review',
      description: 'Prescription queued for pharmacist review',
      actor: 'System',
      prescriptionId: 'rx-12345',
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-003',
    type: 'rxos_activity',
    timestamp: '2026-01-05T09:30:00Z',
    content: {
      activityType: 'pharmacist_action',
      description: 'Prescription approved by pharmacist',
      actor: 'PharmD_Johnson',
      prescriptionId: 'rx-12345',
      details: { action: 'approved', notes: 'Verified dosage appropriate' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-004',
    type: 'rxos_activity',
    timestamp: '2026-01-05T09:45:00Z',
    content: {
      activityType: 'price_published',
      description: 'Patient price published and ready for checkout',
      actor: 'PricingEngine',
      orderId: 'ord-67890',
      details: { cashPrice: 12.99, insurancePrice: null, finalPrice: 12.99 },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-005',
    type: 'rxos_activity',
    timestamp: '2026-01-05T10:37:30Z',
    content: {
      activityType: 'order_created',
      description: 'Order placed by patient',
      actor: 'System',
      orderId: 'ord-67890',
      details: { paymentMethod: 'card_ending_4242', total: 12.99 },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-006',
    type: 'rxos_activity',
    timestamp: '2026-01-05T10:40:00Z',
    content: {
      activityType: 'fulfillment_started',
      description: 'Order sent to fulfillment queue',
      actor: 'FulfillmentBot',
      orderId: 'ord-67890',
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-007',
    type: 'rxos_activity',
    timestamp: '2026-01-05T11:00:00Z',
    content: {
      activityType: 'insurance_billed',
      description: 'Claim submitted to insurance',
      actor: 'ClaimsProcessor',
      orderId: 'ord-67890',
      details: { claimId: 'CLM-789', payer: 'BlueCross BlueShield' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-008',
    type: 'rxos_activity',
    timestamp: '2026-01-05T11:30:00Z',
    content: {
      activityType: 'fulfillment_completed',
      description: 'Order fulfilled and ready for shipment',
      actor: 'FulfillmentBot',
      orderId: 'ord-67890',
      details: { fillLocation: 'Blink Direct - Phoenix' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-009',
    type: 'rxos_activity',
    timestamp: '2026-01-05T12:00:00Z',
    content: {
      activityType: 'shipment_created',
      description: 'Shipping label created',
      actor: 'System',
      orderId: 'ord-67890',
      details: { carrier: 'USPS', trackingNumber: '9400111899223...' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-010',
    type: 'rxos_activity',
    timestamp: '2026-01-05T14:00:00Z',
    content: {
      activityType: 'shipment_picked_up',
      description: 'Package picked up by carrier',
      actor: 'System',
      orderId: 'ord-67890',
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-011',
    type: 'rxos_activity',
    timestamp: '2026-01-05T16:00:00Z',
    content: {
      activityType: 'shipment_in_transit',
      description: 'Package in transit',
      actor: 'System',
      orderId: 'ord-67890',
      details: { location: 'Phoenix Distribution Center' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-012',
    type: 'rxos_activity',
    timestamp: '2026-01-05T18:00:00Z',
    content: {
      activityType: 'shipment_delivered',
      description: 'Package delivered to patient',
      actor: 'System',
      orderId: 'ord-67890',
      details: { deliveredTo: 'Front Door', signedBy: 'Resident' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
];

// Prior Authorization Activity Events
export const mockPriorAuthActivityEvents: JourneyEvent[] = [
  {
    id: 'pa-001',
    type: 'prior_auth_activity',
    timestamp: '2026-01-05T08:30:00Z',
    content: {
      activityType: 'pa_initiated',
      description: 'Prior authorization required for Lipitor 10mg',
      insurerName: 'Aetna',
      paNumber: 'PA-2026-001234',
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
  {
    id: 'pa-002',
    type: 'prior_auth_activity',
    timestamp: '2026-01-05T08:45:00Z',
    content: {
      activityType: 'pa_submitted',
      description: 'Prior authorization submitted to Aetna',
      insurerName: 'Aetna',
      paNumber: 'PA-2026-001234',
      actor: 'PharmacyTech_Sarah',
      details: { diagnosis: 'Hyperlipidemia', requestedQty: '30 tablets' },
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
  {
    id: 'pa-003',
    type: 'prior_auth_activity',
    timestamp: '2026-01-05T14:00:00Z',
    content: {
      activityType: 'pa_pending_review',
      description: 'PA under review by insurance medical director',
      insurerName: 'Aetna',
      paNumber: 'PA-2026-001234',
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
  {
    id: 'pa-004',
    type: 'prior_auth_activity',
    timestamp: '2026-01-06T10:30:00Z',
    content: {
      activityType: 'pa_approved',
      description: 'Prior authorization approved for 12 months',
      insurerName: 'Aetna',
      paNumber: 'PA-2026-001234',
      expirationDate: '2027-01-06',
      details: { approvedQty: '30 tablets/month', authorizationPeriod: '12 months' },
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
];

// Prior Auth Events with denial scenario for Journey 2
export const mockPriorAuthActivityEventsJ2: JourneyEvent[] = [
  {
    id: 'pa-j2-001',
    type: 'prior_auth_activity',
    timestamp: '2026-01-04T07:30:00Z',
    content: {
      activityType: 'pa_initiated',
      description: 'Prior authorization required for refill',
      insurerName: 'UnitedHealthcare',
      paNumber: 'PA-2026-005678',
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
  {
    id: 'pa-j2-002',
    type: 'prior_auth_activity',
    timestamp: '2026-01-04T07:45:00Z',
    content: {
      activityType: 'pa_submitted',
      description: 'Prior authorization request submitted',
      insurerName: 'UnitedHealthcare',
      paNumber: 'PA-2026-005678',
      actor: 'System',
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
  {
    id: 'pa-j2-003',
    type: 'prior_auth_activity',
    timestamp: '2026-01-04T08:30:00Z',
    content: {
      activityType: 'pa_additional_info_requested',
      description: 'Insurance requested additional clinical documentation',
      insurerName: 'UnitedHealthcare',
      paNumber: 'PA-2026-005678',
      reason: 'Please provide recent lab results (within 90 days)',
    } as PriorAuthActivityContent,
    metadata: { source: 'covermymeds' },
  },
];

export const mockJourneyEvents: JourneyEvent[] = [
  {
    id: 'evt-001',
    type: 'sms',
    timestamp: '2026-01-05T10:30:00Z',
    content: {
      body: 'Hi! Your prescription for Lipitor 10mg is ready to order. Tap here to get started: https://bfrx.co/abc123',
      direction: 'outbound',
    },
    metadata: { source: 'twilio' },
  },
  {
    id: 'evt-002',
    type: 'screen_view',
    timestamp: '2026-01-05T10:32:15Z',
    content: {
      screenName: 'Home Screen',
      sessionId: 'sess-12345',
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-003',
    type: 'screen_view',
    timestamp: '2026-01-05T10:32:45Z',
    content: {
      screenName: 'Prescription Details',
      sessionId: 'sess-12345',
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-004',
    type: 'mixpanel_event',
    timestamp: '2026-01-05T10:33:00Z',
    content: {
      eventName: 'Add to Cart Clicked',
      properties: { drug: 'Lipitor 10mg', price: 12.99 },
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-005',
    type: 'screen_view',
    timestamp: '2026-01-05T10:33:30Z',
    content: {
      screenName: 'Insurance Verification',
      sessionId: 'sess-12345',
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-006',
    type: 'system_log',
    timestamp: '2026-01-05T10:33:45Z',
    content: {
      message: 'Insurance verification failed - card image unclear',
      statusCode: 400,
      endpoint: '/api/insurance/verify',
      requestId: 'req-abc123',
    },
    metadata: { source: 'api_logs' },
    errorIndicators: [
      {
        type: 'validation_error',
        statusCode: 400,
        message: 'Insurance card image unclear',
        severity: 'warning',
      },
    ],
  },
  {
    id: 'evt-007',
    type: 'screen_view',
    timestamp: '2026-01-05T10:34:00Z',
    content: {
      screenName: 'Insurance Card Upload',
      sessionId: 'sess-12345',
    },
    metadata: { source: 'mixpanel' },
  },
  // Chat - Patient asks a question via live chat
  {
    id: 'evt-007b',
    type: 'chat',
    timestamp: '2026-01-05T10:34:30Z',
    content: {
      messages: [
        {
          id: 'msg-1a',
          sender: 'bot',
          message: 'Hi! How can I help you today?',
          timestamp: '2026-01-05T10:34:30Z',
        },
        {
          id: 'msg-2a',
          sender: 'patient',
          message: 'My insurance card photo keeps failing. What format do you need?',
          timestamp: '2026-01-05T10:34:45Z',
        },
        {
          id: 'msg-3a',
          sender: 'agent',
          senderName: 'Lisa R.',
          message: 'Hi! Make sure your card is on a flat surface with good lighting, and the entire card is visible. JPG or PNG formats work best.',
          timestamp: '2026-01-05T10:35:00Z',
        },
        {
          id: 'msg-4a',
          sender: 'patient',
          message: 'Got it, trying again now. Thanks!',
          timestamp: '2026-01-05T10:35:10Z',
        },
      ],
      agentName: 'Lisa R.',
      resolved: true,
    },
    metadata: { source: 'intercom' },
  },
  {
    id: 'evt-008',
    type: 'mixpanel_event',
    timestamp: '2026-01-05T10:35:30Z',
    content: {
      eventName: 'Insurance Card Uploaded',
      properties: { attempt: 2 },
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-009',
    type: 'screen_view',
    timestamp: '2026-01-05T10:36:00Z',
    content: {
      screenName: 'Checkout',
      sessionId: 'sess-12345',
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-010',
    type: 'mixpanel_event',
    timestamp: '2026-01-05T10:37:00Z',
    content: {
      eventName: 'Order Placed',
      properties: { orderId: 'ord-67890', total: 12.99 },
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-011',
    type: 'email',
    timestamp: '2026-01-05T10:37:30Z',
    content: {
      subject: 'Order Confirmation - Lipitor 10mg',
      body: 'Thank you for your order! Your prescription will be ready for pickup at CVS within 2 hours.',
      preview: 'Thank you for your order! Your prescription will be ready...',
      direction: 'outbound',
      from: 'orders@blinkhealth.com',
    },
    metadata: { source: 'sendgrid' },
  },
  // Voice Broadcast - Automated call reminder
  {
    id: 'evt-011b',
    type: 'voice_broadcast',
    timestamp: '2026-01-05T13:00:00Z',
    content: {
      transcript: 'Hello, this is Blink Health with an important message about your prescription. Your Lipitor order has been shipped and is on its way. You can track your delivery in the Blink Health app. If you have questions, call us at 1-800-BLINK-RX. Thank you for choosing Blink Health.',
      duration: 22,
      audioUrl: 'https://example.com/audio/shipment-notification.mp3',
    },
    metadata: { source: 'twilio_voice' },
  },
  {
    id: 'evt-012',
    type: 'sms',
    timestamp: '2026-01-05T14:15:00Z',
    content: {
      body: 'Great news! Your Lipitor 10mg is ready for pickup at CVS. Show this text at the pharmacy counter.',
      direction: 'outbound',
    },
    metadata: { source: 'twilio' },
  },
  // Patient SMS reply
  {
    id: 'evt-012b',
    type: 'sms',
    timestamp: '2026-01-05T14:20:00Z',
    content: {
      body: 'Thanks! On my way now.',
      direction: 'inbound',
      phoneNumber: '+1 (555) 123-4567',
    },
    metadata: { source: 'twilio' },
  },
  // Call - Patient called with a question
  {
    id: 'evt-012c',
    type: 'call',
    timestamp: '2026-01-05T15:30:00Z',
    content: {
      transcript: 'Agent: Thank you for calling Blink Health. This is Jennifer, how can I help you?\nPatient: Hi, I just picked up my Lipitor but I wanted to confirm the dosage instructions.\nAgent: Of course! Let me pull up your prescription. I see you have Lipitor 10mg. The standard dosage is one tablet daily, preferably in the evening. Did your pharmacist go over this with you?\nPatient: They did, but I wanted to double-check since I\'m also on other medications.\nAgent: That\'s very responsible. I can see from your profile you\'re also on Metformin. These medications are commonly prescribed together and should be safe, but I always recommend discussing with your doctor if you have concerns.\nPatient: Perfect, thank you so much for confirming.\nAgent: You\'re welcome! Is there anything else I can help with today?\nPatient: No, that\'s all. Thanks!',
      duration: 180,
      direction: 'inbound',
      agentName: 'Jennifer K.',
      summary: 'Patient called to confirm Lipitor dosage instructions and ask about drug interactions with other medications.',
      levelAiUrl: 'https://app.levelai.com/calls/lipitor-123',
    },
    metadata: { source: 'level_ai' },
  },
  // Inbound email from patient
  {
    id: 'evt-012d',
    type: 'email',
    timestamp: '2026-01-05T16:00:00Z',
    content: {
      subject: 'Re: Order Confirmation - Lipitor 10mg',
      body: 'Hi,\n\nI picked up my prescription today. Quick question - can I take this with food or should it be on an empty stomach?\n\nThanks,\nJohn',
      preview: 'I picked up my prescription today. Quick question...',
      direction: 'inbound',
      from: 'john.smith@email.com',
      to: 'support@blinkrx.com',
    },
    metadata: { source: 'sendgrid' },
  },
  {
    id: 'evt-013',
    type: 'survey',
    timestamp: '2026-01-05T18:00:00Z',
    content: {
      surveyType: 'nps',
      rating: 9,
      maxRating: 10,
      verbatim: 'Easy process once I figured out the insurance upload. Would recommend!',
      question: 'How likely are you to recommend Blink Health to a friend?',
      additionalQuestions: [
        {
          question: 'How easy was it to place your order?',
          answer: 4,
          type: 'rating',
          maxRating: 5,
        },
        {
          question: 'How satisfied were you with the delivery speed?',
          answer: 5,
          type: 'rating',
          maxRating: 5,
        },
      ],
    },
    metadata: { source: 'delighted' },
  },
];

// RxOS Activity Events for Journey 2 (refill)
export const mockRxOSActivityEventsJ2: JourneyEvent[] = [
  {
    id: 'rxos-j2-001',
    type: 'rxos_activity',
    timestamp: '2026-01-04T07:00:00Z',
    content: {
      activityType: 'refill_reminder_sent',
      description: 'Automated refill reminder triggered',
      actor: 'RefillEngine',
      prescriptionId: 'rx-78901',
      details: { daysUntilEmpty: 5, lastFillDate: '2025-12-05' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-002',
    type: 'rxos_activity',
    timestamp: '2026-01-04T08:00:00Z',
    content: {
      activityType: 'price_published',
      description: 'Refill price published for patient',
      actor: 'PricingEngine',
      orderId: 'ord-78901',
      prescriptionId: 'rx-78901',
      details: { cashPrice: 8.99, insurancePrice: 4.50, finalPrice: 4.50, payer: 'Aetna' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-003',
    type: 'rxos_activity',
    timestamp: '2026-01-04T09:21:00Z',
    content: {
      activityType: 'order_created',
      description: 'Refill order placed by patient',
      actor: 'System',
      orderId: 'ord-78901',
      details: { paymentMethod: 'card_ending_1234', total: 4.50, isRefill: true },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-004',
    type: 'rxos_activity',
    timestamp: '2026-01-04T09:25:00Z',
    content: {
      activityType: 'insurance_billed',
      description: 'Claim submitted to Aetna',
      actor: 'ClaimsProcessor',
      orderId: 'ord-78901',
      details: { claimId: 'CLM-456', payer: 'Aetna', copay: 4.50 },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-005',
    type: 'rxos_activity',
    timestamp: '2026-01-04T09:30:00Z',
    content: {
      activityType: 'pharmacist_review',
      description: 'Refill queued for pharmacist verification',
      actor: 'System',
      prescriptionId: 'rx-78901',
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-006',
    type: 'rxos_activity',
    timestamp: '2026-01-04T10:00:00Z',
    content: {
      activityType: 'pharmacist_action',
      description: 'Refill verified and approved',
      actor: 'PharmD_Williams',
      prescriptionId: 'rx-78901',
      details: { action: 'approved', refillNumber: 3 },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-007',
    type: 'rxos_activity',
    timestamp: '2026-01-04T10:15:00Z',
    content: {
      activityType: 'fulfillment_started',
      description: 'Order sent to Walgreens for fulfillment',
      actor: 'FulfillmentRouter',
      orderId: 'ord-78901',
      details: { pharmacy: 'Walgreens', storeId: 'WAL-10001-NY' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-008',
    type: 'rxos_activity',
    timestamp: '2026-01-04T11:00:00Z',
    content: {
      activityType: 'fulfillment_completed',
      description: 'Prescription filled and ready for pickup',
      actor: 'System',
      orderId: 'ord-78901',
      details: { fillLocation: 'Walgreens #10001', lotNumber: 'MET-2026-0104' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
  {
    id: 'rxos-j2-009',
    type: 'rxos_activity',
    timestamp: '2026-01-04T16:00:00Z',
    content: {
      activityType: 'order_updated',
      description: 'Order marked as picked up by patient',
      actor: 'System',
      orderId: 'ord-78901',
      details: { status: 'completed', pickupTime: '2026-01-04T16:00:00Z' },
    } as RxOSActivityContent,
    metadata: { source: 'rxos' },
  },
];

export const mockJourneyEventsWithError: JourneyEvent[] = [
  {
    id: 'evt-e001',
    type: 'sms',
    timestamp: '2026-01-04T09:00:00Z',
    content: {
      body: 'Time to refill your Metformin 500mg! Tap here: https://bfrx.co/def456',
      direction: 'outbound',
    },
    metadata: { source: 'twilio' },
  },
  {
    id: 'evt-e002',
    type: 'screen_view',
    timestamp: '2026-01-04T09:05:00Z',
    content: {
      screenName: 'Login Screen',
      sessionId: 'sess-error-1',
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-e003',
    type: 'system_log',
    timestamp: '2026-01-04T09:05:30Z',
    content: {
      message: 'Authentication failed - session expired',
      statusCode: 401,
      endpoint: '/api/auth/refresh',
      requestId: 'req-err-001',
    },
    metadata: { source: 'api_logs' },
    errorIndicators: [
      {
        type: 'api_error',
        statusCode: 401,
        message: 'Session expired, unable to refresh token',
        severity: 'error',
      },
    ],
  },
  {
    id: 'evt-e004',
    type: 'screen_view',
    timestamp: '2026-01-04T09:05:35Z',
    content: {
      screenName: 'Login Screen',
      sessionId: 'sess-error-1',
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-e005',
    type: 'system_log',
    timestamp: '2026-01-04T09:06:00Z',
    content: {
      message: 'Login attempt failed - incorrect password',
      statusCode: 401,
      endpoint: '/api/auth/login',
    },
    metadata: { source: 'api_logs' },
    errorIndicators: [
      {
        type: 'validation_error',
        statusCode: 401,
        message: 'Invalid credentials',
        severity: 'warning',
      },
    ],
  },
  // Mixpanel event for login
  {
    id: 'evt-e005b',
    type: 'mixpanel_event',
    timestamp: '2026-01-04T09:06:30Z',
    content: {
      eventName: 'Login Failed',
      properties: { reason: 'invalid_credentials', attempt: 2 },
    },
    metadata: { source: 'mixpanel' },
  },
  // Negative NPS survey
  {
    id: 'evt-e005c',
    type: 'survey',
    timestamp: '2026-01-04T09:30:00Z',
    content: {
      surveyType: 'nps',
      rating: 3,
      maxRating: 10,
      verbatim: 'Very frustrating experience. Could not log in and had to reset password multiple times.',
      question: 'How likely are you to recommend Blink Health to a friend?',
    },
    metadata: { source: 'delighted' },
  },
  {
    id: 'evt-e006',
    type: 'chat',
    timestamp: '2026-01-04T09:10:00Z',
    content: {
      messages: [
        {
          id: 'msg-1',
          sender: 'bot',
          message: 'Hi there! How can I help you today?',
          timestamp: '2026-01-04T09:10:00Z',
        },
        {
          id: 'msg-2',
          sender: 'patient',
          message: 'I can\'t log in. It keeps saying something went wrong.',
          timestamp: '2026-01-04T09:10:30Z',
        },
        {
          id: 'msg-3',
          sender: 'bot',
          message: 'I\'m sorry to hear that. Let me connect you with a team member.',
          timestamp: '2026-01-04T09:10:45Z',
        },
        {
          id: 'msg-4',
          sender: 'agent',
          senderName: 'Sarah M.',
          message: 'Hi! I can see there was an issue with your session. Let me help you reset your password.',
          timestamp: '2026-01-04T09:12:00Z',
        },
        {
          id: 'msg-5',
          sender: 'patient',
          message: 'Thank you! That worked.',
          timestamp: '2026-01-04T09:15:00Z',
        },
      ],
      agentName: 'Sarah M.',
      resolved: true,
    },
    metadata: { source: 'intercom' },
  },
  // Mixpanel event for successful login after password reset
  {
    id: 'evt-e006b',
    type: 'mixpanel_event',
    timestamp: '2026-01-04T09:16:00Z',
    content: {
      eventName: 'Login Success',
      properties: { method: 'password_reset', platform: 'android' },
    },
    metadata: { source: 'mixpanel' },
  },
  // Screen view after login
  {
    id: 'evt-e006c',
    type: 'screen_view',
    timestamp: '2026-01-04T09:16:30Z',
    content: {
      screenName: 'Refill Confirmation',
      sessionId: 'sess-error-1',
    },
    metadata: { source: 'mixpanel' },
  },
  // Mixpanel event for adding to cart
  {
    id: 'evt-e006d',
    type: 'mixpanel_event',
    timestamp: '2026-01-04T09:17:00Z',
    content: {
      eventName: 'Refill Added to Cart',
      properties: { drug: 'Metformin 500mg', price: 4.50, isRefill: true },
    },
    metadata: { source: 'mixpanel' },
  },
  // Order placed event
  {
    id: 'evt-e006e',
    type: 'mixpanel_event',
    timestamp: '2026-01-04T09:20:00Z',
    content: {
      eventName: 'Order Placed',
      properties: { orderId: 'ord-78901', total: 4.50, isRefill: true },
    },
    metadata: { source: 'mixpanel' },
  },
  {
    id: 'evt-e007',
    type: 'call',
    timestamp: '2026-01-04T09:20:00Z',
    content: {
      transcript: 'Agent: Thank you for calling Blink Health. How can I assist you?\nPatient: I was having trouble logging in but the chat helped me.\nAgent: Great! Is there anything else I can help with?\nPatient: No, that\'s all. Thanks!',
      duration: 45,
      direction: 'inbound',
      agentName: 'Mike T.',
      summary: 'Follow-up call after chat support. Issue resolved.',
    },
    metadata: { source: 'level_ai' },
  },
  // Order confirmation email
  {
    id: 'evt-e007b',
    type: 'email',
    timestamp: '2026-01-04T09:21:30Z',
    content: {
      subject: 'Your Metformin 500mg Refill is Confirmed',
      body: 'Your refill order has been placed!\n\nOrder Details:\n- Metformin 500mg (90 tablets)\n- Price: $4.50 (with Aetna)\n- Pickup Location: Walgreens, 456 Broadway, New York, NY\n\nYou\'ll receive a notification when your prescription is ready for pickup.',
      preview: 'Your refill order has been placed! Order Details...',
      direction: 'outbound',
      from: 'orders@blinkrx.com',
      to: 'maria.j@email.com',
    },
    metadata: { source: 'sendgrid' },
  },
  // Voice broadcast when ready for pickup
  {
    id: 'evt-e007c',
    type: 'voice_broadcast',
    timestamp: '2026-01-04T11:05:00Z',
    content: {
      transcript: 'Hello, this is Blink Health. Your Metformin prescription is now ready for pickup at Walgreens on Broadway. Please bring your ID when you pick up your medication. Thank you for using Blink Health.',
      duration: 18,
      audioUrl: 'https://example.com/audio/pickup-ready.mp3',
    },
    metadata: { source: 'twilio_voice' },
  },
  // SMS pickup ready notification
  {
    id: 'evt-e007d',
    type: 'sms',
    timestamp: '2026-01-04T11:10:00Z',
    content: {
      body: 'Your Metformin refill is ready for pickup at Walgreens (456 Broadway). Show your ID at the pharmacy counter.',
      direction: 'outbound',
    },
    metadata: { source: 'twilio' },
  },
  // Patient reply
  {
    id: 'evt-e007e',
    type: 'sms',
    timestamp: '2026-01-04T14:30:00Z',
    content: {
      body: 'Thanks, will pick it up after work!',
      direction: 'inbound',
      phoneNumber: '+1 (555) 987-6543',
    },
    metadata: { source: 'twilio' },
  },
  {
    id: 'evt-e008',
    type: 'survey',
    timestamp: '2026-01-04T10:00:00Z',
    content: {
      surveyType: 'csat',
      rating: 4,
      maxRating: 5,
      verbatim: 'The login issue was frustrating but support was helpful.',
      question: 'How satisfied were you with your experience?',
      additionalQuestions: [
        {
          question: 'Was your issue resolved?',
          answer: 'Yes, completely',
          type: 'multiple_choice',
        },
        {
          question: 'How helpful was the support agent?',
          answer: 5,
          type: 'rating',
          maxRating: 5,
        },
      ],
    },
    metadata: { source: 'delighted' },
  },
];

export const mockJourneys: Journey[] = [
  {
    id: 'j-001',
    patientId: 'p-12345',
    orderId: '6952973',
    rxosOrderUrl: 'https://rxos.blinkhealth.com/orders/6952973',
    status: 'completed',
    category: 'successful_purchase_delivery',
    journeyType: 'first_fill',
    programs: ['Tarsus'],
    metadata: {
      drug: 'Lipitor 10mg',
      pharmacy: 'CVS',
      platform: 'ios',
      appVersion: '4.2.1',
      deviceType: 'iPhone 14 Pro',
      insurance: 'BlueCross BlueShield',
      insuranceType: 'commercial',
      state: 'CA',
      zipCode: '94102',
    },
    patientInfo: {
      initials: 'J***n S****h',
      patientId: '4199227',
      accountId: '5772527186755116219',
      dob: '1985-03-15',
      gender: 'M',
      phoneNumber: '9785551234',
      initialRxReceivedDate: '2026-01-04T14:30:00Z',
      totalFillsPurchased: 3,
      medications: ['Lipitor 10mg'],
    },
    milestones: {
      initialCommDelivered: '2026-01-05T10:30:00Z',
      patientActed: '2026-01-05T10:32:15Z',
      createdAccount: '2026-01-05T10:32:45Z',
      addedMedToCart: '2026-01-05T10:33:00Z',
      purchased: '2026-01-05T10:37:00Z',
      shipped: '2026-01-05T12:00:00Z',
      delivered: '2026-01-05T18:00:00Z',
    },
    events: [...mockRxOSActivityEvents, ...mockPriorAuthActivityEvents, ...mockJourneyEvents].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
    startTime: '2026-01-05T10:30:00Z',
    endTime: '2026-01-05T18:00:00Z',
    lastActivityTime: '2026-01-05T18:00:00Z',
  },
  {
    id: 'j-002',
    patientId: 'p-23456',
    orderId: '7834219',
    rxosOrderUrl: 'https://rxos.blinkhealth.com/orders/7834219',
    status: 'done',
    category: 'successful_purchase_delivery',
    journeyType: 'refill',
    programs: ['Bausch and Lomb'],
    metadata: {
      drug: 'Metformin 500mg',
      pharmacy: 'Walgreens',
      platform: 'android',
      appVersion: '4.2.0',
      deviceType: 'Samsung Galaxy S23',
      insurance: 'Aetna',
      insuranceType: 'commercial',
      state: 'NY',
      zipCode: '10001',
    },
    patientInfo: {
      initials: 'M***a J*****n',
      patientId: '3287451',
      accountId: '6891234567890123456',
      dob: '1972-08-22',
      gender: 'F',
      phoneNumber: '2125559876',
      initialRxReceivedDate: '2025-11-15T09:00:00Z',
      totalFillsPurchased: 5,
      medications: ['Metformin 500mg'],
    },
    milestones: {
      refillPricePublished: '2026-01-04T08:00:00Z',
      refillCommDelivered: '2026-01-04T09:00:00Z',
      addedMedToCart: '2026-01-04T09:15:00Z',
      purchased: '2026-01-04T09:20:00Z',
      shipped: '2026-01-04T11:00:00Z',
      delivered: '2026-01-04T16:00:00Z',
    },
    events: [...mockRxOSActivityEventsJ2, ...mockPriorAuthActivityEventsJ2, ...mockJourneyEventsWithError].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
    startTime: '2026-01-04T09:00:00Z',
    endTime: '2026-01-04T10:00:00Z',
    lastActivityTime: '2026-01-04T10:00:00Z',
  },
  {
    id: 'j-003',
    patientId: 'p-34567',
    status: 'new',
    category: 'no_purchase',
    journeyType: 'first_fill',
    programs: ['ARS'],
    metadata: {
      drug: 'Lisinopril 20mg',
      pharmacy: 'Rite Aid',
      platform: 'web',
      insurance: 'UnitedHealthcare',
      insuranceType: 'medicare',
      state: 'FL',
    },
    patientInfo: {
      initials: 'R****t B***n',
      patientId: '5621983',
      dob: '1958-11-30',
      gender: 'M',
      phoneNumber: '3055554567',
      initialRxReceivedDate: '2026-01-02T16:00:00Z',
      totalFillsPurchased: 0,
      medications: ['Lisinopril 20mg'],
    },
    milestones: {
      initialCommDelivered: '2026-01-03T08:00:00Z',
      patientActed: '2026-01-03T12:00:00Z',
    },
    events: [
      {
        id: 'evt-a001',
        type: 'email',
        timestamp: '2026-01-03T08:00:00Z',
        content: {
          subject: 'Save on your Lisinopril prescription',
          body: 'You could save up to 80% on Lisinopril with Blink Health.',
          preview: 'You could save up to 80%...',
          direction: 'outbound',
        },
        metadata: { source: 'sendgrid' },
      },
      {
        id: 'evt-a002',
        type: 'screen_view',
        timestamp: '2026-01-03T12:00:00Z',
        content: {
          screenName: 'Drug Search Results',
          sessionId: 'sess-abandon-1',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-a003',
        type: 'screen_view',
        timestamp: '2026-01-03T12:02:00Z',
        content: {
          screenName: 'Pricing Page',
          sessionId: 'sess-abandon-1',
        },
        metadata: { source: 'mixpanel' },
      },
    ],
    startTime: '2026-01-03T08:00:00Z',
    lastActivityTime: '2026-01-03T12:02:00Z',
  },
  {
    id: 'j-004',
    patientId: 'p-45678',
    status: 'intake',
    category: 'no_purchase',
    journeyType: 'refill',
    programs: ['Shield', 'ARS'],
    metadata: {
      drug: 'Atorvastatin 40mg',
      pharmacy: 'Costco Pharmacy',
      platform: 'ios',
      appVersion: '4.2.1',
      insurance: 'Cigna',
      insuranceType: 'commercial',
      state: 'TX',
    },
    patientInfo: {
      initials: 'S***a W****s',
      patientId: '7834521',
      accountId: '4523678901234567890',
      dob: '1990-06-12',
      gender: 'F',
      phoneNumber: '7135552345',
      initialRxReceivedDate: '2025-12-01T10:00:00Z',
      totalFillsPurchased: 2,
      medications: ['Atorvastatin 40mg', 'Omeprazole 20mg', 'Lisinopril 10mg'],
    },
    milestones: {
      refillPricePublished: '2026-01-06T13:00:00Z',
      refillCommDelivered: '2026-01-06T14:00:00Z',
      addedMedToCart: '2026-01-06T14:45:00Z',
    },
    events: [
      {
        id: 'evt-ip001',
        type: 'sms',
        timestamp: '2026-01-06T14:00:00Z',
        content: {
          body: 'Time to refill your Atorvastatin 40mg! Your price is ready. Tap to refill: https://bfrx.co/xyz789',
          direction: 'outbound',
        },
        metadata: { source: 'twilio' },
      },
      {
        id: 'evt-ip002',
        type: 'screen_view',
        timestamp: '2026-01-06T14:30:00Z',
        content: {
          screenName: 'Refill Landing Page',
          sessionId: 'sess-refill-004',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-ip003',
        type: 'screen_view',
        timestamp: '2026-01-06T14:32:00Z',
        content: {
          screenName: 'Login Screen',
          sessionId: 'sess-refill-004',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-ip004',
        type: 'mixpanel_event',
        timestamp: '2026-01-06T14:33:00Z',
        content: {
          eventName: 'Login Success',
          properties: { method: 'password' },
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-ip005',
        type: 'screen_view',
        timestamp: '2026-01-06T14:35:00Z',
        content: {
          screenName: 'My Medications',
          sessionId: 'sess-refill-004',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-ip006',
        type: 'screen_view',
        timestamp: '2026-01-06T14:40:00Z',
        content: {
          screenName: 'Drug Details - Atorvastatin 40mg',
          sessionId: 'sess-refill-004',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-ip007',
        type: 'mixpanel_event',
        timestamp: '2026-01-06T14:45:00Z',
        content: {
          eventName: 'Add To Cart',
          properties: { drug: 'Atorvastatin 40mg', price: 12.99, quantity: 1 },
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'evt-ip008',
        type: 'screen_view',
        timestamp: '2026-01-06T14:45:30Z',
        content: {
          screenName: 'Shopping Cart',
          sessionId: 'sess-refill-004',
        },
        metadata: { source: 'mixpanel' },
      },
    ],
    startTime: '2026-01-06T14:00:00Z',
    lastActivityTime: '2026-01-06T14:45:30Z',
  },
];

// Generate more journeys for pagination testing
export const generateMockJourneys = (count: number): Journey[] => {
  const journeys: Journey[] = [...mockJourneys];
  
  const firstNames = ['A***e', 'B**', 'C***l', 'D***d', 'E***a', 'F***k', 'G***e', 'H***y'];
  const lastNames = ['S***h', 'J*****n', 'W*****s', 'B***n', 'D***s', 'M****r', 'W****n', 'T****r'];
  
  for (let i = 0; i < count - mockJourneys.length; i++) {
    const statuses: Journey['status'][] = ['new', 'discovery', 'intake', 'onboarding', 'escalated', 'cost_review', 'rph_review', 'rejected', 'transfer', 'dispense', 'dispense_review', 'package', 'processed', 'completed', 'reprocess', 'on_hold', 'closed', 'done', 'cancelled'];
    const categories: Journey['category'][] = ['successful_purchase_delivery', 'successful_purchase_no_delivery', 'no_purchase'];
    const platforms: Journey['metadata']['platform'][] = ['ios', 'android', 'web'];
    const journeyTypes: Journey['journeyType'][] = ['first_fill', 'refill'];
    const journeyType = journeyTypes[Math.floor(Math.random() * journeyTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const drug = DRUGS[Math.floor(Math.random() * DRUGS.length)];
    
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    // Most journeys have 1 program, ~15% have 2, ~5% have 3
    const programRoll = Math.random();
    const numPrograms = programRoll < 0.80 ? 1 : (programRoll < 0.95 ? 2 : 3);
    const shuffledPrograms = [...PROGRAMS].sort(() => Math.random() - 0.5);
    const selectedPrograms = shuffledPrograms.slice(0, numPrograms);
    
    journeys.push({
      id: `j-gen-${i}`,
      patientId: `p-gen-${i}`,
      orderId: Math.random() > 0.3 ? String(1000000 + Math.floor(Math.random() * 9000000)) : undefined,
      rxosOrderUrl: Math.random() > 0.3 ? `https://rxos.blinkhealth.com/orders/${1000000 + Math.floor(Math.random() * 9000000)}` : undefined,
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      journeyType,
      programs: selectedPrograms,
      metadata: {
        drug,
        pharmacy: PHARMACIES[Math.floor(Math.random() * PHARMACIES.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        appVersion: '4.2.1',
        insurance: 'Various Insurance',
        insuranceType: 'commercial',
        state: STATES[Math.floor(Math.random() * STATES.length)],
      },
      patientInfo: {
        initials: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        patientId: String(1000000 + Math.floor(Math.random() * 9000000)),
        // Account ID only exists after account creation (refills always have it, first fills only if past discovery stage)
        ...(journeyType === 'refill' || !['new', 'discovery'].includes(status) 
          ? { accountId: String(Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000) }
          : {}),
        dob: `${1950 + Math.floor(Math.random() * 50)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        initialRxReceivedDate: new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        totalFillsPurchased: Math.floor(Math.random() * 10),
        // Most patients have 1 medication, ~15% have 2, ~5% have 3
        medications: (() => {
          const medRoll = Math.random();
          const numMeds = medRoll < 0.80 ? 1 : (medRoll < 0.95 ? 2 : 3);
          const meds = [drug];
          const otherDrugs = DRUGS.filter(d => d !== drug);
          for (let m = 1; m < numMeds && otherDrugs.length > 0; m++) {
            const randomIdx = Math.floor(Math.random() * otherDrugs.length);
            meds.push(otherDrugs.splice(randomIdx, 1)[0]);
          }
          return meds;
        })(),
      },
      milestones: journeyType === 'first_fill' 
        ? {
            initialCommDelivered: startTime.toISOString(),
            patientActed: !['new', 'discovery'].includes(status) ? new Date(startTime.getTime() + 5 * 60 * 1000).toISOString() : undefined,
            createdAccount: !['new', 'discovery'].includes(status) ? new Date(startTime.getTime() + 10 * 60 * 1000).toISOString() : undefined,
            addedMedToCart: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 15 * 60 * 1000).toISOString() : undefined,
            purchased: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 20 * 60 * 1000).toISOString() : undefined,
            shipped: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
            delivered: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
          }
        : {
            refillPricePublished: new Date(startTime.getTime() - 60 * 60 * 1000).toISOString(),
            refillCommDelivered: startTime.toISOString(),
            addedMedToCart: !['new', 'discovery'].includes(status) ? new Date(startTime.getTime() + 10 * 60 * 1000).toISOString() : undefined,
            purchased: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 15 * 60 * 1000).toISOString() : undefined,
            shipped: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
            delivered: ['completed', 'done', 'closed'].includes(status) ? new Date(startTime.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
          },
      events: (() => {
        const baseEvents = mockJourneyEvents.slice(0, Math.floor(Math.random() * 10) + 3);
        // ~20% chance of having negative feedback
        if (Math.random() < 0.20) {
          const isNPS = Math.random() > 0.5;
          const negativeSurvey: JourneyEvent = {
            id: `evt-neg-${i}`,
            type: 'survey',
            timestamp: new Date(startTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            content: {
              surveyType: isNPS ? 'nps' : 'csat',
              rating: isNPS ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 2) + 1, // NPS 1-4 (out of 10), CSAT 1-2 (out of 5)
              maxRating: isNPS ? 10 : 5,
              verbatim: ['Very disappointed with the service.', 'Too many issues with the app.', 'Would not recommend.', 'Frustrating experience overall.'][Math.floor(Math.random() * 4)],
              question: isNPS ? 'How likely are you to recommend Blink Health to a friend?' : 'How satisfied were you with your experience?',
            },
            metadata: { source: 'delighted' },
          };
          return [...baseEvents, negativeSurvey];
        }
        return baseEvents;
      })(),
      startTime: startTime.toISOString(),
      lastActivityTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return journeys;
};

// ============================================
// Mock Feedback Items
// ============================================

export const mockFeedbackItems: FeedbackItem[] = [
  {
    id: 'fb-001',
    source: 'nps',
    rating: 2,
    maxRating: 10,
    verbatim: 'The app keeps crashing when I try to view my prescriptions. Very frustrating!',
    timestamp: '2026-02-10T14:30:00Z',
    metadata: {
      patientId: 'p-99001',
      platform: 'ios',
      appVersion: '4.2.0',
      state: 'CA',
      journeyId: 'j-001',
      program: 'Tarsus',
    },
    issueId: 'issue-001',
    isProcessed: true,
  },
  {
    id: 'fb-002',
    source: 'app_store',
    rating: 1,
    maxRating: 5,
    verbatim: 'App crashes every time. Can\'t even log in anymore. Used to work fine. Fix this!',
    timestamp: '2026-02-10T16:00:00Z',
    metadata: {
      platform: 'ios',
      appVersion: '4.2.0',
    },
    issueId: 'issue-001',
    isProcessed: true,
  },
  {
    id: 'fb-003',
    source: 'nps',
    rating: 3,
    maxRating: 10,
    verbatim: 'Insurance verification keeps failing. Had to call support twice.',
    timestamp: '2026-02-09T11:00:00Z',
    metadata: {
      patientId: 'p-99002',
      orderId: 'ord-fail-001',
      drug: 'Metformin 500mg',
      state: 'NY',
      journeyId: 'j-003',
      program: 'Bausch and Lomb',
    },
    issueId: 'issue-002',
    isProcessed: true,
  },
  {
    id: 'fb-004',
    source: 'agent_flagged_call',
    verbatim: 'Patient extremely frustrated - insurance card upload failed 5 times. Technical issue with image processing.',
    timestamp: '2026-02-09T15:30:00Z',
    metadata: {
      patientId: 'p-99003',
      journeyId: 'j-002',
      program: 'ARS',
    },
    issueId: 'issue-002',
    isProcessed: true,
    agentId: 'agent-001',
  },
  {
    id: 'fb-005',
    source: 'google_play',
    rating: 2,
    maxRating: 5,
    verbatim: 'Prices changed after I added to cart. Feels like bait and switch.',
    timestamp: '2026-02-08T09:00:00Z',
    metadata: {
      platform: 'android',
    },
    issueId: 'issue-003',
    isProcessed: true,
  },
  {
    id: 'fb-006',
    source: 'trustpilot',
    rating: 1,
    maxRating: 5,
    verbatim: 'Promised delivery didn\'t arrive. No communication. Terrible experience.',
    timestamp: '2026-02-07T20:00:00Z',
    metadata: {
      state: 'TX',
    },
    issueId: 'issue-004',
    isProcessed: true,
  },
  {
    id: 'fb-007',
    source: 'employee_observation',
    verbatim: 'Observed patient struggling with pharmacy selection. Dropdown menu is confusing and doesn\'t show nearest pharmacies first.',
    timestamp: '2026-02-11T10:00:00Z',
    metadata: {
      journeyId: 'j-003',
      program: 'Shield',
    },
    isProcessed: false,
  },
  {
    id: 'fb-008',
    source: 'csat',
    rating: 1,
    maxRating: 5,
    verbatim: 'Support agent was helpful but the app issue is still not fixed after 3 days.',
    timestamp: '2026-02-11T12:00:00Z',
    metadata: {
      patientId: 'p-99004',
      journeyId: 'j-004',
      program: 'Tarsus',
    },
    issueId: 'issue-001',
    isProcessed: true,
  },
];

// ============================================
// Mock Issues
// ============================================

export const mockIssues: Issue[] = [
  {
    id: 'issue-001',
    title: 'iOS App Crashes on Prescription View',
    summary: 'Multiple patients reporting app crashes when attempting to view prescription details on iOS devices running app version 4.2.0',
    severity: 'sev2',
    status: 'in_progress',
    productSurface: 'app',
    ownerId: 'eng-001',
    ownerEmail: 'john.dev@blinkhealth.com',
    ownerTeam: 'Engineering',
    feedbackItems: mockFeedbackItems.filter(f => f.issueId === 'issue-001'),
    feedbackItemCount: 3,
    affectedPatientCount: 47,
    jiraTicketId: 'BLINK-1234',
    jiraTicketUrl: 'https://blinkhealth.atlassian.net/browse/BLINK-1234',
    createdAt: '2026-01-05T15:00:00Z',
    updatedAt: '2026-01-06T09:00:00Z',
    firstOccurrence: '2026-01-05T14:30:00Z',
    lastOccurrence: '2026-01-06T12:00:00Z',
    aiConfidenceScore: 0.92,
  },
  {
    id: 'issue-002',
    title: 'Insurance Card Upload Failures',
    summary: 'Insurance verification process failing for multiple patients. Image processing appears to reject valid insurance cards.',
    severity: 'sev3',
    status: 'assigned',
    productSurface: 'app',
    ownerId: 'eng-002',
    ownerEmail: 'sarah.eng@blinkhealth.com',
    ownerTeam: 'Engineering',
    feedbackItems: mockFeedbackItems.filter(f => f.issueId === 'issue-002'),
    feedbackItemCount: 2,
    affectedPatientCount: 23,
    createdAt: '2026-01-04T12:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
    firstOccurrence: '2026-01-04T11:00:00Z',
    lastOccurrence: '2026-01-04T15:30:00Z',
    aiConfidenceScore: 0.85,
  },
  {
    id: 'issue-003',
    title: 'Price Discrepancy in Cart',
    summary: 'Patients reporting that prices change after adding items to cart. Possible caching or timing issue with pricing API.',
    severity: 'sev3',
    status: 'triaged',
    productSurface: 'pricing',
    ownerTeam: 'Product',
    feedbackItems: mockFeedbackItems.filter(f => f.issueId === 'issue-003'),
    feedbackItemCount: 1,
    affectedPatientCount: 8,
    createdAt: '2026-01-03T10:00:00Z',
    updatedAt: '2026-01-03T10:00:00Z',
    firstOccurrence: '2026-01-03T09:00:00Z',
    lastOccurrence: '2026-01-03T09:00:00Z',
    aiConfidenceScore: 0.78,
  },
  {
    id: 'issue-004',
    title: 'Delivery Fulfillment Communication Gap',
    summary: 'Patients not receiving delivery updates. Possible issue with notification system or fulfillment status sync.',
    severity: 'sev2',
    status: 'backlog',
    productSurface: 'fulfillment',
    ownerTeam: 'Operations',
    feedbackItems: mockFeedbackItems.filter(f => f.issueId === 'issue-004'),
    feedbackItemCount: 1,
    affectedPatientCount: 12,
    createdAt: '2026-01-02T21:00:00Z',
    updatedAt: '2026-01-02T21:00:00Z',
    firstOccurrence: '2026-01-02T20:00:00Z',
    lastOccurrence: '2026-01-02T20:00:00Z',
    aiConfidenceScore: 0.88,
  },
];

// ============================================
// Mock Metrics
// ============================================

export const mockFeedbackMetrics: FeedbackMetrics = {
  totalIssues: 24,
  openIssues: 18,
  sev1Count: 1,
  sev2Count: 4,
  triagedPercentage: 87,
  resolutionRate: 72,
  avgTimeToDetection: 4.2,
  avgTimeToFirstAction: 8.5,
};

export const mockTopIssues: TopIssue[] = mockIssues.map(issue => ({
  issue,
  trend: Math.random() > 0.5 ? 'increasing' : 'stable',
  weekOverWeekChange: Math.floor(Math.random() * 40) - 20,
}));

export const mockIssueTrends: IssueTrend[] = [
  { date: '2026-01-01', newIssues: 5, resolvedIssues: 3, totalOpen: 15 },
  { date: '2026-01-02', newIssues: 3, resolvedIssues: 4, totalOpen: 14 },
  { date: '2026-01-03', newIssues: 7, resolvedIssues: 2, totalOpen: 19 },
  { date: '2026-01-04', newIssues: 4, resolvedIssues: 5, totalOpen: 18 },
  { date: '2026-01-05', newIssues: 6, resolvedIssues: 3, totalOpen: 21 },
  { date: '2026-01-06', newIssues: 2, resolvedIssues: 4, totalOpen: 19 },
  { date: '2026-01-07', newIssues: 3, resolvedIssues: 4, totalOpen: 18 },
];

// ============================================
// Mock Employees & Compliance
// ============================================

export const mockEmployees: Employee[] = [
  { id: 'emp-001', email: 'alice@blinkhealth.com', name: 'Alice Johnson', team: 'Product', department: 'Product', isActive: true },
  { id: 'emp-002', email: 'bob@blinkhealth.com', name: 'Bob Smith', team: 'Engineering', department: 'Engineering', isActive: true },
  { id: 'emp-003', email: 'carol@blinkhealth.com', name: 'Carol Williams', team: 'Operations', department: 'Operations', isActive: true },
  { id: 'emp-004', email: 'david@blinkhealth.com', name: 'David Brown', team: 'Customer Care', department: 'Operations', isActive: true },
  { id: 'emp-005', email: 'eve@blinkhealth.com', name: 'Eve Davis', team: 'Data', department: 'Engineering', isActive: true },
  { id: 'emp-006', email: 'frank@blinkhealth.com', name: 'Frank Miller', team: 'Design', department: 'Product', isActive: true },
  { id: 'emp-007', email: 'grace@blinkhealth.com', name: 'Grace Wilson', team: 'Marketing', department: 'Marketing', isActive: true },
  { id: 'emp-008', email: 'henry@blinkhealth.com', name: 'Henry Taylor', team: 'Finance', department: 'Finance', isActive: true },
];

export const mockAssignments: JourneyAssignment[] = [
  {
    id: 'assign-001',
    employeeId: 'emp-001',
    employeeEmail: 'alice@blinkhealth.com',
    journeyId: 'j-001',
    monthYear: '2026-01',
    status: 'completed',
    assignedAt: '2026-01-01T00:00:00Z',
    startedAt: '2026-01-05T10:00:00Z',
    completedAt: '2026-01-05T11:30:00Z',
    viewedFullJourney: true,
    listenedToAudio: true,
    submittedNotes: true,
    noteId: 'note-001',
    timeSpentSeconds: 5400,
  },
  {
    id: 'assign-002',
    employeeId: 'emp-002',
    employeeEmail: 'bob@blinkhealth.com',
    journeyId: 'j-002',
    monthYear: '2026-01',
    status: 'completed',
    assignedAt: '2026-01-01T00:00:00Z',
    startedAt: '2026-01-04T14:00:00Z',
    completedAt: '2026-01-04T15:00:00Z',
    viewedFullJourney: true,
    listenedToAudio: true,
    submittedNotes: true,
    noteId: 'note-002',
    timeSpentSeconds: 3600,
  },
  {
    id: 'assign-003',
    employeeId: 'emp-003',
    employeeEmail: 'carol@blinkhealth.com',
    journeyId: 'j-003',
    monthYear: '2026-01',
    status: 'in_progress',
    assignedAt: '2026-01-01T00:00:00Z',
    startedAt: '2026-01-06T09:00:00Z',
    viewedFullJourney: true,
    listenedToAudio: false,
    submittedNotes: false,
  },
  {
    id: 'assign-004',
    employeeId: 'emp-004',
    employeeEmail: 'david@blinkhealth.com',
    journeyId: 'j-004',
    monthYear: '2026-01',
    status: 'pending',
    assignedAt: '2026-01-01T00:00:00Z',
    viewedFullJourney: false,
    listenedToAudio: false,
    submittedNotes: false,
  },
  {
    id: 'assign-005',
    employeeId: 'emp-005',
    employeeEmail: 'eve@blinkhealth.com',
    journeyId: 'j-001',
    monthYear: '2026-01',
    status: 'completed',
    assignedAt: '2026-01-01T00:00:00Z',
    startedAt: '2026-01-03T11:00:00Z',
    completedAt: '2026-01-03T12:30:00Z',
    viewedFullJourney: true,
    listenedToAudio: true,
    submittedNotes: true,
    timeSpentSeconds: 5400,
  },
];

export const mockMonthlyComplianceStats: MonthlyComplianceStats = {
  monthYear: '2026-01',
  totalEmployees: 8,
  completedCount: 3,
  inProgressCount: 1,
  pendingCount: 4,
  skippedCount: 0,
  complianceRate: 37.5,
};

export const mockTeamComplianceStats: TeamComplianceStats[] = [
  { team: 'Product', totalEmployees: 2, completedCount: 1, complianceRate: 50, avgTimeSpentSeconds: 5400 },
  { team: 'Engineering', totalEmployees: 2, completedCount: 2, complianceRate: 100, avgTimeSpentSeconds: 4500 },
  { team: 'Operations', totalEmployees: 2, completedCount: 0, complianceRate: 0, avgTimeSpentSeconds: 0 },
  { team: 'Customer Care', totalEmployees: 1, completedCount: 0, complianceRate: 0, avgTimeSpentSeconds: 0 },
  { team: 'Marketing', totalEmployees: 1, completedCount: 0, complianceRate: 0, avgTimeSpentSeconds: 0 },
];

// ============================================
// Mock Notes
// ============================================

export const mockEmployeeNotes: EmployeeNote[] = [
  {
    id: 'note-001',
    journeyId: 'j-001',
    employeeId: 'emp-001',
    employeeEmail: 'alice@blinkhealth.com',
    content: 'Patient had a smooth journey overall. The insurance upload hiccup was minor but could be confusing for less tech-savvy users. Recommend adding clearer instructions on image quality requirements.',
    createdAt: '2026-01-05T11:30:00Z',
    feedbackItemId: 'fb-007',
  },
  {
    id: 'note-002',
    journeyId: 'j-002',
    employeeId: 'emp-002',
    employeeEmail: 'bob@blinkhealth.com',
    content: 'This journey shows a clear authentication bug. The session refresh failed and caused the patient significant friction. The support team handled it well, but we should prioritize fixing the root cause.',
    createdAt: '2026-01-04T15:00:00Z',
  },
];

// ============================================
// Single Threaded Leaders (STLs)
// ============================================

export interface SingleThreadedLeader {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
}

export const mockSTLs: SingleThreadedLeader[] = [
  {
    id: 'stl-001',
    name: 'Matt Digel',
    email: 'matt.digel@blinkhealth.com',
    team: 'Patient Experience',
    role: 'STL - Patient Experience',
  },
  {
    id: 'stl-002',
    name: 'Jason',
    email: 'jason@blinkhealth.com',
    team: 'CRM',
    role: 'STL - CRM',
  },
  {
    id: 'stl-003',
    name: 'Chandra V',
    email: 'chandra.v@blinkhealth.com',
    team: 'Digital Checkout',
    role: 'STL - Digital Checkout',
  },
  {
    id: 'stl-004',
    name: 'Naresh',
    email: 'naresh@blinkhealth.com',
    team: 'Pharma Client Experience',
    role: 'STL - Pharma Client Experience / QuickSave',
  },
  {
    id: 'stl-005',
    name: 'Ted',
    email: 'ted@blinkhealth.com',
    team: 'Provider Experience',
    role: 'STL - Provider Experience & PMO',
  },
  {
    id: 'stl-006',
    name: 'Rahul',
    email: 'rahul@blinkhealth.com',
    team: 'PA / Medical Benefit',
    role: 'STL - PA / Medical Benefit',
  },
  {
    id: 'stl-007',
    name: 'Chris',
    email: 'chris@blinkhealth.com',
    team: 'Contact Center',
    role: 'STL - Contact Center',
  },
  {
    id: 'stl-008',
    name: 'Kurban',
    email: 'kurban@blinkhealth.com',
    team: 'Pharmacy Integrations',
    role: 'STL - Pharmacy Integrations, ISR',
  },
  {
    id: 'stl-009',
    name: 'Abhijit',
    email: 'abhijit@blinkhealth.com',
    team: 'Rx Service',
    role: 'STL - Rx Service / Insurance Service',
  },
  {
    id: 'stl-010',
    name: 'Aravindan',
    email: 'aravindan@blinkhealth.com',
    team: 'RxOS',
    role: 'STL - RxOS',
  },
  {
    id: 'stl-011',
    name: 'Dinesh',
    email: 'dinesh@blinkhealth.com',
    team: 'Data Workflow',
    role: 'STL - Data Workflow & Renewals',
  },
  {
    id: 'stl-012',
    name: 'Aji',
    email: 'aji@blinkhealth.com',
    team: 'IT + Infosec',
    role: 'STL - IT + Infosec',
  },
  {
    id: 'stl-013',
    name: 'Sam',
    email: 'sam@blinkhealth.com',
    team: 'Cloud Engineering',
    role: 'STL - Cloud Engineering',
  },
  {
    id: 'stl-014',
    name: 'Vishal',
    email: 'vishal@blinkhealth.com',
    team: 'Head of India',
    role: 'Head of India',
  },
  {
    id: 'stl-015',
    name: 'Naveen',
    email: 'naveen@blinkhealth.com',
    team: 'Core Services',
    role: 'STL - Core Services',
  },
  {
    id: 'stl-016',
    name: 'Deepa',
    email: 'deepa@blinkhealth.com',
    team: 'QA',
    role: 'STL - QA',
  },
  {
    id: 'stl-017',
    name: 'Surya',
    email: 'surya@blinkhealth.com',
    team: 'AI First',
    role: 'STL - AI First',
  },
  {
    id: 'stl-018',
    name: 'Tracy',
    email: 'tracy@blinkhealth.com',
    team: 'RxOS External',
    role: 'STL - RxOS External',
  },
];
