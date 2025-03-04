'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/users'); // Redirect to Users Page by Default
  }, [router]);

  return null; // No UI needed here
}
