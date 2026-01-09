'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, User, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { PageHeader, Badge } from '@/components/shared';
import { MermaidDiagram } from '@/components/flowcharts';
import { flowCharts, flowChartCategories, FlowChart } from '@/config/flowcharts';

export default function FlowchartsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<string | null>(flowCharts[0]?.id || null);

  const filteredCharts = flowCharts.filter((chart) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        chart.title.toLowerCase().includes(searchLower) ||
        chart.description.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (selectedCategory && chart.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const getCategoryBadge = (categoryId: string) => {
    const category = flowChartCategories.find((c) => c.id === categoryId);
    return category ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
        {category.label}
      </span>
    ) : null;
  };

  const toggleChart = (chartId: string) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Flow Charts"
        description="Reference diagrams for critical patient journeys and system flows"
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search flow charts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {flowChartCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-500">
        Showing {filteredCharts.length} of {flowCharts.length} flow charts
      </p>

      {/* Flow Charts List */}
      <div className="space-y-4">
        {filteredCharts.map((chart) => (
          <div
            key={chart.id}
            className="bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
          >
            {/* Header - Always Visible */}
            <button
              onClick={() => toggleChart(chart.id)}
              className="w-full p-4 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryBadge(chart.category)}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{chart.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{chart.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Updated {new Date(chart.lastUpdated).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {chart.owner}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 p-2">
                {expandedChart === chart.id ? (
                  <ChevronUp size={20} className="text-slate-400" />
                ) : (
                  <ChevronDown size={20} className="text-slate-400" />
                )}
              </div>
            </button>

            {/* Expanded Content - Diagram */}
            {expandedChart === chart.id && (
              <div className="border-t p-4">
                <MermaidDiagram diagram={chart.diagram} title={chart.title} />
              </div>
            )}
          </div>
        ))}

        {filteredCharts.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-slate-500">No flow charts match your search</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded bg-emerald-500" />
            <span className="text-sm text-slate-600">Success / End State</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded bg-red-500" />
            <span className="text-sm text-slate-600">Error / Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded bg-amber-500" />
            <span className="text-sm text-slate-600">Warning / Manual Step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded bg-blue-500" />
            <span className="text-sm text-slate-600">Start / Primary Action</span>
          </div>
        </div>
      </div>
    </div>
  );
}

