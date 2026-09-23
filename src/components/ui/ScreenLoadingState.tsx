type ScreenLoadingStateProps = {
  view: string;
  language: 'es' | 'en';
};

export function ScreenLoadingState({ view, language }: ScreenLoadingStateProps) {
  const titles: Record<string, { es: string; en: string }> = {
    learn: { es: 'Preparando tu camino', en: 'Preparing your path' },
    build: { es: 'Preparando tu acción', en: 'Preparing your action' },
    master: { es: 'Preparando tu repaso', en: 'Preparing your review' },
    profile: { es: 'Abriendo tu perfil', en: 'Opening your profile' },
  };
  const title = (titles[view] || { es: 'Abriendo T1GER', en: 'Opening T1GER' })[language];

  return (
    <div role="status" aria-label={title} className="mx-auto max-w-sm px-1 pt-5 text-white">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#FF9A4A]">T1GER</p>
      <p className="mt-2 text-lg font-bold tracking-tight">{title}…</p>
      <div aria-hidden="true" className="mt-5 space-y-3">
        <div className="h-28 rounded-[1.5rem] border border-white/[.08] bg-[#121216]" />
        <div className="h-14 rounded-2xl border border-white/[.06] bg-[#121216]" />
      </div>
    </div>
  );
}
