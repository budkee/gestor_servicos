import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-slate-800/60 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">
          Erro 404
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
          Vish... Parece que você se perdeu!
        </h1>
        <p className="mt-4 max-w-xl text-sm text-slate-300 md:text-base">
          A rota que você tentou acessar não existe ou foi movida para outro
          endereço.
        </p>
        <Link
          href="/orcamentos"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Voltar para o início.
        </Link>
      </section>
    </main>
  );
}
