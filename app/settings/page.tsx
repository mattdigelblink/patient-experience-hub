'use client';

import React from 'react';
import { PageHeader } from '@/components/shared';
import { Bell, User, Palette, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your Journey Observation Tool preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="text-blue-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Email alerts for Sev-1/Sev-2 issues</span>
              <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Slack notifications</span>
              <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Weekly compliance reminders</span>
              <input type="checkbox" defaultChecked className="rounded text-emerald-500" />
            </label>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="text-purple-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                defaultValue="Employee User"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="employee@blinkhealth.com"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Product</option>
                <option>Engineering</option>
                <option>Operations</option>
                <option>Customer Care</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Palette className="text-amber-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium ring-2 ring-emerald-500">
                  Light
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
                  Dark
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">
                  System
                </button>
              </div>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Compact view</span>
              <input type="checkbox" className="rounded text-emerald-500" />
            </label>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Key className="text-emerald-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Integrations</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Jira</p>
                <p className="text-xs text-slate-500">Connected to blinkhealth.atlassian.net</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Slack</p>
                <p className="text-xs text-slate-500">#patient-experience channel</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Level AI</p>
                <p className="text-xs text-slate-500">Call transcription service</p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

