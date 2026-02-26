'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('rxdemo_auth') === 'true';
      setIsAuthenticated(authStatus);

      // If not authenticated and not on login page, redirect to login
      if (!authStatus && pathname !== '/login') {
        router.push('/login');
      }

      setIsChecking(false);
    }
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If on login page, always show it
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise show nothing (redirect is happening)
  return null;
}
