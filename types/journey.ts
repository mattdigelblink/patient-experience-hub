/**
 * Journey Observation Tool - Core Types
 */

// ============================================
// Event Types
// ============================================

export type EventType =
  | 'sms'
  | 'email'
  | 'voice_broadcast'
  | 'call'
  | 'chat'
  | 'screen_view'
  | 'survey'
  | 'system_log'
  | 'mixpanel_event'
  | 'rxos_activity'
  | 'prior_auth_activity';

export type SurveyType = 'nps' | 'csat' | 'dnpu';

export type JourneyStatus = 
  | 'new'
  | 'discovery'
  | 'intake'
  | 'onboarding'
  | 'escalated'
  | 'cost_review'
  | 'rph_review'
  | 'rejected'
  | 'transfer'
  | 'dispense'
  | 'dispense_review'
  | 'package'
  | 'processed'
  | 'completed'
  | 'reprocess'
  | 'on_hold'
  | 'closed'
  | 'done'
  | 'cancelled';

export type JourneyCategory =
  | 'successful_purchase_delivery'
  | 'successful_purchase_no_delivery'
  | 'no_purchase';

export type Platform = 'ios' | 'android' | 'web';

// ============================================
// Event Content Types
// ============================================

export interface SMSContent {
  body: string;
  direction: 'inbound' | 'outbound';
  phoneNumber?: string;
}

export interface EmailContent {
  subject: string;
  body: string;
  preview: string;
  direction: 'inbound' | 'outbound';
  from?: string;
  to?: string;
}

export interface VoiceBroadcastContent {
  transcript: string;
  audioUrl?: string;
  duration: number; // seconds
}

export interface CallContent {
  transcript: string;
  audioUrl?: string;
  levelAiUrl?: string;
  duration: number; // seconds
  direction: 'inbound' | 'outbound';
  agentName?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'agent' | 'bot';
  senderName?: string;
  message: string;
  timestamp: string;
}

export interface ChatContent {
  messages: ChatMessage[];
  agentName?: string;
  resolved: boolean;
}

export interface ScreenViewContent {
  screenName: string;
  screenshotUrl?: string;
  sessionId?: string;
  eventProperties?: Record<string, unknown>;
}

export interface SurveyQuestion {
  question: string;
  answer: string | number;
  type: 'rating' | 'text' | 'multiple_choice';
  maxRating?: number;
}

export interface SurveyContent {
  surveyType: SurveyType;
  rating: number;
  maxRating: number;
  verbatim?: string;
  question?: string;
  additionalQuestions?: SurveyQuestion[];
}

export interface SystemLogContent {
  message: string;
  statusCode?: number;
  endpoint?: string;
  requestId?: string;
  stackTrace?: string;
}

export interface MixpanelEventContent {
  eventName: string;
  properties: Record<string, unknown>;
  distinctId?: string;
}

export type RxOSActivityType = 
  | 'order_created'
  | 'order_updated'
  | 'price_published'
  | 'prescription_received'
  | 'prescription_transferred'
  | 'pharmacist_review'
  | 'pharmacist_action'
  | 'fulfillment_started'
  | 'fulfillment_completed'
  | 'shipment_created'
  | 'shipment_picked_up'
  | 'shipment_in_transit'
  | 'shipment_delivered'
  | 'prior_auth_required'
  | 'prior_auth_submitted'
  | 'prior_auth_approved'
  | 'prior_auth_denied'
  | 'insurance_billed'
  | 'insurance_rejected'
  | 'refill_reminder_sent'
  | 'manual_review_required'
  | 'patient_outreach';

export interface RxOSActivityContent {
  activityType: RxOSActivityType;
  description: string;
  actor?: string; // e.g., "System", "PharmacistJohnD", "FulfillmentBot"
  orderId?: string;
  prescriptionId?: string;
  details?: Record<string, unknown>;
}

export type PriorAuthActivityType =
  | 'pa_initiated'
  | 'pa_submitted'
  | 'pa_pending_review'
  | 'pa_additional_info_requested'
  | 'pa_approved'
  | 'pa_denied'
  | 'pa_appeal_submitted'
  | 'pa_appeal_approved'
  | 'pa_appeal_denied'
  | 'pa_expired';

export interface PriorAuthActivityContent {
  activityType: PriorAuthActivityType;
  description: string;
  insurerName?: string;
  paNumber?: string;
  actor?: string;
  reason?: string;
  expirationDate?: string;
  details?: Record<string, unknown>;
}

export type EventContent =
  | SMSContent
  | EmailContent
  | VoiceBroadcastContent
  | CallContent
  | ChatContent
  | ScreenViewContent
  | SurveyContent
  | SystemLogContent
  | MixpanelEventContent
  | RxOSActivityContent
  | PriorAuthActivityContent;

// ============================================
// Error Indicators
// ============================================

export interface ErrorIndicator {
  type: 'api_error' | 'delivery_failure' | 'timeout' | 'validation_error';
  statusCode?: number;
  message: string;
  severity: 'warning' | 'error' | 'critical';
}

// ============================================
// Event Metadata
// ============================================

export interface EventMetadata {
  source: string;
  sessionId?: string;
  deviceId?: string;
  correlationId?: string;
  raw?: Record<string, unknown>;
}

// ============================================
// Journey Event
// ============================================

export interface JourneyEvent {
  id: string;
  type: EventType;
  timestamp: string;
  content: EventContent;
  metadata: EventMetadata;
  errorIndicators?: ErrorIndicator[];
}

// ============================================
// Journey Metadata
// ============================================

export interface JourneyMetadata {
  drug: string;
  drugNdc?: string;
  pharmacy: string;
  pharmacyId?: string;
  platform: Platform;
  appVersion?: string;
  deviceType?: string;
  insurance?: string;
  insuranceType?: 'commercial' | 'medicare' | 'medicaid' | 'cash';
  state: string;
  zipCode?: string;
  mixpanelSessionIds?: string[];
}

// ============================================
// Patient Information
// ============================================

export interface PatientInfo {
  initials: string; // e.g., "J***n D**"
  patientId: string; // e.g., "4199227"
  accountId?: string; // e.g., "5772527186755116219" - only exists after account creation
  dob: string; // ISO date string
  gender?: 'M' | 'F' | 'Other'; // Patient gender
  phoneNumber?: string; // Patient phone number
  initialRxReceivedDate: string; // ISO date string
  totalFillsPurchased: number;
  medications: string[]; // All meds the patient has taken
}

// ============================================
// Journey Milestone Timestamps
// ============================================

export type JourneyType = 'first_fill' | 'refill';

export interface FirstFillMilestones {
  initialCommDelivered?: string;
  patientActed?: string;
  createdAccount?: string;
  addedMedToCart?: string;
  purchased?: string;
  shipped?: string;
  delivered?: string;
}

export interface RefillMilestones {
  refillPricePublished?: string;
  refillCommDelivered?: string;
  addedMedToCart?: string;
  purchased?: string;
  shipped?: string;
  delivered?: string;
}

// ============================================
// Journey
// ============================================

export type Program = 'Tarsus' | 'Bausch and Lomb' | 'ARS' | 'Shield';

export type JourneyStep = 
  | 'initial_comm_delivered'
  | 'patient_acted'
  | 'created_account'
  | 'added_med_to_cart'
  | 'purchased'
  | 'shipped'
  | 'delivered'
  | 'refill_price_published'
  | 'refill_comm_delivered';

export interface Journey {
  id: string;
  patientId: string;
  orderId?: string;
  rxosOrderUrl?: string;
  status: JourneyStatus;
  category: JourneyCategory;
  journeyType: JourneyType;
  programs: Program[];
  metadata: JourneyMetadata;
  patientInfo: PatientInfo;
  milestones: FirstFillMilestones | RefillMilestones;
  events: JourneyEvent[];
  startTime: string;
  endTime?: string;
  lastActivityTime: string;
}

// ============================================
// Employee Note
// ============================================

export interface EmployeeNote {
  id: string;
  journeyId: string;
  employeeId: string;
  employeeEmail: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  feedbackItemId?: string; // Link to Patient Feedback Center
}

// ============================================
// Journey Filters
// ============================================

export interface JourneyFilters {
  search?: string;
  category?: JourneyCategory[];
  status?: JourneyStatus[];
  platform?: Platform[];
  drug?: string[];
  pharmacy?: string[];
  insuranceType?: string[];
  state?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// Pagination
// ============================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// Type Guards
// ============================================

export function isSMSContent(content: EventContent): content is SMSContent {
  return 'body' in content && 'direction' in content && !('subject' in content);
}

export function isEmailContent(content: EventContent): content is EmailContent {
  return 'subject' in content && 'body' in content;
}

export function isVoiceBroadcastContent(content: EventContent): content is VoiceBroadcastContent {
  return 'transcript' in content && 'duration' in content && !('direction' in content);
}

export function isCallContent(content: EventContent): content is CallContent {
  return 'transcript' in content && 'duration' in content && 'direction' in content;
}

export function isChatContent(content: EventContent): content is ChatContent {
  return 'messages' in content && Array.isArray((content as ChatContent).messages);
}

export function isScreenViewContent(content: EventContent): content is ScreenViewContent {
  return 'screenName' in content;
}

export function isSurveyContent(content: EventContent): content is SurveyContent {
  return 'surveyType' in content && 'rating' in content;
}

export function isSystemLogContent(content: EventContent): content is SystemLogContent {
  return 'message' in content && ('statusCode' in content || 'endpoint' in content);
}

export function isMixpanelEventContent(content: EventContent): content is MixpanelEventContent {
  return 'eventName' in content && 'properties' in content;
}

export function isRxOSActivityContent(content: EventContent): content is RxOSActivityContent {
  return 'activityType' in content && 'description' in content && !('insurerName' in content) && !('paNumber' in content);
}

export function isPriorAuthActivityContent(content: EventContent): content is PriorAuthActivityContent {
  return 'activityType' in content && 'description' in content && ('insurerName' in content || 'paNumber' in content);
}

