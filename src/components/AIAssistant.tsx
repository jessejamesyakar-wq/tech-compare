// src/components/AIAssistant.tsx
//
// aceleEtme AI Ürün Danışmanı - Chat Widget
//
// Sağ alt köşede sabit duran bir chat balonu açar. Kullanıcı mesaj yazınca
// /api/ai-assistant endpoint'ine istek atar ve dönen öneriyi + varsa
// önerilen ürün kartlarını gösterir.
//
// Kullanım: Ana layout'a <AIAssistant /> olarak eklenir.

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, Sparkles, X, Send, ArrowRight, Tag } from "lucide-react";

export interface Recommendation {
  productId: string;
  slug?: string;
  productName?: string;
  category?: string;
  price?: number;
  reason: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        'Merhaba! Ben aceleEtme AI Alışveriş Danışmanıyım. 🤖\nSize nasıl bir ürün bulmamda yardımcı olabilirim? Örn: "15.000 TL altı, kamerası iyi bir telefon"',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = nextMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) {
        throw new Error("İstek başarısız");
      }

      const data: { reply: string; recommendations: Recommendation[] } = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          recommendations: data.recommendations,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Üzgünüm, şu anda yanıt veremiyorum. Lütfen birazdan tekrar deneyin.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  const getProductUrl = (r: Recommendation) => {
    const category = r.category === "smartphones" ? "phones" : r.category || "phones";
    const slug = r.slug || r.productId;
    return `/${category}/${slug}`;
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {isOpen && (
        <div
          style={{
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            height: 500,
            maxHeight: "calc(100vh - 120px)",
            marginBottom: 12,
            borderRadius: 20,
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 45px rgba(0,0,0,0.5), 0 0 25px rgba(16,185,129,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5, letterSpacing: "-0.01em" }}>
                  aceleEtme AI Asistanı
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 10.5, fontWeight: 500 }}>
                  Canlı Ürün & Fiyat Danışmanı
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Kapat"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                padding: "4px 8px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    background: m.role === "user" ? "#059669" : "#1e293b",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: 14,
                    maxWidth: "88%",
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>

                {/* Recommendation Cards */}
                {m.recommendations && m.recommendations.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingLeft: 4 }}>
                    {m.recommendations.map((r, rIdx) => (
                      <Link
                        key={rIdx}
                        href={getProductUrl(r)}
                        style={{
                          fontSize: 12,
                          color: "#f8fafc",
                          background: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.25)",
                          borderRadius: 12,
                          padding: "9px 12px",
                          textDecoration: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          transition: "all 0.2s ease",
                        }}
                        className="hover:border-emerald-400 hover:bg-emerald-950/40 group"
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontWeight: 800, color: "#34d399", fontSize: 12.5 }}>
                            {r.productName || r.slug || r.productId}
                          </span>
                          {r.price && r.price > 0 && (
                            <span style={{ fontWeight: 800, color: "#fbbf24", fontSize: 11.5 }}>
                              ₺{r.price.toLocaleString("tr-TR")}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#cbd5e1", lineHeight: 1.35 }}>
                          {r.reason}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#6ee7b7",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <span>Ürünü ve Mağaza Fiyatlarını İncele</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  color: "#34d399",
                  fontSize: 12,
                  background: "#1e293b",
                  padding: "8px 14px",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Katalog taranıyor ve analiz ediliyor…</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              gap: 8,
              background: "#090d16",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Örn: 20.000 TL altı en iyi OLED TV..."
              style={{
                flex: 1,
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "9px 12px",
                color: "#fff",
                fontSize: 12.5,
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                padding: "0 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>Gönder</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="aceleEtme AI Asistanı Aç/Kapat"
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
          border: "2px solid rgba(255,255,255,0.25)",
          boxShadow: "0 8px 24px rgba(5,150,105,0.45)",
          cursor: "pointer",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        className="hover:scale-105 active:scale-95"
      >
        <Bot className="w-7 h-7 stroke-[2.2]" />
      </button>
    </div>
  );
}
