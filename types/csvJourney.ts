/**
 * CSV Journey Types
 * Types specific to parsing and transforming CSV event data into Journey format
 */

import type { Journey } from './journey';

/**
 * Raw CSV row structure from ExamplePatientJourney.csv
 */
export interface CSVRow {
  correlation_id: string;
  created: string; // Unix timestamp in milliseconds
  created_by: string;
  domain: string;
  entity_id: string;
  entity_type: string;
  id: string;
  message: string;
  metadata: string; // JSON string
  name: string;
  source: string;
  prescription_id: string;
  rxos_fill_id: string;
  reason: string;
  task_business_key_value: string;
  rxos_order_id: string;
  patient_id: string;
}

/**
 * Result of parsing CSV and assembling into Journey
 */
export interface ParseResult {
  journey: Journey;
  diagnostics: ParseDiagnostics;
}

/**
 * Diagnostics about the parsing process
 */
export interface ParseDiagnostics {
  totalRows: number;
  mappedEvents: number;
  unmappedEvents: UnmappedEvent[];
  warnings: string[];
}

/**
 * Event that couldn't be mapped to a known type
 */
export interface UnmappedEvent {
  row: number;
  domain: string;
  name: string;
  source: string;
}

/**
 * Patient info extracted from CSV metadata
 */
export interface CSVPatientInfo {
  id: string;
  blink_account_id?: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  cell_phone?: string;
  shipping_address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}
