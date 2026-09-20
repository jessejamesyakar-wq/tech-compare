'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type AdminFetch = (path: string, options?: RequestInit) => Promise<Response>;
const AdminAccessContext = createContext<{ adminFetch: AdminFetch } | null>(null);

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);
  if (!context) throw new Error('AdminAccessGate is required');
  return context;
}

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const [accessKey, setAccessKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  // Kept only in React memory: never store the key in a URL or browser storage.
  const adminFetch = useCallback<AdminFetch>(async (path, options) => {
    if (!path.startsWith('/api/')) throw new Error('Geçersiz yönetim adresi');
    const headers = new Headers(options?.headers);
    headers.set('Authorization', `Bearer ${accessKey}`);
    const response = await fetch(path, { ...options, headers, cache: 'no-store' });
    if (response.status === 401) {
      setAccessKey('');
      setError('Erişim doğrulanamadı. Lütfen yeniden giriş yapın.');
    }
    return response;
  }, [accessKey]);

  if (accessKey) {
    return <AdminAccessContext.Provider value={{ adminFetch }}>
      <div className="max-w-7xl mx-auto px-4 pt-4 flex justify-end">
        <button type="button" onClick={() => setAccessKey('')} className="min-h-11 px-4 rounded-xl border border-slate-300 text-sm">Yönetimden çık</button>
      </div>
      {children}
    </AdminAccessContext.Provider>;
  }

  return <section className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-slate-200 bg-white">
    <h1 className="text-xl font-bold">Yönetici girişi</h1>
    <p className="mt-2 text-sm text-slate-600">Yönetim işlemlerini açmak için size ait erişim anahtarını girin.</p>
    <form className="mt-5 space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setChecking(true);
      setError('');
      try {
        const response = await fetch('/api/admin/auth', { headers: { Authorization: `Bearer ${inputKey.trim()}` }, cache: 'no-store' });
        if (!response.ok) throw new Error('Erişim anahtarı doğrulanamadı veya yönetici erişimi henüz yapılandırılmadı.');
        setAccessKey(inputKey.trim());
        setInputKey('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Giriş yapılamadı.');
      } finally { setChecking(false); }
    }}>
      <label className="block text-sm font-semibold" htmlFor="admin-access-key">Erişim anahtarı</label>
      <input id="admin-access-key" type="password" autoComplete="off" spellCheck={false} value={inputKey} onChange={(event) => setInputKey(event.target.value)} required className="w-full min-h-11 p-3 text-base rounded-xl border border-slate-300" />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={checking || !inputKey.trim()} className="w-full min-h-11 rounded-xl bg-emerald-700 text-white font-semibold disabled:opacity-50">{checking ? 'Doğrulanıyor…' : 'Yönetime gir'}</button>
    </form>
  </section>;
}
