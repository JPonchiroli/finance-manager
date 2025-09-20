"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [form, setForm] = useState({ name: "", email: "", cpf: "", password: "" });
  const [loading, setLoading] = useState(false);

  const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  const unformatCPF = (cpf: string) => cpf.replace(/\D/g, "");

  const validateCPF = (cpf: string) => {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let remainder = 11 - (sum % 11);
    if ((remainder === 10 || remainder === 11 ? 0 : remainder) !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    remainder = 11 - (sum % 11);
    return (remainder === 10 || remainder === 11 ? 0 : remainder) === parseInt(cpf[10]);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanCPF = unformatCPF(e.target.value);
    if (cleanCPF.length > 11) return;
    setForm({ ...form, cpf: cleanCPF });
    if (cleanCPF.length === 11) e.target.value = formatCPF(cleanCPF);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.cpf || !form.password) return toast.error("Preencha todos os campos.");
    if (!validateCPF(form.cpf)) return toast.error("CPF inválido.");
    if (form.password.length < 6) return toast.error("Senha deve ter pelo menos 6 caracteres.");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        cpf: form.cpf,
        email: form.email,
        createdAt: new Date(),
      });
      toast.success("Conta criada! Verifique seu e-mail.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      let message = "Erro ao criar conta.";
      if (err.code === "auth/email-already-in-use") message = "Este e-mail já está cadastrado.";
      else if (err.code === "auth/invalid-email") message = "E-mail inválido.";
      else if (err.code === "auth/weak-password") message = "Senha fraca. Use pelo menos 6 caracteres.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-6">
      <Toaster position="top-center" reverseOrder={false} gutter={8} toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff', borderRadius: '8px', padding: '16px' } }} />

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Crie sua conta</h1>
          <p className="text-gray-600">Preencha os dados para se cadastrar no Finance Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={form.cpf.length === 11 ? formatCPF(form.cpf) : form.cpf}
              onChange={handleCPFChange}
              maxLength={14}
              placeholder="123.456.789-09"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continue com</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => toast("Google login placeholder")}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Google
            </button>
            <button
              onClick={() => toast("GitHub login placeholder")}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              GitHub
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
