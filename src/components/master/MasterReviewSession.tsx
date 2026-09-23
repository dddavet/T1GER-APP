import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Eye, X } from '@phosphor-icons/react';
import { useBrain } from '../../contexts/BrainContext';
import type { MasteryItem } from '../../services/masteryService';
import type { LearningLocale } from '../../services/interactiveCurriculumTypes';

interface MasterReviewSessionProps {
  items: MasteryItem[];
  locale: LearningLocale;
  onClose: () => void;
}

const ratings = [
  { key: 'again', score: 25, en: 'Again', es: 'Otra vez', noteEn: 'I missed it', noteEs: 'No lo recordé' },
  { key: 'hard', score: 60, en: 'Hard', es: 'Difícil', noteEn: 'It took effort', noteEs: 'Me costó' },
  { key: 'good', score: 82, en: 'Good', es: 'Bien', noteEn: 'I recalled it', noteEs: 'Lo recordé' },
  { key: 'easy', score: 100, en: 'Easy', es: 'Fácil', noteEn: 'Instant recall', noteEs: 'Fue inmediato' },
] as const;

export const MasterReviewSession: React.FC<MasterReviewSessionProps> = ({ items, locale, onClose }) => {
  const { reviewMission } = useBrain();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = items[index];
  const copy = useMemo(() => ({
    review: locale === 'es' ? 'Repaso activo' : 'Active review',
    instruction: locale === 'es' ? 'Recuerda antes de revelar.' : 'Recall before you reveal.',
    reveal: locale === 'es' ? 'Revelar respuesta' : 'Reveal answer',
    answer: locale === 'es' ? 'Respuesta esencial' : 'Essential answer',
    judge: locale === 'es' ? '¿Qué tan bien lo recordaste?' : 'How well did you recall it?',
    complete: locale === 'es' ? 'Repaso completado' : 'Review complete',
    completeBody: locale === 'es' ? 'FSRS ya programó cada concepto según tu recuerdo real.' : 'FSRS scheduled each concept from your actual recall.',
    done: locale === 'es' ? 'Volver a Master' : 'Back to Master',
  }), [locale]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, [finished]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!item || finished) {
    return (
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={copy.complete} className="fixed inset-0 z-[200] mx-auto grid max-w-md place-items-center bg-[#09090B] px-6 text-white">
        <section className="w-full text-center" aria-live="polite">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-400/25">
            <Check size={27} weight="bold" />
          </span>
          <p className="mt-7 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">MASTER</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{copy.complete}</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-400">{copy.completeBody}</p>
          <button type="button" onClick={onClose} className="t1ger-primary-button mt-9 w-full justify-between px-5 text-black">
            <span>{copy.done}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-black/15"><ArrowLeft size={16} weight="bold" /></span>
          </button>
        </section>
      </div>
    );
  }

  const submitRating = (score: number) => {
    reviewMission(item.lesson.id, score);
    if (index >= items.length - 1) setFinished(true);
    else {
      setIndex((current) => current + 1);
      setRevealed(false);
    }
  };

  return (
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={copy.review} className="fixed inset-0 z-[200] mx-auto flex max-w-md flex-col bg-[#09090B] text-white">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} aria-label={locale === 'es' ? 'Cerrar repaso' : 'Close review'} className="grid h-10 w-10 place-items-center rounded-full bg-white/[.05] text-zinc-300 ring-1 ring-white/10 active:scale-95">
          <X size={18} weight="bold" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.07]">
          <div className="h-full rounded-full bg-[#FF7300] transition-transform duration-500 [transform-origin:left]" style={{ transform: `scaleX(${(index + 1) / items.length})` }} />
        </div>
        <span className="min-w-10 text-right font-mono text-[11px] text-zinc-500">{index + 1}/{items.length}</span>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8">
        <div className="flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8A2A]">{copy.review}</p>
          <p className="mt-2 text-xs text-zinc-500">{item.lesson.title[locale]} · {copy.instruction}</p>
          <h1 className="mt-8 text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.04em] text-pretty">
            {item.lesson.learningDesign.retrievalPrompt[locale]}
          </h1>

          {revealed && (
            <section className="mt-9 border-l-2 border-[#FF7300] pl-4" aria-live="polite">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">{copy.answer}</p>
              <p className="mt-2 text-base font-semibold leading-6 text-zinc-100">{item.lesson.learningDesign.retrievalAnswer[locale]}</p>
            </section>
          )}
        </div>

        {!revealed ? (
          <button type="button" onClick={() => setRevealed(true)} className="t1ger-primary-button mt-10 w-full justify-between px-5 text-black">
            <span>{copy.reveal}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-black/15"><Eye size={17} weight="bold" /></span>
          </button>
        ) : (
          <section className="mt-10">
            <p className="mb-3 text-center text-xs font-semibold text-zinc-400">{copy.judge}</p>
            <div className="grid grid-cols-2 gap-2">
              {ratings.map((rating) => (
                <button key={rating.key} type="button" onClick={() => submitRating(rating.score)} className="min-h-14 rounded-xl bg-[#151519] px-3 py-2 text-left ring-1 ring-white/10 transition duration-200 active:scale-[.97] active:bg-white/10">
                  <span className="block text-sm font-bold text-white">{locale === 'es' ? rating.es : rating.en}</span>
                  <span className="mt-0.5 block text-[10px] text-zinc-500">{locale === 'es' ? rating.noteEs : rating.noteEn}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
