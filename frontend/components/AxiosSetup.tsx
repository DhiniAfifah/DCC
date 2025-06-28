'use client';

import { useEffect } from 'react';
import { setupAxiosInterceptors } from '@/utils/auth';

export default function AxiosSetup() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return null;
}