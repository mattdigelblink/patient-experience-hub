'use client';

import { Box, Typography } from '@mui/material';

export default function JourneyPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        p: 3,
      }}
    >
      <Typography variant="h4" sx={{ color: '#374151', fontWeight: 500 }}>
        This is a prototype of RxOS
      </Typography>
    </Box>
  );
}
