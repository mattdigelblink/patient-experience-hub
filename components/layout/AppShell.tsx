'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

