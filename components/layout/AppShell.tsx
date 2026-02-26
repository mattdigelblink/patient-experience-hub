'use client';

import React from 'react';
import { Header } from './Header';
import { Box } from '@mui/material';
import PrototypeBanner from '@/components/PrototypeBanner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      <PrototypeBanner />
      <Header />

      <Box
        component="main"
        sx={{
          pt: '116px', // Height of banner (52px) + header (64px)
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

