'use client';

import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useConfig } from '@/lib/ConfigContext';

export default function PrototypeBanner() {
  const [showConfig, setShowConfig] = useState(false);
  const { journeyNotesEnabled, setJourneyNotesEnabled } = useConfig();

  const handleToggleJourneyNotes = (enabled: boolean) => {
    setJourneyNotesEnabled(enabled);
  };

  return (
    <>
      {/* Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-200 text-amber-900 text-sm font-bold rounded-md uppercase tracking-wide">
              Prototype
            </span>
            <span className="text-sm text-amber-800">
              This is a prototype environment for testing features
            </span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            <Settings size={16} />
            Configuration
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-900 block mb-1">
                    Journey Notes
                  </label>
                  <p className="text-xs text-slate-500">
                    Enable or disable the Journey Notes feature for adding comments and collaborating on patient journeys
                  </p>
                </div>
                <button
                  onClick={() => handleToggleJourneyNotes(!journeyNotesEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    journeyNotesEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      journeyNotesEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-slate-50">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
