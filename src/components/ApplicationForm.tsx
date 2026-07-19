"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import Header from "./Header";
import CharCounterTextarea from "./CharCounterTextarea";
import FileUploadBox from "./FileUploadBox";
import ConsentCheckboxes, { CONSENT_ITEMS } from "./ConsentCheckboxes";
import SuccessModal from "./SuccessModal";
import { useToast } from "./Toast";
import { saveDraft, loadDraft, clearDraft } from "@/lib/draft";
import { submitApplication } from "@/lib/api";
import type { QuestionGroup, Track } from "@/lib/questionConfig";
import type { SiteContent } from "@/lib/siteContent";

type Props = {
  track: Track;
  group: string;
  groupConfig: QuestionGroup;
  content: SiteContent;
};

export default function ApplicationForm({ track, group, groupConfig, content }: Props) {
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState<string[]>(groupConfig.questions.map(() => ""));
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState<boolean[]>(CONSENT_ITEMS.map(() => false));
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasHydrated = useRef(false);

  useEffect(() => {
    const draft = loadDraft(track, group);
    if (draft) {
      setName(draft.name || "");
      setEmail(draft.email || "");
      setPhone(draft.phone || "");
      setStudentId(draft.studentId || "");
      if (draft.answers?.length === groupConfig.questions.length) {
        setAnswers(draft.answers);
      }
      showToast("작성 중이던 내용을 불러왔어요. (첨부파일은 다시 선택해주세요)", "info");
    }
    hasHydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    const t = setTimeout(() => {
      saveDraft(track, group, { name, email, phone, studentId, answers });
    }, 500);
    return () => clearTimeout(t);
  }, [name, email, phone, studentId, answers, track, group]);

  const updateAnswer = (idx: number, v: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
  };

  const allConsented = consent.every(Boolean);

  const validate = () => {
    const missingIdentity = !name.trim() || !email.trim() || !phone.trim();
    const missingAnswer = answers.some((a) => !a.trim());
    if (missingIdentity || missingAnswer) {
      showToast(content.missingRequiredMessage, "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!allConsented) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitApplication({
        track,
        group,
        name,
        email,
        phone,
        studentId,
        answers,
        file,
      });
      clearDraft(track, group);
      setShowSuccess(true);
    } catch (e: any) {
      showToast(e?.message || "제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100dvh" }}>
      <Header showBack />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-label)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-orange)" }}>
            {track === "editor" ? "EDITOR" : "DESIGNER"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: "var(--color-black)",
              margin: "6px 0 0",
            }}
          >
            {groupConfig.label} 지원서
          </h1>
        </div>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>지원자 정보</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={inputStyle}
              placeholder="이름 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="이메일 * (접수 확인 메일을 보내드려요)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="연락처 *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="학번 (선택)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        </section>

        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>지원 질문</h2>
          {groupConfig.questions.map((q, idx) => (
            <CharCounterTextarea
              key={idx}
              index={idx + 1}
              question={q}
              value={answers[idx]}
              onChange={(v) => updateAnswer(idx, v)}
            />
          ))}
        </section>

        <FileUploadBox file={file} onChange={setFile} tooLargeMessage={content.fileTooLargeMessage} />

        {content.fileEmailNoticeMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginTop: -10,
              marginBottom: 22,
              padding: "12px 14px",
              borderRadius: 10,
              background: "var(--color-orange-tint)",
              color: "var(--color-orange-dark)",
              fontSize: 12.5,
              lineHeight: 1.6,
            }}
          >
            <Mail size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{content.fileEmailNoticeMessage}</span>
          </div>
        )}

        <ConsentCheckboxes checked={consent} onChange={setConsent} />

        <button
          onClick={handleSubmit}
          disabled={!allConsented || submitting}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 999,
            border: "none",
            fontWeight: 800,
            fontSize: 15.5,
            color: "#fff",
            background: !allConsented || submitting ? "#D8DCE0" : "var(--color-orange)",
            transition: "background 0.15s",
          }}
        >
          {submitting ? "제출 중..." : "지원서 제출하기"}
        </button>
      </div>

      <SuccessModal
        open={showSuccess}
        message={content.thankYouMessage}
        onClose={() => router.push("/")}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid var(--color-line)",
  fontSize: 14.5,
  outline: "none",
};