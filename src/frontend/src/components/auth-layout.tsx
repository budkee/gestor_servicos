import type React from "react";
import { AuthLogo } from "@/components/auth-logo";

type AuthLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-slate-800/50 blur-3xl" />
        <div className="absolute right-[-12rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-[-14rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="grid w-full gap-10 md:grid-cols-[1.1fr_1fr]">
          <section className="flex flex-col justify-center gap-6">
            <AuthLogo />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">
                Orcamento Digital
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                {title || "Gestao inteligente para orcamentos"}
              </h1>
              <p className="mt-3 text-sm text-slate-300 md:text-base">
                {subtitle ||
                  "Acompanhe propostas, organize servicos e mantenha o controle financeiro em um painel simples e moderno."}
              </p>
            </div>
            <ul className="grid gap-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Centralize todos os orcamentos ativos
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Gere PDFs em poucos cliques
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Painel conectado ao backend Django
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
