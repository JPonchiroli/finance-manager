"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { app, auth, db } from "@/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function NewExpensePage() {
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0], // Data de hoje no formato YYYY-MM-DD
        category: "Alimentação",
        status: "Pendente", // "Pago" ou "Pendente"
    });

    const categories = [
        "Moradia",
        "Alimentação",
        "Transporte",
        "Lazer",
        "Saúde",
        "Educação",
        "Outros",
    ];

    // Protege a rota: só usuários logados acessam
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                toast.error("Você precisa estar logado para acessar esta página.");
                router.push("/login");
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.description || !form.amount || !form.date || !form.category) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }

        const amount = parseFloat(form.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Valor inválido. Insira um número positivo.");
            return;
        }

        setSubmitting(true);

        try {
            await addDoc(collection(db, "transactions"), {
                userId: user.uid,
                type: "expense", // tipo: despesa
                description: form.description.trim(),
                amount: amount,
                date: form.date, // string no formato YYYY-MM-DD
                category: form.category,
                status: form.status, // "Pago" ou "Pendente"
                createdAt: new Date(),
            });

            toast.success("Despesa registrada com sucesso!");
            setForm({
                description: "",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                category: "Alimentação",
                status: "Pendente",
            });

            // Opcional: redirecionar após 2s ou permanecer na página para novo cadastro
            // setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar a despesa. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Carregando...</p>
            </div>
        );
    }

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Cabeçalho */}

                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Minhas Despesas</h1>
                        <p className="text-gray-600">Bem-vindo(a) de volta, {user.displayName || user.email}!</p>
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

                <main className="w-2/4 mx-auto rounded-2xl bg-gray-50 py-8 px-4 sm:px-6">
                    <Toaster position="top-center" />
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Nova Despesa</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição *
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Ex: Supermercado, Netflix..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor (R$) *
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                min="0.01"
                                step="0.01"
                                placeholder="0,00"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoria *
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center text-gray-700">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Pendente"
                                        checked={form.status === "Pendente"}
                                        onChange={handleChange}
                                        className="mr-2 text-gray-700"
                                    />
                                    Pendente
                                </label>
                                <label className="flex items-center text-gray-700">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Pago"
                                        checked={form.status === "Pago"}
                                        onChange={handleChange}
                                        className="mr-2 text-gray-700"
                                    />
                                    Pago
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-70"
                        >
                            {submitting ? "Salvando..." : "Registrar Despesa"}
                        </button>
                    </form>
                </main>
            </div >
        </div >
    );
}