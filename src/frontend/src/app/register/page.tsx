import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Organize seus orcamentos e mantenha sua equipe alinhada em um painel unico."
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Cadastro
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Comece agora
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Crie uma conta para acessar seu painel de orçamentos.
          </p>
        </div>

        <form action="/api/register" method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Nome completo
            </label>
            <Input
              name="username"
              placeholder="Nome e Sobrenome"
              required
              className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
            />
          </div>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-200">
                Instagram
              </label>
              <Input
                name="instagram"
                placeholder="@seuinstagram"
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-200">
                Telefone
              </label>
              <Input
                name="phone"
                placeholder="(11) 99999-9999"
                className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-200">
              Senha
            </label>
            <Input
              name="password"
              type="password"
              placeholder="Crie uma senha forte"
              required
              className="border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950" />
            Concordo com os termos e política de privacidade.
          </label>
          <Button type="submit" className="w-full">
            Criar conta
          </Button>
        </form>

        <div className="text-xs text-slate-400">
          Ja possui conta?{" "}
          <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
            Entrar
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
