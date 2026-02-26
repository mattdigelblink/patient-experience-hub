'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, X, ExternalLink } from 'lucide-react';
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Collapse, Tooltip, Chip } from '@mui/material';
import { FeedbackDetailSidebar } from '@/components/feedback';
import {
  BlinkTable,
  BlinkTableBody,
  BlinkTableCell,
  BlinkTableContainer,
  BlinkTableHead,
  BlinkTableRow,
} from '@blink-health/ui-tools/dist/esm/components/mui-combined/BlinkStyledTable';
import { BlinkBadge } from '@blink-health/ui-tools/dist/esm/atoms/badge/BlinkBadge';
import { BlinkTextInput } from '@blink-health/ui-tools/dist/esm/inputs/text';
import BlinkDropdownSelect from '@blink-health/ui-tools/dist/esm/inputs/select/BlinkDropdownSelect';
import { mockFeedbackItems, mockSTLs } from '@/config/dummyData';
import type { FeedbackItem, FeedbackSource } from '@/types/feedback';

const sourceLabels: Record<FeedbackSource, string> = {
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

type DateRangePreset = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_6_months' | 'custom';

interface SearchFilters {
  feedbackId: string;
  sources: FeedbackSource[];
  hasSTL: string; // 'all' | 'assigned' | 'unassigned'
  ratingMin: string;
  ratingMax: string;
  dateRangePreset: DateRangePreset;
  dateStart: string;
  dateEnd: string;
  patientId: string;
  program: string; // Program filter
}

// Helper to get date range based on preset
const getDateRangeFromPreset = (preset: DateRangePreset): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      break;
    case 'last_30_days':
      start.setDate(start.getDate() - 30);
      break;
    case 'last_90_days':
      start.setDate(start.getDate() - 90);
      break;
    case 'last_6_months':
      start.setMonth(start.getMonth() - 6);
      break;
    case 'custom':
      return { start: '', end: '' };
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const initialFilters: SearchFilters = {
  feedbackId: '',
  sources: [],
  hasSTL: 'all',
  ratingMin: '',
  ratingMax: '',
  dateRangePreset: 'last_7_days',
  dateStart: getDateRangeFromPreset('last_7_days').start,
  dateEnd: getDateRangeFromPreset('last_7_days').end,
  patientId: '',
  program: '',
};

export default function SearchFeedbackPage() {
  const router = useRouter();
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Expand/collapse sections
  const [identifiersExpanded, setIdentifiersExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Mock assigned STLs (in real app, this would come from backend)
  const feedbackWithSTL = useMemo(() => {
    return mockFeedbackItems.map((item, idx) => ({
      ...item,
      assignedSTL: idx % 3 === 0 ? mockSTLs[idx % mockSTLs.length].name : undefined,
    }));
  }, []);

  // Selected feedback for sidebar
  const selectedFeedback = useMemo(
    () => allFeedback.find((f) => f.id === selectedFeedbackId),
    [allFeedback, selectedFeedbackId]
  );

  useEffect(() => {
    setAllFeedback(feedbackWithSTL);
    setIsLoading(false);
  }, [feedbackWithSTL]);

  const filteredFeedback = useMemo(() => {
    return allFeedback.filter((item) => {
      // Feedback ID filter
      if (filters.feedbackId && !item.id.toLowerCase().includes(filters.feedbackId.toLowerCase())) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) {
        return false;
      }

      // STL assignment filter
      if (filters.hasSTL === 'assigned' && !item.assignedSTL) {
        return false;
      }
      if (filters.hasSTL === 'unassigned' && item.assignedSTL) {
        return false;
      }

      // Rating filter
      if (item.rating && item.maxRating) {
        const normalizedRating = (item.rating / item.maxRating) * 10; // Normalize to 0-10 scale
        if (filters.ratingMin && normalizedRating < parseFloat(filters.ratingMin)) {
          return false;
        }
        if (filters.ratingMax && normalizedRating > parseFloat(filters.ratingMax)) {
          return false;
        }
      }

      // Date filter
      if (filters.dateStart || filters.dateEnd) {
        const feedbackTime = new Date(item.timestamp).getTime();
        if (filters.dateStart) {
          const startTime = new Date(filters.dateStart).getTime();
          if (feedbackTime < startTime) return false;
        }
        if (filters.dateEnd) {
          const endTime = new Date(filters.dateEnd).getTime();
          if (feedbackTime > endTime) return false;
        }
      }

      // Patient ID filter
      if (filters.patientId && (!item.metadata.patientId || !item.metadata.patientId.toLowerCase().includes(filters.patientId.toLowerCase()))) {
        return false;
      }

      // Program filter
      if (filters.program && item.metadata.program !== filters.program) {
        return false;
      }

      return true;
    });
  }, [allFeedback, filters]);

  const handleSourceToggle = (source: FeedbackSource) => {
    setFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  };

  const handleDatePresetChange = (preset: DateRangePreset) => {
    const dateRange = getDateRangeFromPreset(preset);
    setFilters((prev) => ({
      ...prev,
      dateRangePreset: preset,
      dateStart: dateRange.start,
      dateEnd: dateRange.end,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.feedbackId) count++;
    if (filters.sources.length > 0) count++;
    if (filters.hasSTL !== 'all') count++;
    if (filters.ratingMin || filters.ratingMax) count++;
    if (filters.dateStart || filters.dateEnd) count++;
    if (filters.patientId) count++;
    if (filters.program) count++;
    return count;
  }, [filters]);

  const getRatingDisplay = (item: FeedbackItem): string => {
    if (!item.rating || !item.maxRating) return '—';
    return `${item.rating}/${item.maxRating}`;
  };

  const getRatingColor = (item: FeedbackItem): { bg: string; text: string } => {
    if (!item.rating || !item.maxRating) return { bg: '#f3f4f6', text: '#6b7280' };
    const percentage = (item.rating / item.maxRating) * 100;
    if (percentage < 30) return { bg: '#fee2e2', text: '#dc2626' };
    if (percentage < 50) return { bg: '#fed7aa', text: '#ea580c' };
    if (percentage < 70) return { bg: '#fef3c7', text: '#ca8a04' };
    return { bg: '#d1fae5', text: '#059669' };
  };

  const getDateRangeLabel = (preset: DateRangePreset): string => {
    switch (preset) {
      case 'last_7_days': return 'Last 7 Days';
      case 'last_30_days': return 'Last 30 Days';
      case 'last_90_days': return 'Last 90 Days';
      case 'last_6_months': return 'Last 6 Months';
      case 'custom': return `${filters.dateStart && new Date(filters.dateStart).toLocaleDateString()} - ${filters.dateEnd && new Date(filters.dateEnd).toLocaleDateString()}`;
      default: return '';
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        transition: 'padding-right 0.3s ease',
        ...(isSidebarOpen ? { pr: { lg: '408px' } } : {}), // 384px sidebar + 24px padding
      }}
    >
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>
          Search Feedback
        </Box>
      </Box>

      {/* Search Trigger Bar */}
      <Box
        onClick={() => setModalOpen(true)}
        sx={{
          backgroundColor: '#fff',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          p: 2,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          mb: 2,
          '&:hover': {
            borderColor: '#3b82f6',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Search size={20} color="#9ca3af" />
          <Box sx={{ flex: 1, color: '#6b7280', fontSize: '0.938rem' }}>
            {activeFilterCount > 0
              ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`
              : 'Click to search feedback...'}
          </Box>
          <ChevronDown size={20} color="#9ca3af" />
        </Box>
      </Box>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.feedbackId && (
            <Chip
              label={`Feedback ID: ${filters.feedbackId}`}
              variant="outlined"
              onDelete={() => setFilters({ ...filters, feedbackId: '' })}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          )}
          {filters.patientId && (
            <Chip
              label={`Patient ID: ${filters.patientId}`}
              variant="outlined"
              onDelete={() => setFilters({ ...filters, patientId: '' })}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          )}
          {filters.sources.map((source) => (
            <Chip
              key={source}
              label={sourceLabels[source]}
              variant="outlined"
              onDelete={() => handleSourceToggle(source)}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          ))}
          {filters.hasSTL !== 'all' && (
            <Chip
              label={`STL: ${filters.hasSTL === 'assigned' ? 'Assigned' : 'Unassigned'}`}
              variant="outlined"
              onDelete={() => setFilters({ ...filters, hasSTL: 'all' })}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          )}
          {(filters.ratingMin || filters.ratingMax) && (
            <Chip
              label={`Rating: ${filters.ratingMin || '0'}-${filters.ratingMax || '10'}`}
              variant="outlined"
              onDelete={() => setFilters({ ...filters, ratingMin: '', ratingMax: '' })}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          )}
          {(filters.dateStart || filters.dateEnd) && (
            <Chip
              label={`Date: ${getDateRangeLabel(filters.dateRangePreset)}`}
              variant="outlined"
              onDelete={() => setFilters({ ...filters, dateRangePreset: 'custom', dateStart: '', dateEnd: '' })}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          )}
          {filters.program && (
            <Chip
              label={`Program: ${filters.program}`}
              variant="outlined"
              onDelete={() => setFilters({ ...filters, program: '' })}
              sx={{
                height: '32px',
                fontSize: '0.813rem',
                borderColor: '#cbd5e1',
                color: '#475569',
                '& .MuiChip-label': { px: 1.5 },
                '& .MuiChip-deleteIcon': {
                  color: '#94a3b8',
                  '&:hover': { color: '#64748b' },
                },
              }}
            />
          )}
          <Box
            onClick={clearFilters}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 2,
              py: 0.75,
              color: '#dc2626',
              borderRadius: '6px',
              fontSize: '0.813rem',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#fee2e2',
              },
            }}
          >
            Clear All
          </Box>
        </Box>
      )}

      {/* Results Count */}
      <Box sx={{ mb: 2, fontSize: '0.875rem', color: '#6b7280' }}>
        Showing {filteredFeedback.length} of {allFeedback.length} feedback items
      </Box>

      {/* Search Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '48rem',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', pb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Search Feedback</Box>
              <Box sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5 }}>Filter by identifiers, sources, or ratings</Box>
            </Box>
            <IconButton onClick={() => setModalOpen(false)} size="small" sx={{ color: '#64748b' }}>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, backgroundColor: '#f8fafc' }}>
          {/* Identifiers Section */}
          <Box sx={{ mb: 3, mt: 2 }}>
            <Box
              onClick={() => setIdentifiersExpanded(!identifiersExpanded)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                mb: 2,
                pb: 1.5,
                borderBottom: '2px solid #e2e8f0',
                '&:hover': {
                  borderBottomColor: '#cbd5e1',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Box sx={{ width: '3px', height: '16px', backgroundColor: '#dc384d', borderRadius: '2px' }} />
                Identifiers
              </Box>
              {identifiersExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </Box>

            <Collapse in={identifiersExpanded}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 2.5, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <BlinkTextInput
                  fullWidth
                  size="small"
                  label="Feedback ID"
                  value={filters.feedbackId}
                  onChange={(e) => setFilters({ ...filters, feedbackId: e.target.value })}
                  placeholder="e.g., fb-001"
                />

                <BlinkTextInput
                  fullWidth
                  size="small"
                  label="Patient ID"
                  value={filters.patientId}
                  onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
                  placeholder="e.g., p-99001"
                />
              </Box>
            </Collapse>
          </Box>

          {/* Filters Section */}
          <Box sx={{ mb: 2 }}>
            <Box
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                mb: 2,
                pb: 1.5,
                borderBottom: '2px solid #e2e8f0',
                '&:hover': {
                  borderBottomColor: '#cbd5e1',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Box sx={{ width: '3px', height: '16px', backgroundColor: '#7c3aed', borderRadius: '2px' }} />
                Filters
              </Box>
              {filtersExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </Box>

            <Collapse in={filtersExpanded}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 2.5, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                {/* Source */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', mb: 1.5 }}>Source</Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(Object.keys(sourceLabels) as FeedbackSource[]).map((source) => (
                      <Box
                        key={source}
                        onClick={() => handleSourceToggle(source)}
                        sx={{
                          px: 2,
                          py: 0.75,
                          fontSize: '0.813rem',
                          fontWeight: 500,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          backgroundColor: filters.sources.includes(source) ? '#7c3aed' : '#fff',
                          color: filters.sources.includes(source) ? '#fff' : '#64748b',
                          border: `1px solid ${filters.sources.includes(source) ? '#7c3aed' : '#e2e8f0'}`,
                          '&:hover': {
                            backgroundColor: filters.sources.includes(source) ? '#6d28d9' : '#f1f5f9',
                          },
                        }}
                      >
                        {sourceLabels[source]}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* STL Assignment */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', mb: 1.5 }}>STL Assignment</Box>
                  <BlinkDropdownSelect
                    fullWidth
                    size="small"
                    value={filters.hasSTL}
                    onChange={(value) => setFilters({ ...filters, hasSTL: value as string })}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'assigned', label: 'Assigned' },
                      { value: 'unassigned', label: 'Unassigned' },
                    ]}
                  />
                </Box>

                {/* Program */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', mb: 1.5 }}>Program</Box>
                  <BlinkDropdownSelect
                    fullWidth
                    size="small"
                    value={filters.program}
                    onChange={(value) => setFilters({ ...filters, program: value as string })}
                    options={[
                      { value: '', label: 'All Programs' },
                      { value: 'Tarsus', label: 'Tarsus' },
                      { value: 'Bausch and Lomb', label: 'Bausch and Lomb' },
                      { value: 'ARS', label: 'ARS' },
                      { value: 'Shield', label: 'Shield' },
                    ]}
                  />
                </Box>

                {/* Rating Range */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <BlinkTextInput
                    fullWidth
                    size="small"
                    type="number"
                    label="Min Rating (0-10 scale)"
                    value={filters.ratingMin}
                    onChange={(e) => setFilters({ ...filters, ratingMin: e.target.value })}
                    placeholder="e.g., 0"
                  />
                  <BlinkTextInput
                    fullWidth
                    size="small"
                    type="number"
                    label="Max Rating (0-10 scale)"
                    value={filters.ratingMax}
                    onChange={(e) => setFilters({ ...filters, ratingMax: e.target.value })}
                    placeholder="e.g., 10"
                  />
                </Box>

                {/* Date Range Preset */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', mb: 1.5 }}>Date Range</Box>
                  <BlinkDropdownSelect
                    fullWidth
                    size="small"
                    value={filters.dateRangePreset}
                    onChange={(value) => handleDatePresetChange(value as DateRangePreset)}
                    options={[
                      { value: 'last_7_days', label: 'Last 7 Days' },
                      { value: 'last_30_days', label: 'Last 30 Days' },
                      { value: 'last_90_days', label: 'Last 90 Days' },
                      { value: 'last_6_months', label: 'Last 6 Months' },
                      { value: 'custom', label: 'Custom Date Range' },
                    ]}
                  />
                </Box>

                {/* Custom Date Range (only show when custom is selected) */}
                {filters.dateRangePreset === 'custom' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <BlinkTextInput
                      fullWidth
                      size="small"
                      type="date"
                      label="Start Date"
                      value={filters.dateStart}
                      onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                    />
                    <BlinkTextInput
                      fullWidth
                      size="small"
                      type="date"
                      label="End Date"
                      value={filters.dateEnd}
                      onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                    />
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        </DialogContent>

        <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <Box
            onClick={clearFilters}
            sx={{ fontSize: '0.875rem', color: '#64748b', cursor: 'pointer', '&:hover': { color: '#0f172a' } }}
          >
            Clear all
          </Box>
          <Box
            onClick={() => setModalOpen(false)}
            sx={{
              px: 3,
              py: 1.5,
              backgroundColor: '#dc384d',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#b91c2e' },
            }}
          >
            Apply Filters
          </Box>
        </Box>
      </Dialog>

      {/* Table */}
      <BlinkTableContainer sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', mt: 3, mx: 3 }}>
        <BlinkTable>
          <BlinkTableHead sx={{ backgroundColor: '#fff' }}>
            <BlinkTableRow>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Feedback ID</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Text Snippet</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Source</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Assigned STL</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Program</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Rating</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Patient Journey</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Patient Profile</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Date</BlinkTableCell>
            </BlinkTableRow>
          </BlinkTableHead>
          <BlinkTableBody>
            {isLoading ? (
              <BlinkTableRow>
                <BlinkTableCell colSpan={9} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                  Loading feedback...
                </BlinkTableCell>
              </BlinkTableRow>
            ) : filteredFeedback.length === 0 ? (
              <BlinkTableRow>
                <BlinkTableCell colSpan={9} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                  No feedback matches your filters
                </BlinkTableCell>
              </BlinkTableRow>
            ) : (
              filteredFeedback.map((feedback) => {
                const ratingColors = getRatingColor(feedback);
                return (
                  <BlinkTableRow
                    key={feedback.id}
                    onClick={() => {
                      setSelectedFeedbackId(feedback.id);
                      setIsSidebarOpen(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: feedback.id === selectedFeedbackId ? '#f0fdf4' : '#fff',
                      '&:hover': {
                        backgroundColor: feedback.id === selectedFeedbackId ? '#dcfce7' : '#f9fafb',
                      },
                    }}
                  >
                    {/* Feedback ID */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      <Box sx={{ fontSize: '0.875rem', color: '#374151', fontFamily: 'monospace' }}>
                        {feedback.id}
                      </Box>
                    </BlinkTableCell>

                    {/* Text Snippet */}
                    <BlinkTableCell sx={{ px: 4, py: 4, maxWidth: '400px' }}>
                      <Box sx={{ fontSize: '0.875rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {feedback.verbatim}
                      </Box>
                    </BlinkTableCell>

                    {/* Source */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      <BlinkBadge
                        text={sourceLabels[feedback.source]}
                        customBgColor="#eff6ff"
                        customColor="#1e40af"
                        sx={{
                          height: '24px',
                          fontSize: '0.688rem',
                          letterSpacing: '0.025em',
                          '& .MuiChip-label': {
                            padding: '0 8px',
                          },
                        }}
                      />
                    </BlinkTableCell>

                    {/* Assigned STL */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      <Box sx={{ fontSize: '0.875rem', color: '#374151' }}>
                        {feedback.assignedSTL || '—'}
                      </Box>
                    </BlinkTableCell>

                    {/* Program */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      <Box sx={{ fontSize: '0.875rem', color: '#374151' }}>
                        {feedback.metadata.program || '—'}
                      </Box>
                    </BlinkTableCell>

                    {/* Rating */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      <BlinkBadge
                        text={getRatingDisplay(feedback)}
                        customBgColor={ratingColors.bg}
                        customColor={ratingColors.text}
                        sx={{
                          height: '24px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          letterSpacing: '0.025em',
                          '& .MuiChip-label': {
                            padding: '0 8px',
                          },
                        }}
                      />
                    </BlinkTableCell>

                    {/* Patient Journey Link */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      {feedback.metadata.journeyId ? (
                        <Link
                          href={`/journey/${feedback.metadata.journeyId}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '0.875rem',
                              color: '#2563eb',
                              '&:hover': { color: '#1d4ed8', textDecoration: 'underline' },
                            }}
                          >
                            View
                            <ExternalLink size={12} />
                          </Box>
                        </Link>
                      ) : (
                        <Box sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>—</Box>
                      )}
                    </BlinkTableCell>

                    {/* Patient Profile Link */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      {feedback.metadata.patientId ? (
                        <a
                          href={`https://rxos.blinkhealth.com/patient/${feedback.metadata.patientId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '0.875rem',
                              color: '#059669',
                              '&:hover': { color: '#047857', textDecoration: 'underline' },
                            }}
                          >
                            View
                            <ExternalLink size={12} />
                          </Box>
                        </a>
                      ) : (
                        <Box sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>—</Box>
                      )}
                    </BlinkTableCell>

                    {/* Date */}
                    <BlinkTableCell sx={{ px: 4, py: 4 }}>
                      <Box sx={{ fontSize: '0.875rem', color: '#374151' }}>
                        {new Date(feedback.timestamp).toLocaleDateString()}
                      </Box>
                    </BlinkTableCell>
                  </BlinkTableRow>
                );
              })
            )}
          </BlinkTableBody>
        </BlinkTable>
      </BlinkTableContainer>

      {/* Feedback Detail Sidebar */}
      <FeedbackDetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        feedback={selectedFeedback || null}
      />
    </Box>
  );
}
