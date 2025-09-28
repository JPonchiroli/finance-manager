"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app, db } from "@/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Header from "@/components/header/header";

export default function NewIncomePage() {
    const router = useRouter();
    const auth = getAuth(app);

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0], // Data de hoje no formato YYYY-MM-DD
        category: "Salário",
    });

    const categories = [
        "Salário",
        "Freelance",
        "Investimentos",
        "Presentes",
        "Reembolso",
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
                type: "income", // tipo: receita
                description: form.description.trim(),
                amount: amount,
                date: form.date,
                category: form.category,
                createdAt: new Date(),
            });

            toast.success("Receita registrada com sucesso!");
            setForm({
                description: "",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                category: "Salário",
            });

            // Opcional: redirecionar após 2s ou permanecer para novo cadastro
            // setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar a receita. Tente novamente.");
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
                
                <Header title="Minhas Receitas" />

                <main className="w-2/4 mx-auto rounded-2xl bg-gray-50 py-8 px-4 sm:px-6">
                    <Toaster position="top-center" />
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Nova Receita</h1>
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
                                placeholder="Ex: Salário, Bônus..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-70"
                        >
                            {submitting ? "Salvando..." : "Registrar Receita"}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
}