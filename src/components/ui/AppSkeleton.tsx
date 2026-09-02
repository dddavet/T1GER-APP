import React from 'react';

export const AppSkeleton = () => {
  return (
    <div role="status" aria-label="Loading T1GER" className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#09090B] px-3.5 text-[#F7F4F1]">
      <div className="mt-[calc(.55rem+env(safe-area-inset-top))] flex h-11 items-center justify-between rounded-2xl border border-white/7 bg-[#121216] px-3">
        <div className="flex items-center gap-2"><span className="h-7 w-7 animate-pulse rounded-xl bg-white/7" /><span className="h-3 w-16 animate-pulse rounded bg-white/7" /></div>
        <div className="flex gap-1.5"><span className="h-7 w-14 animate-pulse rounded-lg bg-white/7" /><span className="h-7 w-10 animate-pulse rounded-lg bg-white/7" /><span className="h-7 w-10 animate-pulse rounded-lg bg-white/7" /></div>
      </div>
      <div className="mt-4 flex-1 space-y-4 overflow-hidden">
        <section className="overflow-hidden rounded-[1.75rem] border border-white/7 bg-[#121216] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3"><div className="h-2.5 w-24 animate-pulse rounded bg-[#FF7300]/16" /><div className="h-7 w-48 animate-pulse rounded-lg bg-white/8" /><div className="h-3 w-full animate-pulse rounded bg-white/6" /><div className="h-3 w-4/5 animate-pulse rounded bg-white/6" /></div>
            <div className="h-24 w-24 animate-pulse rounded-[2rem] bg-white/6" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-white/6"><span className="h-16 animate-pulse bg-[#0E0E12]" /><span className="h-16 animate-pulse bg-[#0E0E12]" /><span className="h-16 animate-pulse bg-[#0E0E12]" /></div>
        </section>
        <div className="h-14 animate-pulse rounded-2xl border border-white/6 bg-[#121216]" />
        <section className="rounded-[1.5rem] border border-white/7 bg-[#121216] p-4"><div className="h-3 w-28 animate-pulse rounded bg-white/7" /><div className="mt-3 h-5 w-52 animate-pulse rounded bg-white/8" /><div className="mt-4 h-2 w-full animate-pulse rounded bg-white/6" /></section>
        <section className="rounded-[1.5rem] border border-[#FF7300]/12 bg-[#121216] p-4"><div className="h-3 w-24 animate-pulse rounded bg-[#FF7300]/16" /><div className="mt-3 h-5 w-44 animate-pulse rounded bg-white/8" /><div className="mt-3 h-3 w-full animate-pulse rounded bg-white/6" /></section>
      </div>
      <div className="mb-[calc(.5rem+env(safe-area-inset-bottom))] grid h-16 grid-cols-4 gap-2 rounded-[1.5rem] border border-white/7 bg-[#121216] p-2"><span className="animate-pulse rounded-xl bg-[#FF7300]/10" /><span className="animate-pulse rounded-xl bg-white/4" /><span className="animate-pulse rounded-xl bg-white/4" /><span className="animate-pulse rounded-xl bg-white/4" /></div>
      <span className="sr-only">Loading T1GER</span>
    </div>
  );
};
