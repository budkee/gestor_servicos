export function AuthLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
        <span className="text-lg font-bold">OD</span>
      </div>
      <div>
        <p className="text-base font-semibold text-white">Orcamento Digital</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Console
        </p>
      </div>
    </div>
  );
}
