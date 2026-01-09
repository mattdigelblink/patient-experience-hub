'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Eye,
  Radio,
  MessageSquareWarning,
  ListTodo,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  LayoutDashboard,
} from 'lucide-react';
import clsx from 'clsx';
import { menuConfig } from '@/config/menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

// Home item sits above everything
const homeNavItem: NavItem = { href: '/', label: 'Home', icon: <Home size={20} /> };

const observeNavItems: NavItem[] = [
  { href: '/journey', label: 'Journey Observer', icon: <Eye size={20} /> },
  { href: '/journey/live', label: 'Live Mode', icon: <Radio size={20} /> },
  { href: '/flowcharts', label: 'Patient Flows', icon: <GitBranch size={20} /> },
];

const feedbackNavItems: NavItem[] = [
  { href: '/feedback', label: 'Feedback Center', icon: <MessageSquareWarning size={20} /> },
  { href: '/feedback/issues', label: 'Broken Windows', icon: <ListTodo size={20} />, badge: 4 },
  { href: '/feedback/triage', label: 'Triage Queue', icon: <BarChart3 size={20} /> },
];

const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/compliance', label: 'Compliance', icon: <Users size={20} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || 
      (item.href !== '/' && pathname.startsWith(item.href));

    return (
      <Link
        href={item.href}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-slate-100',
          isActive && 'bg-red-50 text-red-600 border-l-2 border-red-500',
          !isActive && 'text-slate-600 hover:text-slate-900'
        )}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="mb-6">
      {!collapsed && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </div>
  );

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Eye size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-sm leading-tight">PX HUB</span>
              <span className="text-[10px] text-slate-400 leading-tight">Patient Experience</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mx-auto">
            <Eye size={18} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={clsx(
            'p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors',
            collapsed && 'hidden'
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="p-3 overflow-y-auto h-[calc(100%-4rem)]">
        {/* Home - standalone at top */}
        <div className="mb-6">
          <NavLink item={homeNavItem} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-6" />

        {menuConfig.observe.visible && (
          <NavSection title="Observe" items={observeNavItems} />
        )}
        {menuConfig.feedback.visible && (
          <NavSection title="Feedback" items={feedbackNavItems} />
        )}
        {menuConfig.admin.visible && (
          <NavSection title="Admin" items={adminNavItems} />
        )}
      </div>

      {/* Toggle button for collapsed state */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </aside>
  );
}
