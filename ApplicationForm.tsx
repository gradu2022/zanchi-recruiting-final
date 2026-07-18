"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    // 5초 후 자동 닫힘
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const close = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "max(14px, env(safe-area-inset-top))",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          zIndex: 9999,
          pointerEvents: "none",
          padding: "0 16px",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            style={{
              pointerEvents: "auto",
              width: "100%",
              maxWidth: 420,
              background: "#ffffff",
              border: `1.5px solid ${
                t.type === "error"
                  ? "var(--color-danger)"
                  : t.type === "success"
                  ? "var(--color-success)"
                  : "var(--color-line)"
              }`,
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(20,22,26,0.14)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            {t.type === "error" ? (
              <AlertCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
            ) : t.type === "success" ? (
              <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
            ) : null}
            <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5, color: "var(--color-black)" }}>
              {t.message}
            </span>
            <button
              onClick={() => close(t.id)}
              aria-label="알림 닫기"
              style={{
                background: "none",
                border: "none",
                padding: 2,
                lineHeight: 0,
                color: "var(--color-sub)",
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
