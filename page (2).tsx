"use client";

import { PartyPopper } from "lucide-react";

// 기본값. Part 2 CMS에서 관리자가 이 문구를 편집/저장할 수 있도록 연동 예정입니다.
export const DEFAULT_THANK_YOU_MESSAGE = "지원해주셔서 감사합니다.";

type Props = {
  open: boolean;
  message?: string;
  onClose: () => void;
};

export default function SuccessModal({ open, message = DEFAULT_THANK_YOU_MESSAGE, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,22,26,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "36px 28px",
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
        }}
      >
        <PartyPopper size={36} color="var(--color-orange)" style={{ marginBottom: 10 }} />
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 999,
            border: "none",
            background: "var(--color-orange)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14.5,
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
