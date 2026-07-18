"use client";

import { useRef } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { useToast } from "./Toast";

export const MAX_FILE_MB = 20;

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
  tooLargeMessage?: string;
};

export default function FileUploadBox({ file, onChange, tooLargeMessage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleSelect = (f: File | null) => {
    if (!f) {
      onChange(null);
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      showToast(
        tooLargeMessage || "파일 업로드 오류 시 용량을 줄여서 다시 시도해 주세요.",
        "error"
      );
      if (inputRef.current) inputRef.current.value = "";
      onChange(null);
      return;
    }
    onChange(f);
  };

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
        파일 첨부 <span style={{ color: "var(--color-sub)", fontWeight: 400 }}>(HWP/PDF, 최대 {MAX_FILE_MB}MB, 1개)</span>
      </div>

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%",
            border: "1.5px dashed var(--color-line)",
            borderRadius: 12,
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            background: "var(--color-card)",
            color: "var(--color-sub)",
          }}
        >
          <UploadCloud size={26} color="var(--color-orange)" />
          <span style={{ fontSize: 13.5 }}>클릭해서 파일을 선택하세요</span>
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1.5px solid var(--color-line)",
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <FileText size={20} color="var(--color-orange)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13.5, wordBreak: "break-all" }}>
            {file.name} ({(file.size / (1024 * 1024)).toFixed(1)}MB)
          </span>
          <button
            type="button"
            onClick={() => handleSelect(null)}
            aria-label="첨부 취소"
            style={{ background: "none", border: "none", color: "var(--color-sub)" }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".hwp,.pdf,application/pdf"
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />
    </div>
  );
}
