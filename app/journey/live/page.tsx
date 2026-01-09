'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  RefreshCw,
  AlertTriangle,
  Eye,
  Clock,
  Wifi,
  WifiOff,
  Send,
  Settings,
  MessageSquare,
  Shuffle,
  Filter,
} from 'lucide-react';
import { PageHeader, Badge } from '@/components/shared';
import { TimelineEvent } from '@/components/journey';
import { mockJourneyEvents, DRUGS, STATES, PROGRAMS, generateMockJourneys } from '@/config/dummyData';
import type { JourneyEvent, JourneyType, Program } from '@/types/journey';

interface LiveModeConfig {
  journeyType: JourneyType | 'any';
  patientSelection: 'random' | 'filtered';
  slackNotifications: boolean;
  // Additional filters (shown when journeyType is not 'any')
  medications: string[];
  programs: Program[];
  states: string[];
  ageRange: {
    min: number | '';
    max: number | '';
  };
}

export default function LiveModePage() {
  const [showSetup, setShowSetup] = useState(true);
  const [config, setConfig] = useState<LiveModeConfig>({
    journeyType: 'any',
    patientSelection: 'random',
    slackNotifications: false,
    medications: [],
    programs: [],
    states: [],
    ageRange: { min: '', max: '' },
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isObserving, setIsObserving] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<JourneyEvent[]>([]);
  const [escalationNote, setEscalationNote] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);

  // Simulate connection
  useEffect(() => {
    if (isObserving) {
      const timer = setTimeout(() => setIsConnected(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsConnected(false);
    }
  }, [isObserving]);

  // Simulate live events
  useEffect(() => {
    if (!isObserving || !isConnected) return;

    // Start with initial events
    setLiveEvents(mockJourneyEvents.slice(0, 2));

    // Add events over time
    let eventIndex = 2;
    const interval = setInterval(() => {
      if (eventIndex < mockJourneyEvents.length) {
        const newEvent = mockJourneyEvents[eventIndex];
        setLiveEvents((prev) => [...prev, newEvent]);
        
        // Send Slack notification if enabled
        if (config.slackNotifications) {
          // In real implementation, this would send a Slack DM
          console.log(`[Slack DM] New event: ${newEvent.type} at ${newEvent.timestamp}`);
        }
        
        eventIndex++;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isObserving, isConnected, config.slackNotifications]);

  // Helper to calculate age from DOB
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get random patient from last 3 hours
  const getRandomPatientFromLast3Hours = (): string | null => {
    const allJourneys = generateMockJourneys(100);
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    
    let filteredJourneys = allJourneys.filter((journey) => {
      const journeyStart = new Date(journey.startTime);
      return journeyStart >= threeHoursAgo;
    });

    if (filteredJourneys.length === 0) return null;

    // Filter by journey type if specified
    if (config.journeyType !== 'any') {
      filteredJourneys = filteredJourneys.filter(j => j.journeyType === config.journeyType);
    }

    // Filter by medications if specified
    if (config.medications.length > 0) {
      filteredJourneys = filteredJourneys.filter(j => 
        config.medications.includes(j.metadata.drug)
      );
    }

    // Filter by programs if specified
    if (config.programs.length > 0) {
      filteredJourneys = filteredJourneys.filter(j => 
        j.programs.some(p => config.programs.includes(p))
      );
    }

    // Filter by states if specified
    if (config.states.length > 0) {
      filteredJourneys = filteredJourneys.filter(j => 
        config.states.includes(j.metadata.state)
      );
    }

    // Filter by age range if specified
    if (config.ageRange.min !== '' || config.ageRange.max !== '') {
      filteredJourneys = filteredJourneys.filter(j => {
        const age = calculateAge(j.patientInfo.dob);
        const minAge = config.ageRange.min === '' ? 0 : Number(config.ageRange.min);
        const maxAge = config.ageRange.max === '' ? 150 : Number(config.ageRange.max);
        return age >= minAge && age <= maxAge;
      });
    }

    if (filteredJourneys.length === 0) return null;

    const randomJourney = filteredJourneys[Math.floor(Math.random() * filteredJourneys.length)];
    return randomJourney.patientId;
  };

  const handleStartObservation = () => {
    let patientId: string | null = null;
    
    if (config.patientSelection === 'random') {
      patientId = getRandomPatientFromLast3Hours();
      if (!patientId) {
        // Fallback if no recent patients found
        patientId = `p-live-${Math.floor(Math.random() * 10000)}`;
      }
    } else {
      // For filtered selection, we'd need to implement filtering logic
      // For now, use random from last 3 hours
      patientId = getRandomPatientFromLast3Hours() || `p-live-${Math.floor(Math.random() * 10000)}`;
    }

    setCurrentPatient(patientId);
    setLiveEvents([]);
    setIsObserving(true);
    setShowSetup(false);
    
    // Show confirmation if Slack notifications are enabled
    if (config.slackNotifications) {
      console.log('Slack notifications enabled - will send DMs for each event');
      // In real implementation, this would set up the Slack webhook/listener
    }
  };

  const handleSetupComplete = () => {
    if (config.patientSelection === 'random' && !getRandomPatientFromLast3Hours()) {
      alert('No patients found with journeys starting in the last 3 hours. Please try again later or select a different filter.');
      return;
    }
    handleStartObservation();
  };

  const handleStopObservation = () => {
    setIsObserving(false);
    setCurrentPatient(null);
    setLiveEvents([]);
    setShowSetup(true); // Return to setup screen
  };

  const handleEscalate = () => {
    if (!escalationNote.trim()) return;
    alert(`Escalation sent: ${escalationNote}`);
    setEscalationNote('');
    setShowEscalation(false);
  };

  const errorCount = liveEvents.filter((e) => e.errorIndicators && e.errorIndicators.length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Observation Mode"
        description="Watch patient journeys in real-time"
        actions={
          !showSetup && (
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isConnected
                  ? 'bg-emerald-100 text-emerald-700'
                  : isObserving
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi size={14} className="animate-pulse" />
                    Connected
                  </>
                ) : isObserving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <WifiOff size={14} />
                    Disconnected
                  </>
                )}
              </div>

              {isObserving ? (
                <button
                  onClick={handleStopObservation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Stop Observation
                </button>
              ) : (
                <button
                  onClick={() => setShowSetup(true)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Configure
                </button>
              )}
            </div>
          )
        }
      />

      {showSetup ? (
        /* Setup Screen */
        <div className="bg-white rounded-xl border p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Settings size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Configure Live Observation</h2>
              <p className="text-sm text-slate-500">Set up your observation session preferences</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Journey Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Filter size={16} />
                Journey Type Filter
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setConfig({ ...config, journeyType: 'any' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    config.journeyType === 'any'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Any Type
                </button>
                <button
                  onClick={() => setConfig({ ...config, journeyType: 'first_fill' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    config.journeyType === 'first_fill'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  First Fill
                </button>
                <button
                  onClick={() => setConfig({ ...config, journeyType: 'refill' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    config.journeyType === 'refill'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  Refill
                </button>
              </div>
            </div>

            {/* Additional Filters - Shown when journey type is selected */}
            {config.journeyType !== 'any' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">Additional Filters</h3>
                
                {/* Medications Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Medications
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DRUGS.map((drug) => (
                      <button
                        key={drug}
                        onClick={() => {
                          const newMedications = config.medications.includes(drug)
                            ? config.medications.filter(m => m !== drug)
                            : [...config.medications, drug];
                          setConfig({ ...config, medications: newMedications });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          config.medications.includes(drug)
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {drug}
                      </button>
                    ))}
                  </div>
                  {config.medications.length > 0 && (
                    <button
                      onClick={() => setConfig({ ...config, medications: [] })}
                      className="mt-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Programs Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Programs
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROGRAMS.map((program) => (
                      <button
                        key={program}
                        onClick={() => {
                          const newPrograms = config.programs.includes(program)
                            ? config.programs.filter(p => p !== program)
                            : [...config.programs, program];
                          setConfig({ ...config, programs: newPrograms });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          config.programs.includes(program)
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {program}
                      </button>
                    ))}
                  </div>
                  {config.programs.length > 0 && (
                    <button
                      onClick={() => setConfig({ ...config, programs: [] })}
                      className="mt-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* States Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    States
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATES.map((state) => (
                      <button
                        key={state}
                        onClick={() => {
                          const newStates = config.states.includes(state)
                            ? config.states.filter(s => s !== state)
                            : [...config.states, state];
                          setConfig({ ...config, states: newStates });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          config.states.includes(state)
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                  {config.states.length > 0 && (
                    <button
                      onClick={() => setConfig({ ...config, states: [] })}
                      className="mt-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Age Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age Range
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Min Age</label>
                      <input
                        type="number"
                        min="0"
                        max="150"
                        value={config.ageRange.min}
                        onChange={(e) => setConfig({
                          ...config,
                          ageRange: { ...config.ageRange, min: e.target.value === '' ? '' : Number(e.target.value) }
                        })}
                        placeholder="Any"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="pt-6 text-slate-400">to</div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Max Age</label>
                      <input
                        type="number"
                        min="0"
                        max="150"
                        value={config.ageRange.max}
                        onChange={(e) => setConfig({
                          ...config,
                          ageRange: { ...config.ageRange, max: e.target.value === '' ? '' : Number(e.target.value) }
                        })}
                        placeholder="Any"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    {(config.ageRange.min !== '' || config.ageRange.max !== '') && (
                      <button
                        onClick={() => setConfig({ ...config, ageRange: { min: '', max: '' } })}
                        className="pt-6 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Shuffle size={16} />
                Patient Selection
              </label>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={config.patientSelection === 'random'}
                    onChange={() => setConfig({ ...config, patientSelection: 'random' })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Random Patient (Last 3 Hours)</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Automatically select a random patient whose journey started in the last 3 hours
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Slack Notifications */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare size={16} />
                Slack Notifications
              </label>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.slackNotifications}
                    onChange={(e) => setConfig({ ...config, slackNotifications: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900">Receive Slack DM Notifications</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Get a direct message in Slack every time a new event occurs during observation
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSetupComplete}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Radio size={18} />
                Start Live Observation
              </button>
            </div>
          </div>
        </div>
      ) : !isObserving ? (
        /* Idle State */
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye size={40} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Ready to Observe</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Start a live observation session to watch a patient&apos;s journey in real-time.
            You&apos;ll be assigned to a random active patient currently progressing through the experience.
          </p>
          <button
            onClick={handleStartObservation}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
          >
            <Radio size={18} />
            Start Live Observation
          </button>
        </div>
      ) : (
        /* Active Observation */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-slate-900">LIVE</span>
                  <span className="text-slate-500">Patient {currentPatient}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} />
                  {liveEvents.length} events
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {liveEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="animate-spin text-slate-400 mx-auto mb-3" size={32} />
                    <p className="text-slate-500">Waiting for events...</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {liveEvents.map((event, index) => (
                      <div key={event.id} className="animate-slide-in">
                        <TimelineEvent
                          event={event}
                          isLast={index === liveEvents.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Patient Context</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-500">Patient ID</dt>
                  <dd className="font-medium text-slate-900">{currentPatient}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Drug</dt>
                  <dd className="font-medium text-slate-900">
                    {DRUGS[Math.floor(Math.random() * DRUGS.length)]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">State</dt>
                  <dd className="font-medium text-slate-900">
                    {STATES[Math.floor(Math.random() * STATES.length)]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Platform</dt>
                  <dd><Badge variant="info">iOS</Badge></dd>
                </div>
              </dl>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Events Observed</span>
                  <span className="font-bold text-slate-900">{liveEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Errors Detected</span>
                  <span className={`font-bold ${errorCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {errorCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Escalation */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Escalation</h3>
              
              {errorCount > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm font-medium text-red-700">Errors detected!</p>
                    <p className="text-xs text-red-600">{errorCount} error(s) in this session</p>
                  </div>
                </div>
              )}

              {showEscalation ? (
                <div className="space-y-3">
                  <textarea
                    value={escalationNote}
                    onChange={(e) => setEscalationNote(e.target.value)}
                    placeholder="Describe the issue you observed..."
                    className="w-full h-24 p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEscalate}
                      disabled={!escalationNote.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={14} />
                      Send Alert
                    </button>
                    <button
                      onClick={() => setShowEscalation(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowEscalation(true)}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={16} />
                  Report Issue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

