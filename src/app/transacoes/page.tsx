"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db, auth } from "@/firebaseConfig";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { signOut } from "firebase/auth";
import Header from "@/components/header/header";

// Tipagem para transação
type Transaction = {
    id: string;
    type: "income" | "expense";
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
    category: string;
    status?: "Pago" | "Pendente";
};

export default function TransactionsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Transaction>>({});

    const [filters, setFilters] = useState({
        month: "", // YYYY-MM
        category: "",
    });

    // Protege rota
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [user, authLoading, router]);

    // Buscar transações
    useEffect(() => {
        if (!user || authLoading) return;

        const fetchTransactions = async () => {
            try {
                const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Transaction[];

                setTransactions(data);
                setFilteredTransactions(data);
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar transações.");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user, authLoading]);

    // Aplicar filtros
    useEffect(() => {
        let result = [...transactions];

        if (filters.month) {
            result = result.filter((t) => t.date.startsWith(filters.month));
        }

        if (filters.category) {
            result = result.filter((t) => t.category === filters.category);
        }

        setFilteredTransactions(result);
    }, [filters, transactions]);

    // Obter categorias únicas
    const categories = Array.from(
        new Set(transactions.map((t) => t.category))
    ).sort();

    // Iniciar edição
    const handleEdit = (transaction: Transaction) => {
        setEditId(transaction.id);
        setEditForm({ ...transaction });
    };

    // Cancelar edição
    const handleCancelEdit = () => {
        setEditId(null);
        setEditForm({});
    };

    // Salvar edição
    const handleSaveEdit = async () => {
        if (!editId || !user) return;

        try {
            const docRef = doc(db, "transactions", editId);
            await updateDoc(docRef, editForm);
            toast.success("Transação atualizada com sucesso!");

            // Atualiza localmente
            setTransactions((prev) =>
                prev.map((t) => (t.id === editId ? { ...t, ...editForm } as Transaction : t))
            );
            setEditId(null);
            setEditForm({});
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar transação.");
        }
    };

    // Excluir transação
    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

        try {
            await deleteDoc(doc(db, "transactions", id));
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            toast.success("Transação excluída com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir transação.");
        }
    };

    if (authLoading || !user || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando transações...</p>
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
                <Toaster position="top-center" />

                <Header title="Minhas Transações" />

                {/* Filtros */}
                <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="w-full p-2 border rounded-lg text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full p-2 border rounded-lg text-gray-700"
                        >
                            <option value="">Todas</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista de Transações */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Nenhuma transação encontrada.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        {editId === t.id ? (
                                            // Modo Edição
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={editForm.type || t.type}
                                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                                                        className="border rounded p-1"
                                                    >
                                                        <option value="income">Receita</option>
                                                        <option value="expense">Despesa</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editForm.description ?? t.description} // <-- aqui
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        className="border rounded p-1 w-full text-gray-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 ">
                                                    <input
                                                        type="text"
                                                        value={editForm.category ?? t.category} // <-- aqui
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                        className="border rounded p-1 w-full text-gray-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="date"
                                                        value={editForm.date || t.date}
                                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                        className="border rounded p-1 text-gray-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editForm.amount ?? t.amount} // <-- aqui
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                                                        className="border rounded p-1 w-full text-gray-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="text-green-600 hover:text-green-900 mr-3 font-medium"
                                                    >
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            // Modo Visualização
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {t.type === "income" ? "Receita" : "Despesa"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{t.description}</td>
                                                <td className="px-6 py-4 text-gray-700">{t.category}</td>
                                                <td className="px-6 py-4 text-gray-700">{new Date(t.date).toLocaleDateString("pt-BR")}</td>
                                                <td className={`px-6 py-4 font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {t.type === "income" ? "+" : "–"} R$ {t.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}