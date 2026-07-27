"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { getAdminToken, clearAdminToken } from "@/lib/adminAuth";
import { fetchAdminSettings, saveAdminSettings } from "@/lib/adminApi";

export default function AdminMyPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    (async () => {
      try {
        const { settings } = await fetchAdminSettings();
        setAdminName(settings.adminName || "");
        const existing = settings.adminEmails || [];
        setEmails(existing.length > 0 ? existing : [""]);
      } catch (e: any) {
        if (e.status === 401) {
          clearAdminToken();
          router.replace("/admin");
          return;
        }
        showToast(e.message || "설정을 불러오지 못했습니다.", "error");
      } finally {
        setReady(true);
      }
    })();
  }, [router, showToast]);

  const addEmail = () => setEmails((prev) => [...prev, ""]);
  const removeEmail = (idx: number) =>
    setEmails((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminSettings({
        adminName,
        adminEmails: emails.map((e) => e.trim()).filter(Boolean),
      });
      showToast("수정사항이 반영되었습니다.", "success");
    } catch (e: any) {
      showToast(e.message || "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  return (
    <div>
      <Header showBack />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 80px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 21, marginBottom: 20 }}>마이페이지</h1>

        <section style={cardStyle}>
          <label style={labelStyle}>관리자 이름</label>
          <input
            style={inputStyle}
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="예: 편집장 폴"
          />
        </section>

        <section style={{ ...cardStyle, marginTop: 16 }}>
          <label style={labelStyle}>알림을 받을 관리자 이메일</label>
          <p style={{ fontSize: 12, color: "var(--color-sub)", margin: "-4px 0 10px" }}>
            리크루팅 당시의 운영진을 기준으로 업데이트 해주세요!
          </p>
          {emails.map((email, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginTop: idx > 0 ? 8 : 0 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={email}
                placeholder={`관리자 이메일 ${idx + 1}`}
                onChange={(e) => {
                  const next = [...emails];
                  next[idx] = e.target.value;
                  setEmails(next);
                }}
              />
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmail(idx)}
                  aria-label="이메일 삭제"
                  style={{
                    width: 40,
                    flexShrink: 0,
                    borderRadius: 10,
                    border: "1.5px solid var(--color-line)",
                    background: "#fff",
                    color: "var(--color-sub)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addEmail}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              marginTop: 10,
              padding: "10px 0",
              borderRadius: 10,
              border: "1.5px dashed var(--color-line-strong)",
              background: "transparent",
              color: "var(--color-sub)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Plus size={15} /> 이메일 추가
          </button>
        </section>

        <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--color-line)",
  borderRadius: 16,
  padding: 18,
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 8,
  color: "var(--color-black)",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: "1.5px solid var(--color-line)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
const saveBtnStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 20,
  padding: "13px 0",
  borderRadius: 999,
  border: "none",
  background: "var(--color-orange)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 15,
};
