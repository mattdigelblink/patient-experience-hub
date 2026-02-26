/**
 * Event Mapper
 * Maps CSV rows to Journey event types
 */

import type { CSVRow } from '@/types/csvJourney';
import type {
  JourneyEvent,
  EventType,
  EventContent,
  RxOSActivityType,
  SMSContent,
  EmailContent,
  MixpanelEventContent,
  RxOSActivityContent,
  SystemLogContent,
} from '@/types/journey';
import { safeParseJSON, timestampToISO } from './parser';

/**
 * Mapping rule interface
 */
export interface MappingRule {
  name: string;
  match: (row: CSVRow) => boolean;
  type: EventType;
  extract: (row: CSVRow) => EventContent;
}

/**
 * Event mapping rules in priority order
 */
export const MAPPING_RULES: MappingRule[] = [
  // SMS Communications
  {
    name: 'SMS',
    match: (row) =>
      row.domain === 'cep_patient_communication' &&
      (row.source?.toLowerCase().includes('sms') || row.source?.toLowerCase().includes('braze.sms')),
    type: 'sms',
    extract: (row) => {
      const meta = safeParseJSON(row.metadata);
      return {
        body: row.message || meta.body || 'SMS sent',
        direction: row.source?.includes('BRAZE') || row.created_by === 'system' ? 'outbound' : 'inbound',
        phoneNumber: (meta.recipient_number || meta.phone_number) as string | undefined,
      } as SMSContent;
    },
  },

  // Email Communications
  {
    name: 'Email',
    match: (row) =>
      row.domain === 'cep_patient_communication' &&
      (row.source?.toLowerCase().includes('email') || row.source?.toLowerCase().includes('braze.email')),
    type: 'email',
    extract: (row) => {
      const meta = safeParseJSON(row.metadata);
      return {
        subject: (meta.subject as string) || 'Patient Communication',
        body: row.message || (meta.body as string) || 'Email sent',
        preview: (row.message || (meta.body as string) || '').slice(0, 100),
        direction: 'outbound',
        from: meta.from as string | undefined,
        to: meta.to as string | undefined,
      } as EmailContent;
    },
  },

  // Mixpanel Events
  {
    name: 'Mixpanel',
    match: (row) => row.domain === 'mixpanel' || row.source?.toLowerCase() === 'mixpanel',
    type: 'mixpanel_event',
    extract: (row) => {
      const meta = safeParseJSON(row.metadata);
      return {
        eventName: row.name || 'Unknown Event',
        properties: meta,
        distinctId: row.entity_id,
      } as MixpanelEventContent;
    },
  },

  // RxOS Activities (Prescription, Order, Workflow, Insurance, Pricing)
  {
    name: 'RxOS Activity',
    match: (row) =>
      ['Prescription', 'order', 'workflow', 'insurance', 'pricing', 'camunda_workflow', 'camunda_task_assignment'].includes(
        row.domain
      ) || row.source?.toLowerCase() === 'rxos',
    type: 'rxos_activity',
    extract: (row) => {
      const meta = safeParseJSON(row.metadata);
      return {
        activityType: mapToRxOSActivityType(row.name, row.message, row.domain),
        description: row.message || row.name || 'RxOS Activity',
        actor: row.created_by || 'System',
        orderId: row.rxos_order_id,
        prescriptionId: row.prescription_id,
        details: meta,
      } as RxOSActivityContent;
    },
  },

  // System Log (Fallback)
  {
    name: 'System Log',
    match: () => true,
    type: 'system_log',
    extract: (row) => {
      const meta = safeParseJSON(row.metadata);
      return {
        message: row.message || row.name || 'System event',
        endpoint: row.source,
        requestId: row.id,
        statusCode: meta.status_code as number | undefined,
      } as SystemLogContent;
    },
  },
];

/**
 * Map CSV event name to RxOSActivityType
 */
function mapToRxOSActivityType(
  name: string,
  message: string,
  domain: string
): RxOSActivityType {
  // Direct mappings
  const directMappings: Record<string, RxOSActivityType> = {
    'first.prescription.received': 'prescription_received',
    'prescription.created': 'prescription_received',
    'prescription.received': 'prescription_received',
    'order.created': 'order_created',
    'order.updated': 'order_updated',
    'order.put_on_hold': 'manual_review_required',
    'order.hold_released': 'order_updated',
    'order.price_delay_started': 'prior_auth_required',
    'order.price_delay_completed': 'prior_auth_approved',
    'prescription.transfer_submitted': 'prescription_transferred',
    'prescription.transfer_completed': 'prescription_transferred',
    'prescription.transferred': 'prescription_transferred',
    'prescription.pv1_approved': 'pharmacist_action',
    'prescription.pharmacist_review': 'pharmacist_review',
    'claim.submitted': 'insurance_billed',
    'claim.rejected': 'insurance_rejected',
    'claim.approved': 'insurance_billed',
    'price.published': 'price_published',
    'fulfillment.started': 'fulfillment_started',
    'fulfillment.completed': 'fulfillment_completed',
    'shipment.created': 'shipment_created',
    'shipment.picked_up': 'shipment_picked_up',
    'shipment.in_transit': 'shipment_in_transit',
    'shipment.delivered': 'shipment_delivered',
    'workflow_step.started': 'order_updated',
    'workflow_step.completed': 'order_updated',
    'task.created': 'manual_review_required',
    'task.completed': 'order_updated',
  };

  if (directMappings[name]) {
    return directMappings[name];
  }

  // Infer from domain
  if (domain === 'insurance' || domain === 'pricing') {
    if (name.includes('reject') || message.includes('reject')) {
      return 'insurance_rejected';
    }
    if (name.includes('bill') || name.includes('claim')) {
      return 'insurance_billed';
    }
    if (name.includes('price')) {
      return 'price_published';
    }
  }

  if (domain === 'Prescription') {
    if (name.includes('transfer')) {
      return 'prescription_transferred';
    }
    if (name.includes('pharmacist') || name.includes('pv1') || name.includes('review')) {
      return 'pharmacist_review';
    }
    return 'prescription_received';
  }

  if (domain === 'workflow' || domain === 'camunda_workflow') {
    if (message.includes('hold') || message.includes('review')) {
      return 'manual_review_required';
    }
    return 'order_updated';
  }

  // Infer from message content
  if (message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('ship') && lowerMessage.includes('deliver')) {
      return 'shipment_delivered';
    }
    if (lowerMessage.includes('ship') && lowerMessage.includes('transit')) {
      return 'shipment_in_transit';
    }
    if (lowerMessage.includes('ship') && lowerMessage.includes('pick')) {
      return 'shipment_picked_up';
    }
    if (lowerMessage.includes('ship')) {
      return 'shipment_created';
    }
    if (lowerMessage.includes('fulfillment') && lowerMessage.includes('complete')) {
      return 'fulfillment_completed';
    }
    if (lowerMessage.includes('fulfillment')) {
      return 'fulfillment_started';
    }
    if (lowerMessage.includes('prior auth') || lowerMessage.includes('pa')) {
      if (lowerMessage.includes('approve')) {
        return 'prior_auth_approved';
      }
      if (lowerMessage.includes('denied')) {
        return 'prior_auth_denied';
      }
      if (lowerMessage.includes('submit')) {
        return 'prior_auth_submitted';
      }
      return 'prior_auth_required';
    }
  }

  // Default fallback
  return 'order_updated';
}

/**
 * Map a CSV row to a Journey event
 */
export function mapCSVRowToEvent(row: CSVRow, rowIndex: number): JourneyEvent {
  // Find the first matching rule
  const rule = MAPPING_RULES.find((r) => r.match(row));

  if (!rule) {
    // Should never happen due to fallback rule, but be defensive
    throw new Error(`No mapping rule found for row ${rowIndex}`);
  }

  const meta = safeParseJSON(row.metadata);

  return {
    id: row.id || `event-${row.created}-${rowIndex}`,
    type: rule.type,
    timestamp: timestampToISO(row.created),
    content: rule.extract(row),
    metadata: {
      source: row.source || 'unknown',
      correlationId: row.correlation_id,
      raw: meta,
    },
  };
}

/**
 * Map all CSV rows to events and collect diagnostics
 */
export function mapAllEvents(rows: CSVRow[]): {
  events: JourneyEvent[];
  unmappedCount: number;
} {
  const events: JourneyEvent[] = [];
  let unmappedCount = 0;

  rows.forEach((row, index) => {
    try {
      const event = mapCSVRowToEvent(row, index);
      events.push(event);

      // Count system_log events as "unmapped" for diagnostics
      if (event.type === 'system_log') {
        unmappedCount++;
      }
    } catch (error) {
      console.warn(`Failed to map row ${index}:`, error);
      unmappedCount++;
    }
  });

  return { events, unmappedCount };
}
