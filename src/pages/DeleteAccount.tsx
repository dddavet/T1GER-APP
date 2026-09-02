import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/** Public web entry point required for account deletion outside the installed app. */
export const DeleteAccount = () => {
  const { user, loading, googleSignIn, emailPasswordSignIn, deleteAccountAndData } = useAuth();
  const isEs = navigator.language.startsWith('es');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState('');
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try { await action(); }
    catch { setError(isEs ? 'No se pudo completar. Vuelve a iniciar sesión y reintenta. No se confirmará la eliminación hasta que termine.' : 'Unable to complete. Sign in again and retry. Deletion is only confirmed after it finishes.'); }
    finally { setBusy(false); }
  };
  return (
    <main className="min-h-dvh bg-[#09090B] px-6 py-12 text-white">
      <section className="mx-auto max-w-md space-y-6 rounded-3xl border border-white/10 bg-[#121216] p-6">
        <a href="/" className="font-bold text-[#FF7300]">T1GER</a>
        <h1 className="text-3xl font-bold">{isEs ? 'Eliminar cuenta y datos' : 'Delete account and data'}</h1>
        {deleted ? <p role="status">{isEs ? 'Tu cuenta y los datos de T1GER se eliminaron.' : 'Your account and T1GER data have been deleted.'}</p> : <>
          <p className="text-sm leading-relaxed text-zinc-300">{isEs
            ? 'Se eliminarán tu perfil, progreso, pruebas, conversaciones y relaciones de Squad. Los retos activos se cancelarán y se devolverá la apuesta de tu compañero. Esta acción no se puede deshacer.'
            : 'Your profile, progress, proofs, conversations and Squad relationships will be deleted. Active challenges are cancelled and your opponent’s stake is refunded. This cannot be undone.'}</p>
          {loading ? <p role="status">{isEs ? 'Cargando…' : 'Loading…'}</p> : user ? <>
            <p className="break-all text-sm">{user.email}</p>
            <label className="flex gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />{isEs ? 'Entiendo y quiero eliminar mi cuenta permanentemente.' : 'I understand and want to permanently delete my account.'}</label>
            <button disabled={!confirmed || busy} onClick={() => void run(async () => { await deleteAccountAndData(); setDeleted(true); })} className="min-h-12 w-full rounded-xl bg-red-600 px-4 font-semibold disabled:opacity-40">{busy ? (isEs ? 'Eliminando…' : 'Deleting…') : (isEs ? 'Eliminar permanentemente' : 'Permanently delete')}</button>
          </> : <>
            <p className="text-sm text-zinc-400">{isEs ? 'Verifica tu identidad iniciando sesión.' : 'Sign in to verify your identity.'}</p>
            <form className="space-y-3" onSubmit={event => { event.preventDefault(); void run(() => emailPasswordSignIn(email, password)); }}>
              <label className="block text-sm">Email<input required autoComplete="email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="t1ger-input mt-2 w-full" /></label>
              <label className="block text-sm">{isEs ? 'Contraseña' : 'Password'}<input required autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} className="t1ger-input mt-2 w-full" /></label>
              <button disabled={busy} className="t1ger-primary-button w-full">{isEs ? 'Iniciar sesión' : 'Sign in'}</button>
            </form>
            <button disabled={busy} onClick={() => void run(googleSignIn)} className="min-h-12 w-full rounded-xl border border-white/20">{isEs ? 'Continuar con Google' : 'Continue with Google'}</button>
          </>}
        </>}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <a href="/?view=privacy" className="block text-sm text-zinc-400 underline">{isEs ? 'Política de privacidad' : 'Privacy policy'}</a>
      </section>
    </main>
  );
};
