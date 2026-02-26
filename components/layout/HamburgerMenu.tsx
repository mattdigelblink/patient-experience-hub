'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Chip,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Inbox as InboxIcon,
  Schedule as ScheduleIcon,
  Monitor as MonitorIcon,
  LocalShipping as LocalShippingIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  PersonAdd as PersonAddIcon,
  BarChart as BarChartIcon,
  Headset as HeadsetIcon,
  ReportProblem as ReportProblemIcon,
  Hub as HubIcon,
  Visibility as VisibilityIcon,
  Feedback as FeedbackIcon,
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: { label: string; href: string }[];
}

// Import RxOSLogo
const RxOSLogo = () => (
  <div style={{ width: '56px' }}>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      version='1.1'
      viewBox='0 0 230.1 107.4'
    >
      <defs>
        <style>
          {`
            .st0 {
              fill: #dc384d;
            }
            .st1 {
              fill: #333;
            }
          `}
        </style>
      </defs>
      <path
        className='st1'
        d='M84.6,107.4l-18.3-26.7,16.3-23.7h-18.4l-7.1,10.3-13.8-20.1c8.5-3.8,13.6-11.8,13.6-21.5C57,10.3,45.9.4,29.6.4H0v76.3h16.3v-25.6h11.2l20.4,29.6-18.3,26.6h18.2l9.2-13.4,9.2,13.4h18.2ZM27.6,37.5h-11.2V14h11.2c7.7,0,12.8,4.6,12.8,11.8s-5,11.7-12.8,11.7Z'
      />
      <path
        className='st0'
        d='M87,38.8C87,16.6,102.2,0,124.8,0s37.8,16.6,37.8,38.8-15.4,38.8-37.8,38.8-37.8-16.6-37.8-38.8ZM145.8,38.8c0-15.2-8.3-25-21-25s-21.1,9.8-21.1,25,8.3,25,21.1,25,21-9.8,21-25Z'
      />
      <path
        className='st0'
        d='M168.7,51.9h16c.5,7.6,6.4,12.8,15.6,12.8s13.3-3.1,13.3-9.2-6-7.8-16.3-9.8c-15.4-3.1-26.8-7.2-26.8-22.5S181.7,0,198.9,0s29.4,9.4,29.6,24h-16c-.8-6.4-5.4-11-14-11s-11.7,2.7-11.7,8.7,6,7.6,16.2,9.6c15.5,2.9,26.9,7.2,26.9,22.3s-11.9,24-29.8,24-31.5-10.2-31.6-25.7Z'
      />
    </svg>
  </div>
);

const prototypeMenuItems: MenuItem[] = [
  {
    label: 'Patients',
    icon: <PeopleIcon />,
    href: '/patients',
  },
  {
    label: 'Prescriptions',
    icon: <DescriptionIcon />,
    href: '/prescriptions',
  },
  {
    label: 'Prescribers',
    icon: <BusinessIcon />,
    href: '/prescribers',
  },
  {
    label: 'Incoming Fax Queue',
    icon: <InboxIcon />,
    href: '/incoming-fax-queue',
  },
  {
    label: 'Rx Request',
    icon: <ScheduleIcon />,
    href: '/rx-request',
  },
  {
    label: 'Intake Orders',
    icon: <MonitorIcon />,
    subItems: [
      { label: 'New Orders', href: '/intake-orders/new' },
      { label: 'Pending', href: '/intake-orders/pending' },
      { label: 'In Progress', href: '/intake-orders/in-progress' },
    ],
  },
  {
    label: 'Fulfillment Orders',
    icon: <LocalShippingIcon />,
    subItems: [
      { label: 'Ready to Fill', href: '/fulfillment-orders/ready' },
      { label: 'In Progress', href: '/fulfillment-orders/in-progress' },
      { label: 'Completed', href: '/fulfillment-orders/completed' },
    ],
  },
  {
    label: 'Prior Authorizations',
    icon: <AssignmentTurnedInIcon />,
    subItems: [
      { label: 'Pending', href: '/prior-authorizations/pending' },
      { label: 'Approved', href: '/prior-authorizations/approved' },
      { label: 'Denied', href: '/prior-authorizations/denied' },
    ],
  },
  {
    label: 'Follow ups',
    icon: <PersonAddIcon />,
    subItems: [
      { label: 'Today', href: '/follow-ups/today' },
      { label: 'This Week', href: '/follow-ups/week' },
      { label: 'Overdue', href: '/follow-ups/overdue' },
    ],
  },
  {
    label: 'Dashboards',
    icon: <BarChartIcon />,
    subItems: [
      { label: 'Operations', href: '/dashboards/operations' },
      { label: 'Analytics', href: '/dashboards/analytics' },
      { label: 'Reports', href: '/dashboards/reports' },
    ],
  },
  {
    label: 'Service Desk',
    icon: <HeadsetIcon />,
    href: '/service-desk',
  },
  {
    label: 'Reported Issues',
    icon: <ReportProblemIcon />,
    href: '/reported-issues',
  },
  {
    label: 'Pharmacy Network Management',
    icon: <HubIcon />,
    subItems: [
      { label: 'Pharmacies', href: '/pharmacy-network/pharmacies' },
      { label: 'Contracts', href: '/pharmacy-network/contracts' },
      { label: 'Performance', href: '/pharmacy-network/performance' },
    ],
  },
];

const journeysMenuItem: MenuItem = {
  label: 'Patient Journeys',
  icon: <VisibilityIcon />,
  subItems: [
    { label: 'Search Patient Journeys', href: '/journey/search' },
  ],
};

const feedbackMenuItem: MenuItem = {
  label: 'Patient Feedback',
  icon: <FeedbackIcon />,
  subItems: [
    { label: 'Search Feedback', href: '/feedback/search' },
    { label: 'Triage Feedback', href: '/feedback/triage' },
  ],
};

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <IconButton onClick={onClose} sx={{ color: '#475569' }}>
          <CloseIcon />
        </IconButton>
        <Link href="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <RxOSLogo />
        </Link>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ pt: 0 }} component="nav">
        {/* Prototype Section Header */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#fef3c7' }}>
          <Chip
            label="PROTOTYPE - NOT IN USE"
            size="small"
            sx={{
              bgcolor: '#f59e0b',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '20px',
            }}
          />
        </Box>

        {/* Prototype Menu Items */}
        {prototypeMenuItems.map((item, index) => {
          const isExpanded = expandedItems.includes(item.label);
          const isActive = item.href ? pathname === item.href : false;

          return (
            <React.Fragment key={`prototype-item-${index}`}>
              {item.href ? (
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={onClose}
                    sx={{
                      py: 1.5,
                      opacity: 0.6,
                      ...(isActive && {
                        bgcolor: '#fef2f2',
                        borderLeft: '4px solid #dc384d',
                        color: '#dc384d',
                      }),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#dc384d' : '#475569' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ) : (
                <>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => toggleExpanded(item.label)}
                      sx={{ py: 1.5, opacity: 0.6 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: '#475569' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>

                  {/* Sub Items */}
                  {item.subItems && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ bgcolor: '#f8fafc' }}>
                        {item.subItems.map((subItem, subIndex) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <ListItemButton
                              key={`sub-item-${subIndex}`}
                              component={Link}
                              href={subItem.href}
                              onClick={onClose}
                              sx={{
                                pl: 9,
                                py: 1,
                                opacity: 0.6,
                                ...(isSubActive && {
                                  bgcolor: '#fef2f2',
                                  color: '#dc384d',
                                  fontWeight: 600,
                                }),
                              }}
                            >
                              <ListItemText primary={subItem.label} />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}

        {/* Divider before Journeys */}
        <Divider sx={{ my: 2 }} />

        {/* Journeys Section - Active */}
        {(() => {
          const isExpanded = expandedItems.includes(journeysMenuItem.label);
          return (
            <React.Fragment key="journeys-item">
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => toggleExpanded(journeysMenuItem.label)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#475569' }}>
                    {journeysMenuItem.icon}
                  </ListItemIcon>
                  <ListItemText primary={journeysMenuItem.label} />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              {/* Sub Items */}
              {journeysMenuItem.subItems && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: '#f8fafc' }}>
                    {journeysMenuItem.subItems.map((subItem, subIndex) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <ListItemButton
                          key={`journeys-sub-item-${subIndex}`}
                          component={Link}
                          href={subItem.href}
                          onClick={onClose}
                          sx={{
                            pl: 9,
                            py: 1,
                            ...(isSubActive && {
                              bgcolor: '#fef2f2',
                              color: '#dc384d',
                              fontWeight: 600,
                            }),
                          }}
                        >
                          <ListItemText primary={subItem.label} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })()}

        {/* Patient Feedback Section - Active */}
        {(() => {
          const isExpanded = expandedItems.includes(feedbackMenuItem.label);
          return (
            <React.Fragment key="feedback-item">
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => toggleExpanded(feedbackMenuItem.label)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#475569' }}>
                    {feedbackMenuItem.icon}
                  </ListItemIcon>
                  <ListItemText primary={feedbackMenuItem.label} />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              {/* Sub Items */}
              {feedbackMenuItem.subItems && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: '#f8fafc' }}>
                    {feedbackMenuItem.subItems.map((subItem, subIndex) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <ListItemButton
                          key={`feedback-sub-item-${subIndex}`}
                          component={Link}
                          href={subItem.href}
                          onClick={onClose}
                          sx={{
                            pl: 9,
                            py: 1,
                            ...(isSubActive && {
                              bgcolor: '#fef2f2',
                              color: '#dc384d',
                              fontWeight: 600,
                            }),
                          }}
                        >
                          <ListItemText primary={subItem.label} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })()}
      </List>
    </Drawer>
  );
}
