"use client"

import Link from "next/link";

export default function Home() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-6">

      <section className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
          Finance Manager
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          Sua plataforma inteligente para <span className="font-semibold">gestão de finanças pessoais</span>.
          Controle gastos, visualize insights e conquiste seus objetivos financeiros.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
          >
            Criar Conta
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-2xl border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            Entrar
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl">
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">📊 Dashboard Interativo</h3>
          <p className="text-gray-600">Acompanhe receitas, despesas e saldo em tempo real.</p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">🔒 Segurança</h3>
          <p className="text-gray-600">Cadastro com validação de CPF e autenticação por e-mail.</p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">📱 Acesso Fácil</h3>
          <p className="text-gray-600">Login rápido com Google ou GitHub e design responsivo.</p>
        </div>
      </section>
    </main>
  );
}
