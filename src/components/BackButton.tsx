"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // 히스토리가 있으면 뒤로가기, 없으면 fallback 경로로 이동
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      aria-label="뒤로가기"
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid var(--color-line)",
        background: "var(--color-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(20,22,26,0.06)",
        zIndex: 20,
      }}
    >
      <ArrowLeft size={20} color="var(--color-black)" />
    </button>
  );
}
