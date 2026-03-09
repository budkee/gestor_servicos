import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/orcamentos", label: "Meus Orçamentos" },
  { href: "/orcamentos/novo", label: "Novo Orçamento" },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-full">
        <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950 px-6 py-8 md:flex">
          <div className="text-lg font-semibold tracking-wide text-white">
            Gestor Digital
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            Orçamentos
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <form action="/api/logout" method="post">
              <Button type="submit" variant="secondary" className="w-full">
                Sair
              </Button>
            </form>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col bg-slate-50 text-slate-900">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Painel
              </p>
              <h1 className="text-xl font-semibold">Orçamentos</h1>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                API conectada
              </span>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
