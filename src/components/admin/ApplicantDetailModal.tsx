"use client";

import { useState } from "react";
import { X, Download } from "lucide-react";
import { downloadApplicationFile, updateApplicationStatus, deleteApplication } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";

type Application = {
  _id: string;
  track: string;
  group: string;
  groupLabel: string;
  name: string;
  email: string;
  phone: string;
  university?: string;
  status: "대기" | "합격" | "불합격";
  answers: { question: string; answer: string }[];
  file?: { originalName?: string; storedName?: string; gridfsId?: string };
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  대기: "var(--color-sub)",
  합격: "var(--color-success)",
  불합격: "var(--color-danger)",
};

export default function ApplicantDetailModal({
  application,
  onClose,
  onStatusChanged,
  onDeleted,
}: {
  application: Application;
  onClose: () => void;
  onStatusChanged: (id: string, status: "대기" | "합격" | "불합격") => void;
onDeleted: (id: string) => void;
}) {
  const { showToast } = useToast();
  const [status, setStatus] = useState(application.status);
const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const changeStatus = async (next: "대기" | "합격" | "불합격") => {
    setSaving(true);
    try {
      await updateApplicationStatus(application._id, next);
      setStatus(next);
      onStatusChanged(application._id, next);
      showToast(`상태가 '${next}'(으)로 변경되었습니다.`, "success");
    } catch (e: any) {
      showToast(e.message || "상태 변경에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadApplicationFile(
        application._id,
        application.file?.storedName || application.file?.originalName || "attachment"
      );
    } catch (e: any) {
      showToast(e.message || "파일 다운로드에 실패했습니다.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-overlay)",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 640,
          maxHeight: "88vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "22px 22px 34px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--color-sub)", fontWeight: 700 }}>
              {application.track === "editor" ? "EDITOR" : "DESIGNER"} · {application.groupLabel}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 0" }}>{application.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ fontSize: 13, color: "var(--color-sub)", marginTop: 10, lineHeight: 1.8 }}>
          이메일: {application.email} · 연락처: {application.phone} · 대학교:{" "}
          {application.university || "미입력"}
          <br />
          접수: {new Date(application.createdAt).toLocaleString("ko-KR")}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {(["대기", "합격", "불합격"] as const).map((s) => (
            <button
              key={s}
              disabled={saving}
              onClick={() => changeStatus(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: `1.5px solid ${STATUS_COLORS[s]}`,
                background: status === s ? STATUS_COLORS[s] : "transparent",
                color: status === s ? "#fff" : STATUS_COLORS[s],
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {application.file?.storedName && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 10,
              border: "1.5px solid var(--color-line)",
              background: "#fff",
              fontSize: 13,
            }}
          >
            <Download size={16} />
            {downloading ? "다운로드 중..." : `첨부파일 다운로드 (${application.file.storedName})`}
          </button>
        )}

<button
          onClick={async () => {
            if (!confirm(`${application.name}님의 지원서를 정말 삭제할까요? 되돌릴 수 없습니다.`)) return;
            setDeleting(true);
            try {
              await deleteApplication(application._id);
              showToast("지원서가 삭제되었습니다.", "success");
              onDeleted(application._id);
              onClose();
            } catch (e: any) {
              showToast(e.message || "삭제에 실패했습니다.", "error");
            } finally {
              setDeleting(false);
            }
          }}
          disabled={deleting}
          style={{
            marginTop: 10,
            display: "block",
            fontSize: 12.5,
            color: "var(--color-danger)",
            background: "none",
            border: "1px solid var(--color-danger)",
            borderRadius: 8,
            padding: "8px 14px",
          }}
        >
          {deleting ? "삭제 중..." : "🗑 이 지원서 삭제하기"}
        </button>
        <div style={{ marginTop: 22 }}>
          {application.answers.map((qa, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                Q{i + 1}. {qa.question}
              </div>
              <div style={{ fontSize: 13.5, color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {qa.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
