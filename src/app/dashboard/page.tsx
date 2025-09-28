"use client";

import { auth, db } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaArrowUp, FaArrowDown, FaDollarSign, FaBell, FaChartLine } from 'react-icons/fa';
import Link from "next/link";
import Header from "@/components/header/header";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [ibovValue, setIbovValue] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Estados para dados reais
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseDistribution, setExpenseDistribution] = useState<{ name: string; value: number }[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<{ name: string; dueDate: string; value: number }[]>([]);

  // Proteção de rota
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Buscar cotação do dólar
  useEffect(() => {
    const fetchUSD = async () => {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        const data = await res.json();
        setUsdRate(parseFloat(data.USDBRL.bid));
      } catch (error) {
        console.error("Erro ao buscar USD:", error);
      }
    };
    fetchUSD();
  }, []);

  // Buscar Ibovespa (usando API pública)
  useEffect(() => {
    const fetchIbov = async () => {
      try {
        // Exemplo com API alternativa (caso a principal falhe, você pode ajustar)
        const res = await fetch("https://api.investing.com/api/1.0/financialdata/17920");
        // ⚠️ NOTA: A API do Investing pode exigir headers ou não ser pública.
        // Alternativa simples: usar dados mockados ou outra fonte confiável.
        // Para fins acadêmicos, vamos manter um fallback.
        setIbovValue(123456.78); // Substitua por uma API real se disponível
      } catch (error) {
        console.error("Erro ao buscar Ibovespa:", error);
        setIbovValue(123456.78); // Valor de exemplo
      }
    };
    fetchIbov();
  }, []);

  // 🔥 Buscar dados reais do Firestore
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        let revenue = 0;
        let expenses = 0;
        const expenseMap: Record<string, number> = {};
        const alerts: { name: string; dueDate: string; value: number }[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const amount = data.amount || 0;
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);

          if (data.type === "income") {
            revenue += amount;
          } else if (data.type === "expense") {
            expenses += amount;

            // Agrupar por categoria
            const cat = data.category || "Outros";
            expenseMap[cat] = (expenseMap[cat] || 0) + amount;

            // Verificar vencimentos futuros (status pendente e data nos próximos 7 dias)
            if (data.status === "Pendente" && data.date) {
              const dueDate = new Date(data.date);
              if (dueDate >= today && dueDate <= nextWeek) {
                alerts.push({
                  name: data.description || "Despesa",
                  dueDate: data.date,
                  value: amount,
                });
              }
            }
          }
        });

        setTotalRevenue(revenue);
        setTotalExpenses(expenses);
        setExpenseDistribution(
          Object.entries(expenseMap).map(([name, value]) => ({ name, value }))
        );
        setUpcomingPayments(alerts);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchTransactions();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (authLoading || !user || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Carregando seu dashboard...</p>
      </div>
    );
  }

  const balance = totalRevenue - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}

        <Header title="Meu Dashboard" />

        {/* Conteúdo */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balanço Geral */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Balanço Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaArrowUp className="text-green-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500">Total de Receitas</p>
                    <p className="text-2xl font-bold text-gray-800">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaArrowDown className="text-red-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500">Total de Despesas</p>
                    <p className="text-2xl font-bold text-gray-800">R$ {totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaDollarSign className="text-blue-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500">Saldo Atual</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cotação APIs */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaDollarSign className="text-yellow-500 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Dólar (USD/BRL)</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {usdRate ? `R$ ${usdRate.toFixed(2)}` : "Carregando..."}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaChartLine className="text-purple-500 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Ibovespa (IBOV)</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {ibovValue ? ibovValue.toLocaleString('pt-BR') : "Carregando..."}
                  </p>
                </div>
              </div>
            </section>

            {/* Gráfico de Despesas */}
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Despesas</h2>
              {expenseDistribution.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={expenseDistribution}
                        cx="50%" cy="50%" outerRadius={100}
                        dataKey="value" nameKey="name"
                        label={({ name, value }) => `${name}: R$ ${(value as number).toFixed(2)}`}
                      >
                        {expenseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma despesa registrada.</p>
              )}
            </section>
          </div>

          {/* Coluna Lateral (Alertas) */}
          <aside className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <FaBell className="mr-2 text-yellow-500" /> Alertas de Vencimentos
            </h2>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">{payment.name}</p>
                      <p className="text-sm text-gray-500">
                        Vence em: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="font-bold text-red-500">R$ {payment.value.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum vencimento nos próximos 7 dias.</p>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}