import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Vamos (re)começar?"
      subtitle="Acompanhe rapidamente os orcamentos e mantenha o fluxo das propostas."
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Bem-vinda de volta
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Entrar no painel
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Use suas credenciais para acessar o seu painel de orçamentos.
          </p>
        </div>

        <form action="/api/login" method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Usuário
            </label>
            <Input
              name="username"
              placeholder="matadordeporco67"
              required
              className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Senha
            </label>
            <Input
              name="password"
              type="password"
              placeholder="*********"
              required
              className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-950"
              />
              Manter conectado
            </label>
            <Link
              href="/forgot"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <div className="text-xs text-slate-400">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="text-emerald-300 hover:text-emerald-200"
          >
            Criar agora
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
