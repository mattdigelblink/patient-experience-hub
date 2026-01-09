'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search, User, Home } from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Quick search link */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Search size={18} />
          <span className="text-sm">Search journeys & feedback...</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Home quick link */}
          <Link
            href="/"
            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Home"
          >
            <Home size={20} />
          </Link>

          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <button className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              Employee
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
