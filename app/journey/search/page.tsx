'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Info, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Checkbox,
  FormControlLabel,
  Collapse,
  IconButton,
  InputAdornment,
} from '@mui/material';
// Direct imports from ui-tools to avoid loading entire library
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
import { generateMockJourneys, STATES, PROGRAMS } from '@/config/dummyData';
import type { Journey, JourneyCategory, Program, FirstFillMilestones, RefillMilestones } from '@/types/journey';

const categoryLabels: Record<JourneyCategory, string> = {
  successful_purchase_delivery: 'Purchase + Delivery',
  successful_purchase_no_delivery: 'Purchase, No Delivery',
  no_purchase: 'No Purchase',
};

// Mock data for common medications
const COMMON_MEDICATIONS = [
  'Lipitor (Atorvastatin)',
  'Metformin',
  'Lisinopril',
  'Levothyroxine',
  'Amlodipine',
  'Metoprolol',
  'Omeprazole',
  'Simvastatin',
  'Losartan',
  'Gabapentin',
  'Hydrochlorothiazide',
  'Sertraline',
  'Montelukast',
  'Furosemide',
  'Pantoprazole',
  'Clopidogrel',
  'Escitalopram',
  'Rosuvastatin',
  'Tamsulosin',
  'Trazodone',
  'Albuterol',
  'Prednisone',
  'Amoxicillin',
  'Azithromycin',
  'Ibuprofen',
].sort();

interface SearchFilters {
  // Identifiers
  patientId: string;
  orderId: string;
  accountId: string;
  // Scenario Variables
  ageMin: string;
  ageMax: string;
  states: string[];
  medications: string[];
  categories: JourneyCategory[];
  programs: Program[];
  hasPurchased: string;
  numRefills: string;
  numRenewals: string;
  insuranceType: string;
  hasNegativeFeedback: string;
  experiencedPriorAuth: boolean;
  experiencedPricingDelay: boolean;
  dateRangeStart: string;
  dateRangeEnd: string;
}

// Helper to get current journey step from milestones
function getCurrentJourneyStep(journey: Journey): string {
  const isFirstFill = journey.journeyType === 'first_fill';
  const milestones = journey.milestones;

  if (isFirstFill) {
    const m = milestones as FirstFillMilestones;
    if (m.delivered) return 'Delivered';
    if (m.shipped) return 'Shipped';
    if (m.purchased) return 'Purchased';
    if (m.addedMedToCart) return 'Added Med To Cart';
    if (m.createdAccount) return 'Created Account';
    if (m.patientActed) return 'Patient Acted';
    if (m.initialCommDelivered) return 'Initial Comm Delivered';
    return 'Not Started';
  } else {
    const m = milestones as RefillMilestones;
    if (m.delivered) return 'Delivered';
    if (m.shipped) return 'Shipped';
    if (m.purchased) return 'Purchased';
    if (m.addedMedToCart) return 'Added Med To Cart';
    if (m.refillCommDelivered) return 'Refill Comm Delivered';
    if (m.refillPricePublished) return 'Refill Price Published';
    return 'Not Started';
  }
}

// Helper to calculate age from DOB
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper to count contacts (chat, inbound calls, emails, inbound texts)
function countContacts(journey: Journey): number {
  return journey.events.filter(event => {
    if (event.type === 'chat') return true;
    if (event.type === 'email') return true;
    if (event.type === 'call' && 'direction' in event.content && event.content.direction === 'inbound') return true;
    if (event.type === 'sms' && 'direction' in event.content && event.content.direction === 'inbound') return true;
    return false;
  }).length;
}

// Helper to check for negative feedback (low NPS, negative surveys, frustration indicators)
function hasNegativeFeedback(journey: Journey): boolean {
  return journey.events.some(event => {
    if (event.type === 'survey' && 'score' in event.content) {
      const content = event.content as { surveyType: string; score: number };
      // NPS score of 6 or below is detractor
      if (content.surveyType === 'nps' && content.score <= 6) return true;
      // CSAT score of 2 or below (out of 5) is negative
      if (content.surveyType === 'csat' && content.score <= 2) return true;
      // DNPU score of 2 or below is negative
      if (content.surveyType === 'dnpu' && content.score <= 2) return true;
    }
    // Check for escalated calls or chats
    if ((event.type === 'call' || event.type === 'chat') && 'sentiment' in event.content) {
      const sentiment = (event.content as { sentiment?: string }).sentiment;
      if (sentiment === 'negative' || sentiment === 'frustrated') return true;
    }
    return false;
  });
}

// Helper to count total events
function countTotalEvents(journey: Journey): number {
  return journey.events.length;
}

export default function JourneyListPage() {
  const router = useRouter();
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    patientId: '',
    orderId: '',
    accountId: '',
    ageMin: '',
    ageMax: '',
    states: [],
    medications: [],
    categories: [],
    programs: [],
    hasPurchased: '',
    numRefills: '',
    numRenewals: '',
    insuranceType: '',
    hasNegativeFeedback: '',
    experiencedPriorAuth: false,
    experiencedPricingDelay: false,
    dateRangeStart: '',
    dateRangeEnd: '',
  });

  const [identifiersExpanded, setIdentifiersExpanded] = useState(true);
  const [scenarioExpanded, setScenarioExpanded] = useState(true);

  // State search for multi-select
  const [stateSearch, setStateSearch] = useState('');
  const filteredStates = useMemo(() => {
    if (!stateSearch) return STATES;
    return STATES.filter(state =>
      state.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

  // Medication search for multi-select
  const [medicationSearch, setMedicationSearch] = useState('');
  const filteredMedications = useMemo(() => {
    if (!medicationSearch) return COMMON_MEDICATIONS;
    return COMMON_MEDICATIONS.filter(med =>
      med.toLowerCase().includes(medicationSearch.toLowerCase())
    );
  }, [medicationSearch]);

  // Generate mock journeys on client side only to avoid hydration mismatch
  useEffect(() => {
    setAllJourneys(generateMockJourneys(50));
    setIsLoading(false);
  }, []);

  const filteredJourneys = useMemo(() => {
    return allJourneys.filter((journey) => {
      // Patient ID filter
      if (filters.patientId && !journey.patientId.toLowerCase().includes(filters.patientId.toLowerCase())) {
        return false;
      }

      // Order ID filter
      if (filters.orderId && (!journey.orderId || !journey.orderId.toLowerCase().includes(filters.orderId.toLowerCase()))) {
        return false;
      }

      // Account ID filter (using patientId as proxy)
      if (filters.accountId && !journey.patientId.toLowerCase().includes(filters.accountId.toLowerCase())) {
        return false;
      }

      // Age filter
      const age = calculateAge(journey.patientInfo.dob);
      if (filters.ageMin && age < parseInt(filters.ageMin)) return false;
      if (filters.ageMax && age > parseInt(filters.ageMax)) return false;

      // State filter
      if (filters.states.length > 0 && !filters.states.includes(journey.metadata.state)) {
        return false;
      }

      // Medication filter
      if (filters.medications.length > 0 && !filters.medications.some(med =>
        journey.patientInfo.medications.some(jMed => jMed.toLowerCase().includes(med.toLowerCase()))
      )) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(journey.category)) {
        return false;
      }

      // Program filter
      if (filters.programs.length > 0 && !journey.programs.some(p => filters.programs.includes(p))) {
        return false;
      }

      // Negative feedback filter
      if (filters.hasNegativeFeedback === 'yes' && !hasNegativeFeedback(journey)) {
        return false;
      }
      if (filters.hasNegativeFeedback === 'no' && hasNegativeFeedback(journey)) {
        return false;
      }

      // Date range filter
      if (filters.dateRangeStart || filters.dateRangeEnd) {
        const journeyTime = new Date(journey.lastActivityTime).getTime();
        if (filters.dateRangeStart) {
          const startTime = new Date(filters.dateRangeStart).getTime();
          if (journeyTime < startTime) return false;
        }
        if (filters.dateRangeEnd) {
          const endTime = new Date(filters.dateRangeEnd).getTime();
          if (journeyTime > endTime) return false;
        }
      }

      return true;
    });
  }, [allJourneys, filters]);

  const handleStateToggle = (state: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  };

  const handleMedicationToggle = (medication: string) => {
    setFilters(prev => ({
      ...prev,
      medications: prev.medications.includes(medication)
        ? prev.medications.filter(m => m !== medication)
        : [...prev.medications, medication],
    }));
  };

  const handleCategoryToggle = (category: JourneyCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleProgramToggle = (program: Program) => {
    setFilters(prev => ({
      ...prev,
      programs: prev.programs.includes(program)
        ? prev.programs.filter(p => p !== program)
        : [...prev.programs, program],
    }));
  };

  const removeState = (state: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states.filter(s => s !== state),
    }));
  };

  const removeMedication = (medication: string) => {
    setFilters(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m !== medication),
    }));
  };

  const removeCategory = (category: JourneyCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }));
  };

  const removeProgram = (program: Program) => {
    setFilters(prev => ({
      ...prev,
      programs: prev.programs.filter(p => p !== program),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      patientId: '',
      orderId: '',
      accountId: '',
      ageMin: '',
      ageMax: '',
      states: [],
      medications: [],
      categories: [],
      programs: [],
      hasPurchased: '',
      numRefills: '',
      numRenewals: '',
      insuranceType: '',
      hasNegativeFeedback: '',
      experiencedPriorAuth: false,
      experiencedPricingDelay: false,
      dateRangeStart: '',
      dateRangeEnd: '',
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.patientId) count++;
    if (filters.orderId) count++;
    if (filters.accountId) count++;
    if (filters.ageMin || filters.ageMax) count++;
    if (filters.states.length > 0) count++;
    if (filters.medications.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.programs.length > 0) count++;
    if (filters.hasPurchased) count++;
    if (filters.numRefills) count++;
    if (filters.numRenewals) count++;
    if (filters.insuranceType) count++;
    if (filters.hasNegativeFeedback) count++;
    if (filters.experiencedPriorAuth) count++;
    if (filters.experiencedPricingDelay) count++;
    if (filters.dateRangeStart || filters.dateRangeEnd) count++;
    return count;
  }, [filters]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>
          Search Patient Journeys
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
              : 'Click to search journeys...'}
          </Box>
          <ChevronDown size={20} color="#9ca3af" />
        </Box>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2, fontSize: '0.875rem', color: '#6b7280' }}>
        Showing {filteredJourneys.length} of {allJourneys.length} journeys
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
              <Box sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Search Patient Journeys</Box>
              <Box sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5 }}>Filter by identifiers or scenario variables</Box>
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
                  label="Patient ID"
                  value={filters.patientId}
                  onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
                  placeholder="e.g., P12345"
                />

                <BlinkTextInput
                  fullWidth
                  size="small"
                  label="Order ID"
                  value={filters.orderId}
                  onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
                  placeholder="e.g., ORD-98765"
                />

                <BlinkTextInput
                  fullWidth
                  size="small"
                  label="Account ID"
                  value={filters.accountId}
                  onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                  placeholder="e.g., ACC-54321"
                />
              </Box>
            </Collapse>
          </Box>

          {/* Scenario Variables Section */}
          <Box sx={{ mb: 2 }}>
            <Box
              onClick={() => setScenarioExpanded(!scenarioExpanded)}
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
                Scenario Variables
              </Box>
              {scenarioExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </Box>

            <Collapse in={scenarioExpanded}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2.5, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                {/* Age Range */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>Patient Age</Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <BlinkTextInput
                      size="small"
                      label="Min"
                      type="number"
                      value={filters.ageMin}
                      onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                    <Box sx={{ color: '#9ca3af' }}>to</Box>
                    <BlinkTextInput
                      size="small"
                      label="Max"
                      type="number"
                      value={filters.ageMax}
                      onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* State Multi-Select */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>State</Box>
                  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff' }}>
                    <BlinkTextInput
                      fullWidth
                      size="small"
                      placeholder="Search states..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={16} color="#9ca3af" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& fieldset': { border: 'none' },
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    />
                    <Box sx={{ maxHeight: '160px', overflowY: 'auto', p: 1 }}>
                      {filteredStates.map((state) => (
                        <Box key={state} sx={{ '&:hover': { backgroundColor: '#f8fafc' }, borderRadius: '4px', px: 1, py: 0.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={filters.states.includes(state)}
                                onChange={() => handleStateToggle(state)}
                              />
                            }
                            label={state}
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  {filters.states.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                      {filters.states.map((state) => (
                        <Chip
                          key={state}
                          label={state}
                          size="small"
                          onDelete={() => removeState(state)}
                          sx={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Medication Multi-Select */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>Medication</Box>
                  <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff' }}>
                    <BlinkTextInput
                      fullWidth
                      size="small"
                      placeholder="Search medications..."
                      value={medicationSearch}
                      onChange={(e) => setMedicationSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={16} color="#9ca3af" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& fieldset': { border: 'none' },
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    />
                    <Box sx={{ maxHeight: '160px', overflowY: 'auto', p: 1 }}>
                      {filteredMedications.map((med) => (
                        <Box key={med} sx={{ '&:hover': { backgroundColor: '#f8fafc' }, borderRadius: '4px', px: 1, py: 0.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={filters.medications.includes(med)}
                                onChange={() => handleMedicationToggle(med)}
                              />
                            }
                            label={med}
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  {filters.medications.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                      {filters.medications.map((med) => (
                        <Chip
                          key={med}
                          label={med}
                          size="small"
                          onDelete={() => removeMedication(med)}
                          sx={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Category Multi-Select */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>Category</Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {(Object.entries(categoryLabels) as [JourneyCategory, string][]).map(([value, label]) => (
                      <FormControlLabel
                        key={value}
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.categories.includes(value)}
                            onChange={() => handleCategoryToggle(value)}
                          />
                        }
                        label={label}
                      />
                    ))}
                  </Box>
                  {filters.categories.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                      {filters.categories.map((cat) => (
                        <Chip
                          key={cat}
                          label={categoryLabels[cat]}
                          size="small"
                          onDelete={() => removeCategory(cat)}
                          sx={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Program Multi-Select */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>Program</Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {PROGRAMS.map((program) => (
                      <FormControlLabel
                        key={program}
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.programs.includes(program)}
                            onChange={() => handleProgramToggle(program)}
                          />
                        }
                        label={program}
                      />
                    ))}
                  </Box>
                  {filters.programs.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                      {filters.programs.map((program) => (
                        <Chip
                          key={program}
                          label={program}
                          size="small"
                          onDelete={() => removeProgram(program)}
                          sx={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Has Purchased */}
                <BlinkDropdownSelect
                  fullWidth
                  size="small"
                  label="Has Purchased?"
                  options={[
                    { value: '', label: 'Any' },
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ]}
                  value={filters.hasPurchased}
                  onChange={(value) => setFilters({ ...filters, hasPurchased: value as string })}
                  placeholder="Any"
                />

                {/* Number of Refills */}
                <BlinkTextInput
                  fullWidth
                  size="small"
                  label="Number of Refills"
                  type="number"
                  value={filters.numRefills}
                  onChange={(e) => setFilters({ ...filters, numRefills: e.target.value })}
                  placeholder="e.g., 3"
                />

                {/* Number of Renewals */}
                <BlinkTextInput
                  fullWidth
                  size="small"
                  label="Number of Renewals"
                  type="number"
                  value={filters.numRenewals}
                  onChange={(e) => setFilters({ ...filters, numRenewals: e.target.value })}
                  placeholder="e.g., 2"
                />

                {/* Insurance Type */}
                <BlinkDropdownSelect
                  fullWidth
                  size="small"
                  label="Insurance Type"
                  options={[
                    { value: '', label: 'Any' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'medicare', label: 'Medicare' },
                    { value: 'medicaid', label: 'Medicaid' },
                    { value: 'uninsured', label: 'Uninsured' },
                  ]}
                  value={filters.insuranceType}
                  onChange={(value) => setFilters({ ...filters, insuranceType: value as string })}
                  placeholder="Any"
                />

                {/* Negative Feedback */}
                <BlinkDropdownSelect
                  fullWidth
                  size="small"
                  label="Negative Feedback Received?"
                  options={[
                    { value: '', label: 'Any' },
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ]}
                  value={filters.hasNegativeFeedback}
                  onChange={(value) => setFilters({ ...filters, hasNegativeFeedback: value as string })}
                  placeholder="Any"
                />

                {/* Date Range */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>Date Range</Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <BlinkTextInput
                      size="small"
                      label="Start Date"
                      type="date"
                      value={filters.dateRangeStart}
                      onChange={(e) => setFilters({ ...filters, dateRangeStart: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <Box sx={{ color: '#9ca3af' }}>to</Box>
                    <BlinkTextInput
                      size="small"
                      label="End Date"
                      type="date"
                      value={filters.dateRangeEnd}
                      onChange={(e) => setFilters({ ...filters, dateRangeEnd: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>

                {/* Experienced a... */}
                <Box>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mb: 1.5 }}>Experienced a...</Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.experiencedPriorAuth}
                          onChange={(e) => setFilters({ ...filters, experiencedPriorAuth: e.target.checked })}
                          size="small"
                        />
                      }
                      label="Prior Authorization"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.experiencedPricingDelay}
                          onChange={(e) => setFilters({ ...filters, experiencedPricingDelay: e.target.checked })}
                          size="small"
                        />
                      }
                      label="Pricing Delay"
                    />
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', mx: -3, px: 3, pb: 0 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setModalOpen(false)}
              sx={{
                backgroundColor: '#dc384d',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.25,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#c02f44',
                  boxShadow: 'none',
                },
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                clearAllFilters();
                setModalOpen(false);
              }}
              sx={{
                borderColor: '#cbd5e1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.25,
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              Clear All
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <BlinkTableContainer sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', mt: 3, mx: 3 }}>
        <BlinkTable>
          <BlinkTableHead sx={{ backgroundColor: '#fff' }}>
            <BlinkTableRow>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Patient ID</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Patient</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Medications</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Programs</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Journey Step
                  <Tooltip title="Current step in the patient's journey">
                    <Info size={14} color="#9ca3af" />
                  </Tooltip>
                </Box>
              </BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Age</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>State</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Contacts
                  <Tooltip title="Number of patient-initiated contacts (calls, chats, emails, texts)">
                    <Info size={14} color="#9ca3af" />
                  </Tooltip>
                </Box>
              </BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Events
                  <Tooltip title="Total number of events in this journey">
                    <Info size={14} color="#9ca3af" />
                  </Tooltip>
                </Box>
              </BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Initial Rx Received</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>Last Activity</BlinkTableCell>
              <BlinkTableCell sx={{ backgroundColor: '#fff', px: 4, py: 4, fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Negative Feedback
                  <Tooltip title="Indicates negative survey responses or frustrated sentiment">
                    <Info size={14} color="#9ca3af" />
                  </Tooltip>
                </Box>
              </BlinkTableCell>
            </BlinkTableRow>
          </BlinkTableHead>
          <BlinkTableBody>
            {isLoading ? (
              <BlinkTableRow>
                <BlinkTableCell colSpan={12} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                  Loading journeys...
                </BlinkTableCell>
              </BlinkTableRow>
            ) : filteredJourneys.length === 0 ? (
              <BlinkTableRow>
                <BlinkTableCell colSpan={12} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                  No journeys match your filters
                </BlinkTableCell>
              </BlinkTableRow>
            ) : (
              filteredJourneys.map((journey) => (
                <BlinkTableRow
                  key={journey.id}
                  onClick={() => router.push(`/journey/${journey.id}`)}
                  sx={{ cursor: 'pointer', backgroundColor: '#fff', '&:hover': { backgroundColor: '#f9fafb' } }}
                >
                  {/* Patient ID */}
                  <BlinkTableCell sx={{ px: 4, py: 4 }}>
                    <Box sx={{ fontSize: '0.875rem', color: '#374151' }}>
                      {journey.patientInfo.patientId}
                    </Box>
                  </BlinkTableCell>

                  {/* Patient */}
                  <BlinkTableCell sx={{ px: 4, py: 4 }}>
                    <Box sx={{ fontWeight: 500, color: '#111827' }}>
                      {journey.patientInfo.initials}
                    </Box>
                  </BlinkTableCell>

                  {/* Medications */}
                  <BlinkTableCell sx={{ color: '#374151', px: 4, py: 4 }}>
                    {journey.patientInfo.medications[0] || '--'}
                  </BlinkTableCell>

                  {/* Programs */}
                  <BlinkTableCell sx={{ color: '#374151', px: 4, py: 4 }}>
                    {journey.programs.join(', ') || '--'}
                  </BlinkTableCell>

                  {/* Journey Step */}
                  <BlinkTableCell sx={{ px: 4, py: 4 }}>
                    <BlinkBadge
                      text={getCurrentJourneyStep(journey)}
                      customBgColor={getCurrentJourneyStep(journey) === 'Delivered' ? '#10b981' : '#3b82f6'}
                      customColor="#fff"
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

                  {/* Age */}
                  <BlinkTableCell sx={{ color: '#374151', px: 4, py: 4 }}>
                    {calculateAge(journey.patientInfo.dob)}
                  </BlinkTableCell>

                  {/* State */}
                  <BlinkTableCell sx={{ color: '#374151', px: 4, py: 4 }}>
                    {journey.metadata.state}
                  </BlinkTableCell>

                  {/* # Contacts */}
                  <BlinkTableCell sx={{ color: '#374151', textAlign: 'center', px: 4, py: 4 }}>
                    {countContacts(journey)}
                  </BlinkTableCell>

                  {/* Events */}
                  <BlinkTableCell sx={{ color: '#374151', textAlign: 'center', px: 4, py: 4 }}>
                    {countTotalEvents(journey)}
                  </BlinkTableCell>

                  {/* Initial Rx Received */}
                  <BlinkTableCell sx={{ color: '#374151', px: 4, py: 4 }}>
                    {new Date(journey.startTime).toLocaleDateString()}
                  </BlinkTableCell>

                  {/* Last Activity */}
                  <BlinkTableCell sx={{ color: '#374151', px: 4, py: 4 }}>
                    {new Date(journey.lastActivityTime).toLocaleDateString()}
                  </BlinkTableCell>

                  {/* Negative Feedback */}
                  <BlinkTableCell sx={{ textAlign: 'center', px: 4, py: 4 }}>
                    {hasNegativeFeedback(journey) ? (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#fca5a5',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AlertTriangle size={14} color="#dc2626" />
                      </Box>
                    ) : (
                      <Box sx={{ color: '#9ca3af' }}>—</Box>
                    )}
                  </BlinkTableCell>
                </BlinkTableRow>
              ))
            )}
          </BlinkTableBody>
        </BlinkTable>
      </BlinkTableContainer>
    </Box>
  );
}
