'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { PrototypePlaceholder } from '@/components/PrototypePlaceholder';

export default function HomePage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const formatLastUpdated = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();
  };

  useEffect(() => {
    setLastUpdated(formatLastUpdated());
  }, []);

  const handleRefresh = () => {
    setLastUpdated(formatLastUpdated());
    // You can add additional refresh logic here
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '2rem',
            fontWeight: 600,
            color: '#0f172a',
            mb: 1,
          }}
        >
          Welcome, Matthew!
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            LAST UPDATED {lastUpdated}
          </Typography>
          <IconButton
            onClick={handleRefresh}
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': {
                color: '#475569',
                backgroundColor: '#f1f5f9',
              },
            }}
          >
            <RefreshCw size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Prototype Widget */}
      <PrototypePlaceholder />
    </Box>
  );
}
