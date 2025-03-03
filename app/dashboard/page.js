"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.email !== "suhanahmed647@gmail.com")) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  );
}
