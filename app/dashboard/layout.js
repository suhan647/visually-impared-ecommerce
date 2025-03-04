'use client';

import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

const auth = getAuth(app);

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== 'suhanahmed647@gmail.com') {
        router.push('/auth/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header (Visible on All Pages) */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <nav>
          <Link href="/dashboard/users" className="mx-4 hover:underline">Users</Link>
          <Link href="/dashboard/products" className="mx-4 hover:underline">Products</Link>
        </nav>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      {/* Page Content */}
      <div className="p-6">{children}</div>
    </div>
  );
}
