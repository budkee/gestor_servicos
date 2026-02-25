import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPage() {
  return (
    <AuthLayout
      title="Recupere o acesso"
      subtitle="Vamos enviar um link rapido para redefinir sua senha."
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Recuperacao
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Esqueceu a senha?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Informe seu email para receber as instrucoes.
          </p>
        </div>

        <form action="/api/password-reset" method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Email
            </label>
            <Input
              name="email"
              type="email"
              placeholder="voce@empresa.com"
              required
              className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <Button type="submit" className="w-full">
            Enviar link
          </Button>
        </form>

        <div className="text-xs text-slate-400">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
            Voltar para login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
