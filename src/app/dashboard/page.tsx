"use client"

import { auth } from "@/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaArrowUp, FaArrowDown, FaDollarSign, FaBell, FaChartLine } from 'react-icons/fa';
import Link from "next/link";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [ibovValue, setIbovValue] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // 🔹 Buscar cotação do dólar (AwesomeAPI)
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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Carregando...</p>
      </div>
    );
  }

  // 🔹 Dados mocados (mantendo seu mock original)
  const mockData = {
    generalBalance: { totalRevenue: 5000.00, totalExpenses: 2750.50 },
    expenseDistribution: [
      { name: 'Moradia', value: 1200 },
      { name: 'Alimentação', value: 850.50 },
      { name: 'Lazer', value: 400 },
      { name: 'Transporte', value: 300 },
    ],
    upcomingPayments: [
      { name: 'Aluguel', dueDate: '2025-10-05', value: 1200 },
      { name: 'Internet', dueDate: '2025-10-10', value: 99.90 },
    ]
  };

  const balance = mockData.generalBalance.totalRevenue - mockData.generalBalance.totalExpenses;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Meu Dashboard</h1>
            <p className="text-gray-600">Bem-vindo(a) de volta, {user.displayName}!</p>
          </div>
          <div className="flex space-x-30">
            <Link href={'despesas'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Despesas</Link>
            <Link href={'#'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Receitas</Link>
            <Link href={'#'} className="text-gray-800 text-lg font-bold hover:underline hover:decoration-2">Transações</Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Sair
          </button>
        </header>

        {/* Conteúdo */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Balanço Geral */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Balanço Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Receitas */}
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaArrowUp className="text-green-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500">Total de Receitas</p>
                    <p className="text-2xl font-bold text-gray-800">R$ {mockData.generalBalance.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
                {/* Despesas */}
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaArrowDown className="text-red-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500">Total de Despesas</p>
                    <p className="text-2xl font-bold text-gray-800">R$ {mockData.generalBalance.totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
                {/* Saldo */}
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaDollarSign className="text-blue-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500">Saldo Atual</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {balance.toFixed(2)}</p>
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
                    {ibovValue ? ibovValue.toFixed(2) : "Carregando..."}
                  </p>
                </div>
              </div>
            </section>

            {/* Gráfico de Despesas */}
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Despesas</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={mockData.expenseDistribution}
                      cx="50%" cy="50%" outerRadius={100}
                      dataKey="value" nameKey="name"
                      label={(props) => `${props.name} R$ ${(props.value as number).toFixed(0)}`}
                    >
                      {mockData.expenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Coluna Lateral (Alertas) */}
          <aside className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <FaBell className="mr-2 text-yellow-500" /> Alertas de Vencimentos
            </h2>
            <div className="space-y-4">
              {mockData.upcomingPayments.map((payment, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{payment.name}</p>
                    <p className="text-sm text-gray-500">Vence em: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="font-bold text-red-500">R$ {payment.value.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
