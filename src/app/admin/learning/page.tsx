'use client';

import { useAdminAccess } from '@/components/admin/AdminAccessGate';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';

interface LearnedPattern {
  id: string;
  triggerQuery: string;
  normalizedTrigger: string;
  targetCategory?: string;
  recommendedModels?: string[];
  lessonNotes: string;
  status: 'approved' | 'pending' | 'rejected';
  safetyScore: number;
  reportedByIpHash?: string;
  createdAt: string;
  approvedAt?: string;
}

interface FeedbackSubmission {
  messageId: string;
  userPrompt: string;
  assistantResponse: string;
  rating: 'positive' | 'negative';
  reasonCategory?: string;
  userComment?: string;
  timestamp: string;
}

export default function AdminLearningPage() {
  const { adminFetch } = useAdminAccess();
  const [patterns, setPatterns] = useState<LearnedPattern[]>([]);
  const [anomalies, setAnomalies] = useState<FeedbackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Manual rule creation modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminFetch('/api/admin/learning');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      if (data.ok) {
        setPatterns(data.patterns || []);
        setAnomalies(data.anomalies || []);
      }
    } catch (err) {
      setMessage('Yönetim verileri alınamadı. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action: 'approve' | 'reject' | 'delete', patternId: string) => {
    try {
      setActionLoading(patternId);
      const res = await adminFetch('/api/admin/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, patternId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      if (data.ok) {
        setMessage(data.message);
        fetchData();
      }
    } catch {
      setMessage('İşlem başarısız');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newNotes.trim()) return;

    try {
      setActionLoading('create');
      const res = await adminFetch('/api/admin/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          updatedPattern: { triggerQuery: newTrigger, lessonNotes: newNotes },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      if (data.ok) {
        setMessage(data.message);
        setShowAddModal(false);
        setNewTrigger('');
        setNewNotes('');
        fetchData();
      }
    } catch {
      setMessage('Kural eklenemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingPatterns = patterns.filter((p) => p.status === 'pending');
  const approvedPatterns = patterns.filter((p) => p.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link href="/admin/stores" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Mağazalar
                </Link>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Zero-Trust Anti-Poison Korumalı
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                RoboPengu Zeka & Öğrenme Masası
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" /> Manuel Kural Ekle
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-600 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Onay Bekleyenler</span>
            <p className="text-2xl font-black text-amber-500 mt-1">{pendingPatterns.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Aktif Öğrenilmiş Kurallar</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">{approvedPatterns.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Yakalanan Anomaliler</span>
            <p className="text-2xl font-black text-cyan-500 mt-1">{anomalies.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Güvenlik Durumu</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> %100 Kurşungeçirmez
            </p>
          </div>
        </div>

        {/* Pending Review Section */}
        {pendingPatterns.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Onayını Bekleyen Öğrenme Adayları ({pendingPatterns.length})
            </h2>
            <div className="space-y-3">
              {pendingPatterns.map((p) => (
                <div key={p.id} className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                        Güvenlik Skoru: {p.safetyScore}/100
                      </span>
                      <span className="text-xs text-slate-400">Tetikleyici:</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">"{p.triggerQuery}"</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <strong>Çıkarılan Ders:</strong> {p.lessonNotes}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction('approve', p.id)}
                      disabled={actionLoading === p.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Onayla ve Sisteme Öğret
                    </button>
                    <button
                      onClick={() => handleAction('reject', p.id)}
                      disabled={actionLoading === p.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 text-rose-700 dark:text-rose-300 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Active Rules */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            Aktif Olarak RoboPengu Hafızasındaki Kurallar ({approvedPatterns.length})
          </h2>
          <div className="space-y-2">
            {approvedPatterns.map((p) => (
              <div key={p.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      ONAYLANDI & AKTİF
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Soru Kalıbı: <span className="text-cyan-600 dark:text-cyan-400">"{p.triggerQuery}"</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Uygulanan Mantık:</strong> {p.lessonNotes}
                  </p>
                </div>
                <button
                  onClick={() => handleAction('delete', p.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Kuralı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent User Feedbacks / Anomalies */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            Son Kullanıcı Geri Bildirimleri & Şikayetler ({anomalies.length})
          </h2>
          {anomalies.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
              Henüz kaydedilmiş bir anomali veya olumsuz geri bildirim yok. Sistem sorunsuz çalışıyor! 🐧
            </div>
          ) : (
            <div className="space-y-2">
              {anomalies.slice(0, 10).map((a, idx) => (
                <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Soru: "{a.userPrompt}"
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.timestamp).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 truncate">
                    <strong>RoboPengu Yanıtı:</strong> {a.assistantResponse.slice(0, 120)}...
                  </p>
                  {a.userComment && (
                    <p className="text-amber-600 dark:text-amber-400 text-[11px]">
                      <strong>Kullanıcı Notu:</strong> {a.userComment} ({a.reasonCategory})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-500" />
              RoboPengu'ya Yeni Altın Kural Öğret
            </h3>
            <form onSubmit={handleCreateManual} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Tetikleyici Soru / Kalıp (Örn: "iPhone 18 ne zaman çıkar?")</label>
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="Soru veya kelime..."
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">RoboPengu'nun Nasıl Yaklaşması Gerektiği (Ders / Talimat)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={4}
                  placeholder="Bu soru sorulduğunda şu donanımları açıkla, şu paneli aç, şöyle yaklaş..."
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-emerald-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                >
                  Kaydet ve Öğret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
