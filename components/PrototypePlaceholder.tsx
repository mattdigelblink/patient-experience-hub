'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Visibility as VisibilityIcon, Feedback as FeedbackIcon } from '@mui/icons-material';

export function PrototypePlaceholder() {
  return (
    <Container maxWidth="md" sx={{ py: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          border: '2px solid #f59e0b',
          bgcolor: '#fffbeb',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: '#92400e', fontWeight: 600 }}
        >
          RxOS Prototype
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 4, color: '#78350f', fontSize: '1.1rem' }}
        >
          This is an RxOS prototype to display Patient journey and feedback center functionality
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/journey/search"
            variant="contained"
            size="large"
            startIcon={<VisibilityIcon />}
            sx={{
              bgcolor: '#dc384d',
              '&:hover': {
                bgcolor: '#b91c1c',
              },
            }}
          >
            Search Patient Journeys
          </Button>

          <Button
            component={Link}
            href="/feedback/triage"
            variant="contained"
            size="large"
            startIcon={<FeedbackIcon />}
            sx={{
              bgcolor: '#dc384d',
              '&:hover': {
                bgcolor: '#b91c1c',
              },
            }}
          >
            Triage Feedback
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
