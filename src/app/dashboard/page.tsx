"use client"

import { useRouter } from "next/navigation";

export default function DashboardPage() {

  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl">Dashboard</h1>
      <button onClick={() => router.back()}>Login</button>
    </div>
  )
}