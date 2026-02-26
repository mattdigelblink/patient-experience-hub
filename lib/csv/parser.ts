/**
 * CSV Parser
 * Wraps PapaParse to parse CSV files and validate structure
 */

import Papa from 'papaparse';
import type { CSVRow } from '@/types/csvJourney';

/**
 * Required columns in the CSV
 */
const REQUIRED_COLUMNS = [
  'id',
  'correlation_id',
  'created',
  'domain',
  'name',
  'source',
  'metadata',
] as const;

/**
 * Parse CSV file text into structured rows
 */
export function parseCSV(csvText: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          validateCSVStructure(results.data);
          resolve(results.data);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Validate that the CSV has all required columns
 */
function validateCSVStructure(rows: CSVRow[]): void {
  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const firstRow = rows[0];
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !(col in firstRow)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `CSV is missing required columns: ${missingColumns.join(', ')}`
    );
  }

  // Warn about large files
  if (rows.length > 1000) {
    console.warn(
      `Large CSV file detected (${rows.length} rows). This may take a moment to process.`
    );
  }
}

/**
 * Safely parse JSON from metadata field
 */
export function safeParseJSON(jsonString: string): Record<string, unknown> {
  if (!jsonString || jsonString.trim() === '') {
    return {};
  }

  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Convert Unix timestamp (milliseconds) to ISO string
 */
export function timestampToISO(timestamp: string): string {
  try {
    const ms = parseInt(timestamp, 10);
    if (isNaN(ms)) {
      return new Date().toISOString();
    }
    return new Date(ms).toISOString();
  } catch {
    return new Date().toISOString();
  }
}
