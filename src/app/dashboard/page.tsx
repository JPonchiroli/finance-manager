"use client"

import { auth } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {

  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

    const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading || !user) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl">Dashboard</h1>
      <p>Usuário: {user.email}</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  )
}