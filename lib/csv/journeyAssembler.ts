/**
 * Journey Assembler
 * Combines CSV parsing, patient extraction, and event mapping into a complete Journey
 */

import type { CSVRow, ParseResult, ParseDiagnostics, UnmappedEvent } from '@/types/csvJourney';
import type {
  Journey,
  JourneyEvent,
  FirstFillMilestones,
  JourneyCategory,
  JourneyStatus,
  Program,
  RxOSActivityContent,
} from '@/types/journey';
import { extractPatientInfo, extractMedications } from './patientExtractor';
import { mapAllEvents } from './eventMapper';
import { safeParseJSON } from './parser';

/**
 * Assemble a complete Journey from CSV rows
 */
export function assembleJourney(rows: CSVRow[]): ParseResult {
  // Extract patient info
  const patientInfo = extractPatientInfo(rows);

  // Map all events
  const { events, unmappedCount } = mapAllEvents(rows);

  // Sort events chronologically
  const sortedEvents = events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Extract metadata from various sources
  const metadata = extractJourneyMetadata(rows);

  // Determine journey category based on events
  const category = determineCategory(sortedEvents);

  // Determine journey status based on events
  const status = determineStatus(sortedEvents, category);

  // Infer programs
  const programs = inferPrograms(rows);

  // Build the journey
  const journey: Journey = {
    id: 'csv-journey',
    patientId: patientInfo.patientId,
    orderId: rows[0]?.rxos_order_id,
    rxosOrderUrl: rows[0]?.rxos_order_id
      ? `https://rxos.blinkhealth.com/orders/${rows[0].rxos_order_id}`
      : undefined,
    status,
    category,
    journeyType: 'first_fill',
    programs,
    metadata,
    patientInfo,
    milestones: deriveMilestones(sortedEvents),
    events: sortedEvents,
    startTime: sortedEvents[0]?.timestamp || new Date().toISOString(),
    lastActivityTime: sortedEvents[sortedEvents.length - 1]?.timestamp || new Date().toISOString(),
  };

  // Build diagnostics
  const diagnostics: ParseDiagnostics = {
    totalRows: rows.length,
    mappedEvents: events.length,
    unmappedEvents: buildUnmappedEventsList(rows, unmappedCount),
    warnings: buildWarnings(rows, events),
  };

  return {
    journey,
    diagnostics,
  };
}

/**
 * Extract journey metadata from CSV rows
 */
function extractJourneyMetadata(rows: CSVRow[]) {
  const medications = extractMedications(rows);
  const cepEvent = rows.find((r) => r.domain === 'cep_events');
  const cepMeta = cepEvent ? safeParseJSON(cepEvent.metadata) : {};

  // Try to find patient info for address
  let state = 'Unknown';
  const patientInfoEvent = rows.find((r) => r.metadata?.includes('"patient_info"'));
  if (patientInfoEvent) {
    try {
      const meta = safeParseJSON(patientInfoEvent.metadata);
      let patientInfo;
      if (typeof meta.patient_info === 'string') {
        patientInfo = JSON.parse(meta.patient_info);
      } else {
        patientInfo = meta.patient_info;
      }
      state = patientInfo?.shipping_address?.state || state;
    } catch {
      // Ignore parse errors
    }
  }

  return {
    drug: medications[0] || (cepMeta.med_name as string) || 'Unknown',
    pharmacy: 'Unknown',
    platform: 'web' as const,
    state,
    insurance: (cepMeta.patient_insurance_details as string) || 'Unknown',
    insuranceType: (cepMeta.patient_insurance_classification as 'commercial' | 'medicare' | 'medicaid' | 'cash') || undefined,
  };
}

/**
 * Determine journey category based on events
 */
function determineCategory(events: JourneyEvent[]): JourneyCategory {
  const hasOrderCreated = events.some(
    (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'order_created'
  );

  const hasDelivered = events.some(
    (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'shipment_delivered'
  );

  if (hasOrderCreated && hasDelivered) {
    return 'successful_purchase_delivery';
  }

  if (hasOrderCreated) {
    return 'successful_purchase_no_delivery';
  }

  return 'no_purchase';
}

/**
 * Determine journey status based on events
 */
function determineStatus(events: JourneyEvent[], category: JourneyCategory): JourneyStatus {
  if (category === 'successful_purchase_delivery') {
    return 'completed';
  }

  const hasOrderCreated = events.some(
    (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'order_created'
  );

  const hasManualReview = events.some(
    (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'manual_review_required'
  );

  const hasPriorAuth = events.some(
    (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'prior_auth_required'
  );

  if (hasManualReview) {
    return 'on_hold';
  }

  if (hasPriorAuth) {
    return 'cost_review';
  }

  if (hasOrderCreated) {
    return 'dispense';
  }

  return 'discovery';
}

/**
 * Infer programs from CSV metadata
 */
function inferPrograms(rows: CSVRow[]): Program[] {
  const programs = new Set<Program>();

  rows.forEach((row) => {
    const meta = safeParseJSON(row.metadata);

    // Check for program indicators in metadata
    const programFields = [
      meta.program,
      meta.program_name,
      meta.partner,
      meta.partner_name,
      meta.source_program,
    ];

    programFields.forEach((field) => {
      if (typeof field === 'string') {
        const lower = field.toLowerCase();
        if (lower.includes('tarsus')) programs.add('Tarsus');
        if (lower.includes('bausch') || lower.includes('b&l') || lower.includes('b+l'))
          programs.add('Bausch and Lomb');
        if (lower.includes('ars')) programs.add('ARS');
        if (lower.includes('shield')) programs.add('Shield');
      }
    });
  });

  return Array.from(programs);
}

/**
 * Derive milestones from events
 */
function deriveMilestones(events: JourneyEvent[]): FirstFillMilestones {
  return {
    initialCommDelivered: events.find((e) => e.type === 'sms' || e.type === 'email')?.timestamp,
    patientActed: events.find((e) => e.type === 'mixpanel_event')?.timestamp,
    purchased: events.find(
      (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'order_created'
    )?.timestamp,
    shipped: events.find(
      (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'shipment_created'
    )?.timestamp,
    delivered: events.find(
      (e) => e.type === 'rxos_activity' && (e.content as RxOSActivityContent).activityType === 'shipment_delivered'
    )?.timestamp,
  };
}

/**
 * Build list of unmapped events for diagnostics
 */
function buildUnmappedEventsList(rows: CSVRow[], unmappedCount: number): UnmappedEvent[] {
  const unmapped: UnmappedEvent[] = [];

  // Only include a sample if there are many unmapped events
  if (unmappedCount > 10) {
    return [];
  }

  rows.forEach((row, index) => {
    // Check if this would map to system_log (fallback)
    const isUnmapped =
      row.domain !== 'cep_patient_communication' &&
      row.domain !== 'mixpanel' &&
      !['Prescription', 'order', 'workflow', 'insurance', 'pricing', 'camunda_workflow', 'camunda_task_assignment'].includes(
        row.domain
      );

    if (isUnmapped) {
      unmapped.push({
        row: index + 1,
        domain: row.domain,
        name: row.name,
        source: row.source,
      });
    }
  });

  return unmapped;
}

/**
 * Build warnings list
 */
function buildWarnings(rows: CSVRow[], events: JourneyEvent[]): string[] {
  const warnings: string[] = [];

  if (rows.length > 1000) {
    warnings.push(`Large CSV file (${rows.length} rows). Processing may be slow.`);
  }

  if (events.length === 0) {
    warnings.push('No events were successfully mapped from the CSV.');
  }

  const medications = extractMedications(rows);
  if (medications.length === 0) {
    warnings.push('Could not identify any medications in the CSV data.');
  }

  const hasPatientInfo = rows.some((r) => r.metadata?.includes('"patient_info"'));
  if (!hasPatientInfo) {
    warnings.push('Could not find structured patient information in CSV.');
  }

  return warnings;
}
