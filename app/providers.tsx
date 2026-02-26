'use client';

// Direct import from ui-tools to avoid loading entire library
import { BlinkHealthThemeProvider } from '@blink-health/ui-tools/dist/esm/theme';
import { GlobalStyles } from '@mui/material';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { ConfigProvider } from '@/lib/ConfigContext';
import { AuthProvider } from '@/components/auth/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <BlinkHealthThemeProvider mode="light">
      <GlobalStyles
        styles={{
          body: {
            fontFamily: 'var(--font-roboto), "Roboto", "Helvetica", "Arial", sans-serif',
          },
          '*': {
            fontFamily: 'var(--font-roboto), "Roboto", "Helvetica", "Arial", sans-serif',
          },
          '.MuiPopover-paper, .MuiPaper-root.MuiMenu-paper, .MuiAutocomplete-paper': {
            border: '1px solid #d1d5db !important',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important',
          },
        }}
      />
      <AuthProvider>
        <ConfigProvider>
          {isLoginPage ? children : <AppShell>{children}</AppShell>}
        </ConfigProvider>
      </AuthProvider>
    </BlinkHealthThemeProvider>
  );
}
