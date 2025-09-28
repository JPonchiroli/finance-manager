"use client";

import { auth } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { signOut, User } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface HeaderProps {
    title: string;
}
export default function Header({ title }: HeaderProps) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [user, authLoading, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
    };
    return (
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <p className="text-gray-600">
                    {user ? `Bem-vindo(a) de volta, ${user.displayName || user.email}!` : "Bem-vindo(a) de volta!"}
                </p>
            </div>
            <div className="flex space-x-30">
                <Link href={'dashboard'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Dashboard</Link>
                <Link href={'despesas'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Despesas</Link>
                <Link href={'receitas'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Receitas</Link>
                <Link href={'transacoes'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Transações</Link>
            </div>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
                Sair
            </button>
        </header>
    )
}