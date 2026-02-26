import type { FeedbackItem, FeedbackSource } from '@/types/feedback';

/**
 * Get human-readable label for feedback source
 */
export const getSourceLabel = (source: FeedbackSource): string => {
  const labels: Record<FeedbackSource, string> = {
    nps: 'NPS Survey',
    csat: 'CSAT Survey',
    app_store: 'App Store',
    google_play: 'Google Play',
    trustpilot: 'Trustpilot',
    dnpu: 'DNPU Survey',
    agent_flagged_call: 'Agent Call',
    agent_flagged_chat: 'Agent Chat',
    agent_flagged_email: 'Agent Email',
    employee_observation: 'Employee Observation',
  };
  return labels[source] || source;
};

/**
 * Get rating display string (e.g., "3/5" or "—")
 */
export const getRatingDisplay = (item: FeedbackItem): string => {
  if (!item.rating || !item.maxRating) return '—';
  return `${item.rating}/${item.maxRating}`;
};

/**
 * Get background and text color for rating badge based on percentage
 */
export const getRatingColor = (item: FeedbackItem): { bg: string; text: string } => {
  if (!item.rating || !item.maxRating) return { bg: '#f3f4f6', text: '#6b7280' };
  const percentage = (item.rating / item.maxRating) * 100;
  if (percentage < 30) return { bg: '#fee2e2', text: '#dc2626' };
  if (percentage < 50) return { bg: '#fed7aa', text: '#ea580c' };
  if (percentage < 70) return { bg: '#fef3c7', text: '#ca8a04' };
  return { bg: '#d1fae5', text: '#059669' };
};

/**
 * Check if feedback source allows linking to patient profile
 * Public review sources (App Store, Google Play, Trustpilot) cannot be linked to patients
 */
export const canLinkToPatient = (source: FeedbackSource): boolean => {
  return !['app_store', 'google_play', 'trustpilot'].includes(source);
};
