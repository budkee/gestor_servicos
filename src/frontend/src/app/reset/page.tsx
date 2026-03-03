"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const hasValidParams = Boolean(uid && token);

  return (
    <AuthLayout
      title="Defina sua nova senha"
      subtitle="Use uma senha forte para voltar ao seu painel com seguranca."
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Redefinicao
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Nova senha</h2>
          <p className="mt-2 text-sm text-slate-300">
            Digite sua nova senha para concluir a recuperacao.
          </p>
        </div>

        {hasValidParams ? (
          <form
            action="/api/password-reset/confirm"
            method="post"
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="uid" value={uid} />
            <input type="hidden" name="token" value={token} />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-200">
                Nova senha
              </label>
              <Input
                name="password"
                type="password"
                minLength={6}
                required
                placeholder="Digite sua nova senha"
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <Button type="submit" className="w-full">
              Redefinir senha
            </Button>
          </form>
        ) : (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            Link invalido. Solicite uma nova recuperacao de senha.
          </div>
        )}

        <div className="text-xs text-slate-400">
          <Link href="/forgot" className="text-emerald-300 hover:text-emerald-200">
            Solicitar novo link
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  );
}
