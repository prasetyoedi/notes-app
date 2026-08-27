'use client';

import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  console.log('🏠 Root page - rendering');

  useEffect(() => {
    console.log('🏠 Root page - useEffect running');
    const auth = isAuthenticated();
    console.log('🏠 Root page - isAuthenticated:', auth);
    if (auth) {
      console.log('✅ Auth true, redirect ke dashboard');
      window.location.href = '/dashboard';
    } else {
      console.log('❌ Auth false, redirect ke login');
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat...</p>
      </div>
    </div>
  );
}