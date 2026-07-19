"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { getAdminToken, clearAdminToken } from "@/lib/adminAuth";
import { fetchAdminSettings, saveAdminSettings } from "@/lib/adminApi";

export default function AdminMyPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [emails, setEmails] = useState<string[]>(["", "", "", ""]);
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
        const padded = [...(settings.adminEmails || [])];
        while (padded.length < 4) padded.push("");
        setEmails(padded);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminSettings({
        adminName,
        adminEmails: emails.map((e) => e.trim()).filter(Boolean),
      });
      showToast("마이페이지 정보가 저장되었습니다.", "success");
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
          <label style={labelStyle}>알림을 받을 관리자 이메일 (최대 4개)</label>
          {emails.map((email, idx) => (
            <input
              key={idx}
              style={{ ...inputStyle, marginTop: idx > 0 ? 8 : 0 }}
              value={email}
              placeholder={`관리자 이메일 ${idx + 1}`}
              onChange={(e) => {
                const next = [...emails];
                next[idx] = e.target.value;
                setEmails(next);
              }}
            />
          ))}
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
