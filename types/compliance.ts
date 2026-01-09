/**
 * Employee Compliance Module - Core Types
 */

// ============================================
// Employee
// ============================================

export interface Employee {
  id: string;
  email: string;
  name: string;
  team: string;
  department: string;
  managerId?: string;
  managerEmail?: string;
  isActive: boolean;
}

// ============================================
// Journey Assignment
// ============================================

export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface JourneyAssignment {
  id: string;
  employeeId: string;
  employeeEmail: string;
  journeyId: string;
  monthYear: string; // Format: "2026-01"
  status: AssignmentStatus;
  
  // Progress tracking
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  
  // Completion requirements
  viewedFullJourney: boolean;
  listenedToAudio: boolean;
  submittedNotes: boolean;
  noteId?: string;
  
  // Time spent
  timeSpentSeconds?: number;
}

// ============================================
// Monthly Compliance
// ============================================

export interface MonthlyComplianceStats {
  monthYear: string;
  totalEmployees: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  skippedCount: number;
  complianceRate: number; // percentage
}

export interface TeamComplianceStats {
  team: string;
  totalEmployees: number;
  completedCount: number;
  complianceRate: number;
  avgTimeSpentSeconds: number;
}

export interface EmployeeComplianceRecord {
  employee: Employee;
  monthYear: string;
  assignment?: JourneyAssignment;
  status: AssignmentStatus;
  completedAt?: string;
}

// ============================================
// Compliance Report
// ============================================

export interface ComplianceReport {
  monthYear: string;
  generatedAt: string;
  generatedBy: string;
  
  overallStats: MonthlyComplianceStats;
  teamStats: TeamComplianceStats[];
  
  incompleteEmployees: EmployeeComplianceRecord[];
  completedEmployees: EmployeeComplianceRecord[];
}

// ============================================
// Filters
// ============================================

export interface ComplianceFilters {
  monthYear?: string;
  team?: string[];
  department?: string[];
  status?: AssignmentStatus[];
  managerId?: string;
}

