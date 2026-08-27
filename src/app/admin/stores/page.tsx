'use client';

import React, { useState, useEffect } from 'react';
import { StoreHealthStatus } from '@/integrations/stores/types';
import { DbPrice } from '@/lib/db/priceRepository';
import { 
  Store, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Server,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreHealthStatus[]>([]);
  const [anomalies, setAnomalies] = useState<DbPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [storesRes, updatesRes] = await Promise.all([
        fetch('/api/stores').then((r) => r.json()),
        fetch('/api/admin/price-updates').then((r) => r.json()),
      ]);

      if (storesRes.stores) setStores(storesRes.stores);
      if (updatesRes.anomalies) setAnomalies(updatesRes.anomalies);
    } catch (err) {
      console.error('Error fetching admin store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerGlobalUpdate = async () => {
    try {
      setUpdating(true);
      setMessage('Tüm ürünler için fiyat güncelleme kuyruğa alındı...');
      const res = await fetch('/api/cron/update-prices');
      const data = await res.json();
      if (data.ok) {
        setMessage(`Başarılı! ${data.updated} adet mağaza fiyatı kontrol edildi.`);
        fetchDashboardData();
      } else {
        setMessage('Güncelleme tamamlandı.');
      }
    } catch (err) {
      setMessage('Güncelleme sırasında hata oluştu.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const testSingleStore = async (storeId: string) => {
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/test`, { method: 'POST' });
      const data = await res.json();
      alert(`${data.name} Test Sonucu: ${data.testResult.status} (${data.testResult.message || 'Tamamlandı'})`);
      fetchDashboardData();
    } catch (err) {
      alert(`Test hatası: ${String(err)}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            CONNECTED
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            NOT_CONFIGURED
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <XCircle className="w-3.5 h-3.5 text-amber-600" />
            DISABLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-700">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <Store className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-black tracking-tight">Mağaza Entegrasyonları & Fiyat Motoru</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              8 Büyük Mağazanın API bağlantı durumları, anomali kontrolü ve otomatik fiyat toplama yönetimi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerGlobalUpdate}
              disabled={updating}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
              <span>{updating ? 'Güncelleniyor...' : 'Fiyatları Şimdi Güncelle'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-sm font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-xs underline cursor-pointer">Kapat</button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Toplam Mağaza</div>
              <div className="text-2xl font-black">{stores.length}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Aktif Entegrasyon</div>
              <div className="text-2xl font-black">
                {stores.filter((s) => s.status === 'CONNECTED').length}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">API Bekleyen</div>
              <div className="text-2xl font-black">
                {stores.filter((s) => s.status === 'NOT_CONFIGURED').length}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/60 rounded-xl text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Şüpheli Anomali</div>
              <div className="text-2xl font-black">{anomalies.length}</div>
            </div>
          </div>
        </div>

        {/* Store Adapters Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight">Mağaza Adapter Durumları</h2>
            <button
              onClick={fetchDashboardData}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Yenile
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Mağaza</th>
                  <th className="py-3.5 px-6">Durum</th>
                  <th className="py-3.5 px-6">API Yapılandırma</th>
                  <th className="py-3.5 px-6">Son Kontrol</th>
                  <th className="py-3.5 px-6 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {stores.map((store) => (
                  <tr key={store.storeId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-bold flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>{store.storeName}</span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(store.status)}</td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                      {store.isConfigured ? '✓ Anahtarlar Tanımlı' : '• .env Bekleniyor'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {new Date(store.lastCheckedAt).toLocaleTimeString('tr-TR')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => testSingleStore(store.storeId)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        Bağlantıyı Test Et
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly Reviewer Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-black tracking-tight">Şüpheli Fiyat Anomalileri (Price Anomaly Guard)</h2>
          </div>
          <p className="text-xs text-slate-500">
            %70+ ani düşüş veya anormal fiyat dalgalanması tespit edilen ilanlar otomatik olarak vitrinden izole edilir.
          </p>

          {anomalies.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              ✓ Şu anda sistemde şüpheli fiyat anomalisi bulunmuyor. Tüm fiyatlar güvenli aralıkta.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500">
                    <th className="py-2.5 px-4">Ürün ID</th>
                    <th className="py-2.5 px-4">Mağaza</th>
                    <th className="py-2.5 px-4">Tespit Edilen Fiyat</th>
                    <th className="py-2.5 px-4">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {anomalies.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 font-mono font-bold">{item.productId}</td>
                      <td className="py-3 px-4">{item.storeId}</td>
                      <td className="py-3 px-4 font-black text-red-600">{item.totalPrice} ₺</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                          İZOLE EDİLDİ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
