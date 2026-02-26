/**
 * Patient Info Extractor
 * Extracts patient information from CSV metadata
 */

import type { CSVRow, CSVPatientInfo } from '@/types/csvJourney';
import type { PatientInfo } from '@/types/journey';
import { safeParseJSON, timestampToISO } from './parser';

/**
 * Extract patient info from CSV rows
 * Looks for patient_info in cep_events metadata
 */
export function extractPatientInfo(rows: CSVRow[]): PatientInfo {
  // Find cep_events row with patient_info in metadata
  const cepEvent = rows.find(
    (r) => r.domain === 'cep_events' && r.metadata?.includes('"patient_info"')
  );

  if (cepEvent) {
    try {
      const metadata = safeParseJSON(cepEvent.metadata);

      // The patient_info might be a JSON string within the metadata
      let patientInfo: CSVPatientInfo;

      if (typeof metadata.patient_info === 'string') {
        patientInfo = JSON.parse(metadata.patient_info as string) as CSVPatientInfo;
      } else if (typeof metadata.patient_info === 'object') {
        patientInfo = metadata.patient_info as CSVPatientInfo;
      } else {
        throw new Error('patient_info not found in expected format');
      }

      return {
        initials: formatInitials(patientInfo.first_name, patientInfo.last_name),
        patientId: patientInfo.id || rows[0]?.patient_id || 'unknown',
        accountId: patientInfo.blink_account_id,
        dob: patientInfo.birth_date || '1970-01-01',
        initialRxReceivedDate: findFirstRxDate(rows),
        totalFillsPurchased: countPurchases(rows),
        medications: extractMedications(rows),
      };
    } catch (error) {
      console.warn('Failed to parse patient_info from metadata:', error);
    }
  }

  // Fallback: build from available data
  return buildFallbackPatientInfo(rows);
}

/**
 * Format name into initials with obfuscation
 * "April Franklin Downs" → "A***l D***s"
 */
function formatInitials(firstName: string, lastName: string): string {
  const formatName = (name: string): string => {
    if (!name || name.length < 2) return name;
    return `${name[0]}***${name[name.length - 1]}`;
  };

  // Handle middle names
  const nameParts = firstName.trim().split(/\s+/);
  const formattedFirst = nameParts.map(formatName).join(' ');
  const formattedLast = formatName(lastName);

  return `${formattedFirst} ${formattedLast}`;
}

/**
 * Find the first prescription received date
 */
function findFirstRxDate(rows: CSVRow[]): string {
  const firstRxEvent = rows.find(
    (r) =>
      r.domain === 'Prescription' ||
      r.name === 'first.prescription.received' ||
      r.name === 'prescription.created'
  );

  if (firstRxEvent) {
    return timestampToISO(firstRxEvent.created);
  }

  // Fallback to first event
  return rows.length > 0 ? timestampToISO(rows[0].created) : new Date().toISOString();
}

/**
 * Count purchases from order.created events
 */
function countPurchases(rows: CSVRow[]): number {
  return rows.filter((r) => r.name === 'order.created').length;
}

/**
 * Extract medications from metadata
 */
export function extractMedications(rows: CSVRow[]): string[] {
  const meds = new Set<string>();

  rows.forEach((row) => {
    const meta = safeParseJSON(row.metadata);

    // Check various metadata fields where med name might be
    if (meta.med_name) {
      meds.add(meta.med_name as string);
    }
    if (meta.medication_name) {
      meds.add(meta.medication_name as string);
    }
    if (meta.drug_name) {
      meds.add(meta.drug_name as string);
    }

    // Check if prescription metadata has drug info
    if (meta.prescription) {
      const prescription = meta.prescription as Record<string, unknown>;
      if (prescription.drug_name) {
        meds.add(prescription.drug_name as string);
      }
    }
  });

  return Array.from(meds).filter(Boolean);
}

/**
 * Build fallback patient info when structured data is not available
 */
function buildFallbackPatientInfo(rows: CSVRow[]): PatientInfo {
  const patientId = rows[0]?.patient_id || 'unknown';

  return {
    initials: 'Unknown Patient',
    patientId,
    dob: '1970-01-01',
    initialRxReceivedDate: findFirstRxDate(rows),
    totalFillsPurchased: countPurchases(rows),
    medications: extractMedications(rows),
  };
}
