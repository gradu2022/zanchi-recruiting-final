"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { getAdminToken, clearAdminToken } from "@/lib/adminAuth";
import { fetchAdminSettings, saveAdminSettings } from "@/lib/adminApi";

type QuestionGroup = { label: string; questions: string[] };
type QuestionGroups = {
  editor: Record<string, QuestionGroup>;
  designer: Record<string, QuestionGroup>;
};

const TEXT_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "heroTitle", label: "메인 화면 타이틀 (예: 잔치!)" },
  { key: "heroTagline", label: "메인 화면 서브 문구", multiline: true },
  { key: "aboutCtaLabel", label: "'웹진 잔치란?' 버튼 글자" },
  { key: "editorCtaLabel", label: "에디터 CTA 버튼 글자" },
  { key: "designerCtaLabel", label: "디자이너 CTA 버튼 글자" },
  { key: "thankYouMessage", label: "제출 완료 감사 멘트" },
  { key: "fileEmailNoticeMessage", label: "첨부파일 이메일 전송 안내 멘트", multiline: true },
  { key: "fileTooLargeMessage", label: "파일 용량 초과 알림 멘트", multiline: true },
  { key: "missingRequiredMessage", label: "필수 응답 누락 알림 멘트", multiline: true },
  { key: "recruitmentClosedMessage", label: "모집 마감 시 안내 멘트", multiline: true },
];

export default function AdminCmsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [questionGroups, setQuestionGroups] = useState<QuestionGroups | null>(null);
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin");
      return;
    }
    (async () => {
      try {
        const { settings } = await fetchAdminSettings();
        setContent(settings.content || {});
        setQuestionGroups(settings.questionGroups || { editor: {}, designer: {} });
        setRecruitmentOpen(settings.recruitmentOpen ?? true);
        setDeadline(
          settings.recruitmentDeadline
            ? new Date(settings.recruitmentDeadline).toISOString().slice(0, 16)
            : ""
        );
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

  const updateGroupLabel = (track: "editor" | "designer", group: string, value: string) => {
    setQuestionGroups((prev) => {
      if (!prev) return prev;
      return { ...prev, [track]: { ...prev[track], [group]: { ...prev[track][group], label: value } } };
    });
  };

  const updateQuestion = (track: "editor" | "designer", group: string, idx: number, value: string) => {
    setQuestionGroups((prev) => {
      if (!prev) return prev;
      const questions = [...prev[track][group].questions];
      questions[idx] = value;
      return { ...prev, [track]: { ...prev[track], [group]: { ...prev[track][group], questions } } };
    });
  };

  const addQuestion = (track: "editor" | "designer", group: string) => {
    setQuestionGroups((prev) => {
      if (!prev) return prev;
      const questions = [...prev[track][group].questions, "새 질문을 입력하세요."];
      return { ...prev, [track]: { ...prev[track], [group]: { ...prev[track][group], questions } } };
    });
  };

  const removeQuestion = (track: "editor" | "designer", group: string, idx: number) => {
    setQuestionGroups((prev) => {
      if (!prev) return prev;
      const questions = prev[track][group].questions.filter((_, i) => i !== idx);
      return { ...prev, [track]: { ...prev[track], [group]: { ...prev[track][group], questions } } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminSettings({
        content,
        questionGroups,
        recruitmentOpen,
        recruitmentDeadline: deadline ? new Date(deadline).toISOString() : null,
      });
      showToast("CMS 내용이 저장되었습니다.", "success");
    } catch (e: any) {
      showToast(e.message || "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!ready || !questionGroups) return null;

  return (
    <div>
      <Header showBack />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px 100px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 20 }}>
          풀 커스텀 CMS
        </h1>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>모집 상태</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <button
              onClick={() => setRecruitmentOpen((v) => !v)}
              style={{
                width: 52,
                height: 30,
                borderRadius: 999,
                border: "none",
                background: recruitmentOpen ? "var(--color-orange)" : "#D8DCE0",
                position: "relative",
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: recruitmentOpen ? 25 : 3,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.15s",
                }}
              />
            </button>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {recruitmentOpen ? "모집 중 (Open)" : "모집 마감 (Close)"}
            </span>
          </div>
          <label style={labelStyle}>마감 일시 (선택 - 지나면 자동으로 폼이 닫힙니다)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={inputStyle}
          />
        </section>

        <section style={{ ...cardStyle, marginTop: 16 }}>
          <h2 style={sectionTitleStyle}>사이트 문구</h2>
          {TEXT_FIELDS.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{f.label}</label>
              {f.multiline ? (
                <textarea
                  rows={2}
                  value={content[f.key] || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              ) : (
                <input
                  value={content[f.key] || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </section>

        {(["editor", "designer"] as const).map((track) => (
          <section key={track} style={{ ...cardStyle, marginTop: 16 }}>
            <h2 style={sectionTitleStyle}>{track === "editor" ? "에디터" : "디자이너"} 질문 목록</h2>
            {Object.entries(questionGroups[track]).map(([groupKey, group]) => (
              <div key={groupKey} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--color-line)" }}>
                <label style={labelStyle}>팀 이름 (버튼에 표시됨)</label>
                <input
                  value={group.label}
                  onChange={(e) => updateGroupLabel(track, groupKey, e.target.value)}
                  style={{ ...inputStyle, marginBottom: 10, fontWeight: 800, color: "var(--color-orange)" }}
                />
                {group.questions.map((q, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
                    <span style={qNumStyle}>{idx + 1}</span>
                    <textarea
                      rows={1}
                      value={q}
                      onChange={(e) => updateQuestion(track, groupKey, idx, e.target.value)}
                      style={{ ...inputStyle, resize: "vertical", flex: 1 }}
                    />
                    {group.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(track, groupKey, idx)}
                        style={removeBtnStyle}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addQuestion(track, groupKey)} style={addBtnStyle}>
                  + 질문 추가
                </button>
              </div>
            ))}
          </section>
        ))}

        <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
          {saving ? "저장 중..." : "전체 저장하기"}
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
const sectionTitleStyle: React.CSSProperties = { fontSize: 15, fontWeight: 800, marginTop: 0, marginBottom: 14 };
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  marginBottom: 6,
  color: "var(--color-sub)",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 9,
  border: "1.5px solid var(--color-line)",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const qNumStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "var(--color-orange)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 8,
};
const removeBtnStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--color-danger)",
  background: "none",
  border: "1px solid var(--color-line)",
  borderRadius: 8,
  padding: "0 10px",
  height: 36,
};
const addBtnStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: "#fff",
  background: "var(--color-sky)",
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
  fontWeight: 700,
};
const saveBtnStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 4,
  padding: "14px 0",
  borderRadius: 999,
  border: "none",
  background: "var(--color-orange)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 15,
  position: "sticky",
  bottom: 16,
};
