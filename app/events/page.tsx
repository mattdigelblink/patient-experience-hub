'use client';

import React from 'react';
import { PageHeader } from '@/components/shared';
import { TimelineEvent } from '@/components/journey';
import type { JourneyEvent, RxOSActivityContent } from '@/types/journey';

// Example events for each type
const exampleEvents: { category: string; description: string; events: JourneyEvent[] }[] = [
  {
    category: 'SMS',
    description: 'Text messages sent to or received from patients',
    events: [
      {
        id: 'sms-outbound',
        type: 'sms',
        timestamp: '2026-01-08T10:30:00Z',
        content: {
          body: 'Hi! Your prescription for Lipitor 10mg is ready to order. Tap here to get started: https://bfrx.co/abc123',
          direction: 'outbound',
        },
        metadata: { source: 'twilio' },
      },
      {
        id: 'sms-inbound',
        type: 'sms',
        timestamp: '2026-01-08T10:35:00Z',
        content: {
          body: 'STOP',
          direction: 'inbound',
          phoneNumber: '+1 (555) 123-4567',
        },
        metadata: { source: 'twilio' },
      },
    ],
  },
  {
    category: 'Email',
    description: 'Emails sent to or received from patients',
    events: [
      {
        id: 'email-outbound',
        type: 'email',
        timestamp: '2026-01-08T09:00:00Z',
        content: {
          subject: 'Order Confirmation - Lipitor 10mg',
          body: 'Thank you for your order!\n\nYour prescription will be ready for pickup at CVS within 2 hours.\n\nOrder Details:\n- Lipitor 10mg (30 tablets)\n- Price: $12.99\n- Pickup Location: CVS Pharmacy, 123 Main St\n\nQuestions? Reply to this email or call us at 1-800-BLINK-RX.',
          preview: 'Thank you for your order! Your prescription will be ready...',
          direction: 'outbound',
          from: 'orders@blinkrx.com',
          to: 'john.smith@email.com',
        },
        metadata: { source: 'sendgrid' },
      },
      {
        id: 'email-inbound',
        type: 'email',
        timestamp: '2026-01-08T10:15:00Z',
        content: {
          subject: 'Re: Order Confirmation - Lipitor 10mg',
          body: 'Hi,\n\nI have a question about my order. The confirmation says pickup at CVS but I thought I selected home delivery when I placed the order. Can you please check on this?\n\nAlso, is there a way to change it to delivery if it was set to pickup by mistake?\n\nThanks,\nJohn',
          preview: 'I have a question about my order. The confirmation says pickup at CVS but I thought...',
          direction: 'inbound',
          from: 'john.smith@email.com',
          to: 'support@blinkrx.com',
        },
        metadata: { source: 'sendgrid' },
      },
    ],
  },
  {
    category: 'Voice Broadcast',
    description: 'Automated voice messages sent to patients',
    events: [
      {
        id: 'voice-broadcast',
        type: 'voice_broadcast',
        timestamp: '2026-01-08T14:00:00Z',
        content: {
          transcript: 'Hello, this is Blink Health calling about your prescription. Your medication is ready for pickup at your local pharmacy. If you have any questions, please call us at 1-800-BLINK-RX. Thank you for choosing Blink Health.',
          duration: 25,
          audioUrl: 'https://example.com/audio/broadcast-123.mp3',
        },
        metadata: { source: 'twilio_voice' },
      },
    ],
  },
  {
    category: 'Phone Call',
    description: 'Inbound and outbound phone calls with patients',
    events: [
      {
        id: 'call-inbound',
        type: 'call',
        timestamp: '2026-01-08T11:30:00Z',
        content: {
          transcript: 'Agent: Thank you for calling Blink Health. My name is Sarah, how can I help you today?\nPatient: Hi, I have a question about my prescription order.\nAgent: Of course! Can I have your order number please?\nPatient: It\'s ORD-67890.\nAgent: Thank you. I can see your order is being processed and should be ready for pickup in about an hour.\nPatient: Great, thank you so much!\nAgent: You\'re welcome! Is there anything else I can help you with?\nPatient: No, that\'s all. Thanks!',
          duration: 180,
          direction: 'inbound',
          agentName: 'Sarah M.',
          summary: 'Patient called to check on order status. Confirmed order ORD-67890 will be ready in 1 hour.',
          levelAiUrl: 'https://app.levelai.com/calls/abc123',
        },
        metadata: { source: 'level_ai' },
      },
      {
        id: 'call-outbound',
        type: 'call',
        timestamp: '2026-01-08T15:00:00Z',
        content: {
          transcript: 'Agent: Hi, this is Mike from Blink Health. Am I speaking with John?\nPatient: Yes, this is John.\nAgent: Great! I\'m calling to let you know that we noticed an issue with your insurance verification. Would you have a moment to help me resolve this?\nPatient: Sure, what do you need?\nAgent: Could you verify your insurance member ID?\nPatient: It\'s ABC123456.\nAgent: Perfect, I\'ve updated that. You should be good to go now!',
          duration: 120,
          direction: 'outbound',
          agentName: 'Mike T.',
          summary: 'Outbound call to resolve insurance verification issue. Successfully updated member ID.',
        },
        metadata: { source: 'level_ai' },
      },
    ],
  },
  {
    category: 'Chat',
    description: 'Live chat conversations with patients (bot and agent)',
    events: [
      {
        id: 'chat-resolved',
        type: 'chat',
        timestamp: '2026-01-08T13:00:00Z',
        content: {
          messages: [
            {
              id: 'msg-1',
              sender: 'bot',
              message: 'Hi there! 👋 How can I help you today?',
              timestamp: '2026-01-08T13:00:00Z',
            },
            {
              id: 'msg-2',
              sender: 'patient',
              message: 'I can\'t log into my account. It keeps saying my password is wrong.',
              timestamp: '2026-01-08T13:00:30Z',
            },
            {
              id: 'msg-3',
              sender: 'bot',
              message: 'I\'m sorry to hear that. Let me connect you with a team member who can help reset your password.',
              timestamp: '2026-01-08T13:00:45Z',
            },
            {
              id: 'msg-4',
              sender: 'agent',
              senderName: 'Jennifer K.',
              message: 'Hi! I\'m Jennifer and I\'d be happy to help you reset your password. Can you confirm the email address on your account?',
              timestamp: '2026-01-08T13:02:00Z',
            },
            {
              id: 'msg-5',
              sender: 'patient',
              message: 'It\'s john.doe@email.com',
              timestamp: '2026-01-08T13:02:30Z',
            },
            {
              id: 'msg-6',
              sender: 'agent',
              senderName: 'Jennifer K.',
              message: 'I\'ve just sent a password reset link to that email. Please check your inbox (and spam folder) and let me know if you received it!',
              timestamp: '2026-01-08T13:03:00Z',
            },
            {
              id: 'msg-7',
              sender: 'patient',
              message: 'Got it! Thank you so much for your help!',
              timestamp: '2026-01-08T13:04:00Z',
            },
          ],
          agentName: 'Jennifer K.',
          resolved: true,
        },
        metadata: { source: 'intercom' },
      },
      {
        id: 'chat-open',
        type: 'chat',
        timestamp: '2026-01-08T16:00:00Z',
        content: {
          messages: [
            {
              id: 'msg-a1',
              sender: 'bot',
              message: 'Welcome to Blink Health! How can I assist you?',
              timestamp: '2026-01-08T16:00:00Z',
            },
            {
              id: 'msg-a2',
              sender: 'patient',
              message: 'Where is my order? It was supposed to arrive yesterday.',
              timestamp: '2026-01-08T16:00:30Z',
            },
            {
              id: 'msg-a3',
              sender: 'bot',
              message: 'I understand you\'re waiting for your order. Let me connect you with a specialist.',
              timestamp: '2026-01-08T16:00:45Z',
            },
          ],
          resolved: false,
        },
        metadata: { source: 'intercom' },
      },
    ],
  },
  {
    category: 'Digital Events',
    description: 'Screen views and analytics events from the app - click to expand details',
    events: [
      {
        id: 'screen-home',
        type: 'screen_view',
        timestamp: '2026-01-08T10:31:00Z',
        content: {
          screenName: 'Home Screen',
          sessionId: 'sess-12345',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'mp-signup',
        type: 'mixpanel_event',
        timestamp: '2026-01-08T10:31:30Z',
        content: {
          eventName: 'Account Created',
          properties: {
            signupMethod: 'email',
            referralSource: 'sms_campaign',
            hasInsurance: true,
          },
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'screen-rx-details',
        type: 'screen_view',
        timestamp: '2026-01-08T10:32:00Z',
        content: {
          screenName: 'Prescription Details - Lipitor 10mg',
          sessionId: 'sess-12345',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'mp-add-to-cart',
        type: 'mixpanel_event',
        timestamp: '2026-01-08T10:32:30Z',
        content: {
          eventName: 'Add to Cart Clicked',
          properties: {
            drug: 'Lipitor 10mg',
            price: 12.99,
            quantity: 1,
            pharmacy: 'CVS',
            insuranceApplied: true,
          },
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'screen-checkout',
        type: 'screen_view',
        timestamp: '2026-01-08T10:33:00Z',
        content: {
          screenName: 'Checkout',
          sessionId: 'sess-12345',
        },
        metadata: { source: 'mixpanel' },
      },
      {
        id: 'mp-order-placed',
        type: 'mixpanel_event',
        timestamp: '2026-01-08T10:33:30Z',
        content: {
          eventName: 'Order Placed',
          properties: {
            orderId: 'ord-67890',
            total: 12.99,
            paymentMethod: 'credit_card',
            fulfillmentType: 'pickup',
          },
        },
        metadata: { source: 'mixpanel' },
      },
    ],
  },
  {
    category: 'Survey',
    description: 'Patient feedback surveys (NPS, CSAT, DNPU)',
    events: [
      {
        id: 'survey-nps-high',
        type: 'survey',
        timestamp: '2026-01-08T18:00:00Z',
        content: {
          surveyType: 'nps',
          rating: 9,
          maxRating: 10,
          verbatim: 'Easy process once I figured out the insurance upload. Would definitely recommend to friends and family!',
          question: 'How likely are you to recommend Blink Health to a friend or colleague?',
          additionalQuestions: [
            {
              question: 'How easy was it to place your order?',
              answer: 4,
              type: 'rating',
              maxRating: 5,
            },
            {
              question: 'How did you hear about us?',
              answer: 'Doctor referral',
              type: 'multiple_choice',
            },
            {
              question: 'What could we do better?',
              answer: 'Make the insurance upload process clearer with better instructions',
              type: 'text',
            },
          ],
        },
        metadata: { source: 'delighted' },
      },
      {
        id: 'survey-nps-low',
        type: 'survey',
        timestamp: '2026-01-08T18:30:00Z',
        content: {
          surveyType: 'nps',
          rating: 3,
          maxRating: 10,
          verbatim: 'App kept crashing when I tried to upload my insurance card. Very frustrating experience.',
          question: 'How likely are you to recommend Blink Health to a friend or colleague?',
          additionalQuestions: [
            {
              question: 'How easy was it to place your order?',
              answer: 1,
              type: 'rating',
              maxRating: 5,
            },
            {
              question: 'What device were you using?',
              answer: 'iPhone 14',
              type: 'multiple_choice',
            },
            {
              question: 'Please describe the issue you experienced',
              answer: 'Every time I tried to take a photo of my insurance card, the app would freeze and then crash. Had to try 6 times before it finally worked.',
              type: 'text',
            },
          ],
        },
        metadata: { source: 'delighted' },
      },
      {
        id: 'survey-csat',
        type: 'survey',
        timestamp: '2026-01-08T19:00:00Z',
        content: {
          surveyType: 'csat',
          rating: 5,
          maxRating: 5,
          verbatim: 'The customer service agent was extremely helpful and resolved my issue quickly.',
          question: 'How satisfied were you with your support experience?',
          additionalQuestions: [
            {
              question: 'Was your issue resolved?',
              answer: 'Yes, completely',
              type: 'multiple_choice',
            },
            {
              question: 'How knowledgeable was the agent?',
              answer: 5,
              type: 'rating',
              maxRating: 5,
            },
            {
              question: 'How would you rate the wait time?',
              answer: 4,
              type: 'rating',
              maxRating: 5,
            },
          ],
        },
        metadata: { source: 'delighted' },
      },
      {
        id: 'survey-dnpu',
        type: 'survey',
        timestamp: '2026-01-08T19:30:00Z',
        content: {
          surveyType: 'dnpu',
          rating: 2,
          maxRating: 5,
          verbatim: 'I didn\'t end up purchasing because the price was higher than my local pharmacy.',
        },
        metadata: { source: 'internal' },
      },
    ],
  },
  {
    category: 'System Log',
    description: 'API errors, system events, and technical logs',
    events: [
      {
        id: 'system-success',
        type: 'system_log',
        timestamp: '2026-01-08T10:37:00Z',
        content: {
          message: 'Order successfully created',
          statusCode: 201,
          endpoint: '/api/orders',
          requestId: 'req-success-123',
        },
        metadata: { source: 'api_logs' },
      },
      {
        id: 'system-error-400',
        type: 'system_log',
        timestamp: '2026-01-08T10:33:45Z',
        content: {
          message: 'Insurance verification failed - card image unclear',
          statusCode: 400,
          endpoint: '/api/insurance/verify',
          requestId: 'req-err-456',
        },
        metadata: { source: 'api_logs' },
        errorIndicators: [
          {
            type: 'validation_error',
            statusCode: 400,
            message: 'Insurance card image unclear - please retake photo',
            severity: 'warning',
          },
        ],
      },
      {
        id: 'system-error-500',
        type: 'system_log',
        timestamp: '2026-01-08T10:34:00Z',
        content: {
          message: 'Internal server error - database connection timeout',
          statusCode: 500,
          endpoint: '/api/prescriptions',
          requestId: 'req-err-789',
          stackTrace: 'Error: Connection timeout\n  at DatabasePool.acquire (db.js:45)\n  at PrescriptionService.get (prescriptions.js:123)',
        },
        metadata: { source: 'api_logs' },
        errorIndicators: [
          {
            type: 'api_error',
            statusCode: 500,
            message: 'Database connection timeout - service temporarily unavailable',
            severity: 'critical',
          },
        ],
      },
    ],
  },
  {
    category: 'RxOS Activity',
    description: 'Backend pharmacy system events - typically hidden by default, can be revealed for troubleshooting',
    events: [
      {
        id: 'rxos-rx-received',
        type: 'rxos_activity',
        timestamp: '2026-01-08T08:00:00Z',
        content: {
          activityType: 'prescription_received',
          description: 'Prescription received from provider via e-prescribe',
          actor: 'System',
          prescriptionId: 'rx-12345',
          details: { provider: 'Dr. Jane Smith', npi: '1234567890', rxType: 'new' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-pharmacist',
        type: 'rxos_activity',
        timestamp: '2026-01-08T09:30:00Z',
        content: {
          activityType: 'pharmacist_action',
          description: 'Prescription approved by pharmacist',
          actor: 'PharmD_Johnson',
          prescriptionId: 'rx-12345',
          details: { action: 'approved', notes: 'Verified dosage appropriate for patient' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-price',
        type: 'rxos_activity',
        timestamp: '2026-01-08T09:45:00Z',
        content: {
          activityType: 'price_published',
          description: 'Patient price published and ready for checkout',
          actor: 'PricingEngine',
          orderId: 'ord-67890',
          details: { cashPrice: 45.99, insurancePrice: 12.99, finalPrice: 12.99 },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-order',
        type: 'rxos_activity',
        timestamp: '2026-01-08T10:37:30Z',
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
        id: 'rxos-fulfillment',
        type: 'rxos_activity',
        timestamp: '2026-01-08T11:30:00Z',
        content: {
          activityType: 'fulfillment_completed',
          description: 'Order fulfilled and ready for shipment',
          actor: 'FulfillmentBot',
          orderId: 'ord-67890',
          details: { fillLocation: 'Blink Direct - Phoenix', lotNumber: 'LOT-2026-001' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-ship',
        type: 'rxos_activity',
        timestamp: '2026-01-08T12:00:00Z',
        content: {
          activityType: 'shipment_created',
          description: 'Shipping label created',
          actor: 'System',
          orderId: 'ord-67890',
          details: { carrier: 'USPS', trackingNumber: '9400111899223456789012' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-delivered',
        type: 'rxos_activity',
        timestamp: '2026-01-08T18:00:00Z',
        content: {
          activityType: 'shipment_delivered',
          description: 'Package delivered to patient',
          actor: 'System',
          orderId: 'ord-67890',
          details: { deliveredTo: 'Front Door', signedBy: 'Resident' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-prior-auth',
        type: 'rxos_activity',
        timestamp: '2026-01-08T14:00:00Z',
        content: {
          activityType: 'prior_auth_required',
          description: 'Prior authorization required by insurance',
          actor: 'ClaimsProcessor',
          prescriptionId: 'rx-99999',
          details: { payer: 'Aetna', reason: 'Step therapy required', deadline: '2026-01-15' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
      {
        id: 'rxos-insurance-reject',
        type: 'rxos_activity',
        timestamp: '2026-01-08T14:30:00Z',
        content: {
          activityType: 'insurance_rejected',
          description: 'Insurance claim rejected',
          actor: 'ClaimsProcessor',
          orderId: 'ord-88888',
          details: { rejectCode: '75', rejectMessage: 'Prior Authorization Required', payer: 'UnitedHealthcare' },
        } as RxOSActivityContent,
        metadata: { source: 'rxos' },
      },
    ],
  },
];

export default function EventsShowcasePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Event Types Showcase"
        description="A reference of all journey event widget types and their variations"
      />

      {exampleEvents.map((category) => (
        <div key={category.category} className="bg-white rounded-xl border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">{category.category}</h2>
            <p className="text-sm text-slate-500 mt-1">{category.description}</p>
          </div>

          <div className="space-y-0">
            {category.events.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={index === category.events.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

