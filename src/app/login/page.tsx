"use client";

import Link from "next/link";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Github, Google } from "@deemlol/next-icons";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  OAuthCredential,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/firebaseConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Login com email e senha
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login realizado com sucesso!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao fazer login com email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para vincular contas automaticamente
  const handleAccountLinking = async (email: string, credential: OAuthCredential) => {
    try {
      // Busca métodos de login existentes para este email
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("password")) {
        // Se existe login com email/senha, pede a senha para vincular
        const userPassword = prompt(
          `Já existe uma conta com este email (${email}).\nDigite sua senha para vincular a conta do Google/GitHub:`
        );

        if (!userPassword) {
          toast.error("Operação cancelada.");
          return null;
        }

        // Faz login com email/senha e vincula o provedor social
        const userCredential = await signInWithEmailAndPassword(auth, email, userPassword);
        await linkWithCredential(userCredential.user, credential);
        toast.success("Conta vinculada com sucesso!");
        return userCredential.user;
      } else if (methods.includes("google.com")) {
        // Se já existe conta Google, faz login com Google primeiro
        toast("Já existe uma conta Google com este email. Fazendo login...");
        const userCredential = await signInWithPopup(auth, googleProvider);
        await linkWithCredential(userCredential.user, credential);
        toast.success("Conta vinculada com sucesso!");
        return userCredential.user;
      } else if (methods.includes("github.com")) {
        // Se já existe conta GitHub, faz login com GitHub primeiro
        toast("Já existe uma conta GitHub com este email. Fazendo login...");
        const userCredential = await signInWithPopup(auth, githubProvider);
        await linkWithCredential(userCredential.user, credential);
        toast.success("Conta vinculada com sucesso!");
        return userCredential.user;
      }
    } catch (linkError: any) {
      console.error("Erro ao vincular contas:", linkError);
      toast.error("Erro ao vincular contas: " + linkError.message);
    }
    return null;
  };

  // Login social com tratamento de erros melhorado
  const handleSocialLogin = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success(`Bem-vindo, ${result.user.displayName || "usuário"}!`);
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error: any) {
      console.error("Erro no login social:", error);

      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        const credential = error.credential as OAuthCredential;

        if (email && credential) {
          toast("Vinculando contas...");
          const user = await handleAccountLinking(email, credential);
          if (user) {
            setTimeout(() => router.push("/dashboard"), 1000);
          }
        } else {
          toast.error("Não foi possível vincular as contas. Tente fazer login com o método original.");
        }
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.error("Login cancelado.");
      } else {
        toast.error(error.message || "Erro ao fazer login com rede social.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers específicos para cada provedor
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    handleSocialLogin(provider);
  };

  const handleGithubLogin = () => {
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    handleSocialLogin(provider);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-6">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Acesse sua conta</h1>
          <p className="text-gray-600">Digite suas credenciais para acessar o Finance Manager</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Lembrar-me</label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">Esqueceu sua senha?</Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? "Carregando..." : "Entrar"}
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
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Google size={24} color="#364153" />
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Github size={24} color="#364153" />
              <span className="ml-2">GitHub</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </main>
  );
}