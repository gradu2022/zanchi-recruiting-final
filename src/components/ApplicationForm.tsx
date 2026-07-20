"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Phone } from "lucide-react";
import Header from "./Header";
import CharCounterTextarea from "./CharCounterTextarea";
import FileUploadBox from "./FileUploadBox";
import ConsentCheckboxes, { CONSENT_FLAT } from "./ConsentCheckboxes";
import SuccessModal from "./SuccessModal";
import EditableText from "./admin/EditableText";
import Linkify from "./Linkify";
import InterviewTimePicker from "./InterviewTimePicker";
import { useToast } from "./Toast";
import { saveDraft, loadDraft, clearDraft } from "@/lib/draft";
import { submitApplication } from "@/lib/api";
import { getAdminToken } from "@/lib/adminAuth";
import { UNIVERSITY_OPTIONS } from "@/lib/questionConfig";
import type { QuestionGroup, Track } from "@/lib/questionConfig";
import type { SiteContent } from "@/lib/siteContent";

type Props = {
  track: Track;
  group: string;
  groupConfig: QuestionGroup;
  content: SiteContent;
  editorGroups?: Record<string, { label: string }>;
};

export default function ApplicationForm({ track, group, groupConfig, content, editorGroups }: Props) {
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [secondChoiceTeam, setSecondChoiceTeam] = useState("");
  const [interviewAvailability, setInterviewAvailability] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(groupConfig.questions.map(() => ""));
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState<boolean[]>(CONSENT_FLAT.map(() => false));
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 관리자가 로그인한 상태로 이 페이지를 열면 연필 아이콘으로 바로 수정할 수 있는 문구들.
  // (저장되면 이 화면에도 즉시 반영되도록 로컬 상태로 들고 있습니다.)
  const [infoNotice, setInfoNotice] = useState(content.applicationInfoNotice || "");
  const [openChatLink, setOpenChatLink] = useState(content.contactOpenChatLink || "");
  const [contactPhone, setContactPhone] = useState(content.contactPhone || "");
  const [contactPhoneNote, setContactPhoneNote] = useState(content.contactPhoneNote || "");
  const [fileEmailNotice, setFileEmailNotice] = useState(content.fileEmailNoticeMessage || "");
  const [isAdmin, setIsAdmin] = useState(false);

  const interviewDays = (content.interviewDays || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  const hasHydrated = useRef(false);

  useEffect(() => {
    const draft = loadDraft(track, group);
    if (draft) {
      setName(draft.name || "");
      setEmail(draft.email || "");
      setPhone(draft.phone || "");
      setUniversity(draft.university || "");
      setSecondChoiceTeam(draft.secondChoiceTeam || "");
      setInterviewAvailability(draft.interviewAvailability || []);
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
      saveDraft(track, group, { name, email, phone, university, secondChoiceTeam, interviewAvailability, answers });
    }, 500);
    return () => clearTimeout(t);
  }, [name, email, phone, university, secondChoiceTeam, interviewAvailability, answers, track, group]);

  const updateAnswer = (idx: number, v: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
  };

  const allConsented = consent.every(Boolean);

  const validate = () => {
    const missingIdentity = !name.trim() || !email.trim() || !phone.trim() || !university.trim();
    const missingSecondChoice = track === "editor" && !secondChoiceTeam.trim();
    const missingInterview = interviewAvailability.length === 0;
    const missingAnswer = answers.some((a) => !a.trim());
    if (missingIdentity || missingSecondChoice || missingInterview || missingAnswer) {
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
        university,
        secondChoiceTeam,
        interviewAvailability,
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

        {(infoNotice || openChatLink || contactPhone || isAdmin) && (
          <section
            style={{
              marginBottom: 24,
              padding: "16px 16px",
              borderRadius: 12,
              background: "var(--color-orange-tint)",
              color: "var(--color-orange-dark)",
            }}
          >
            <h2 style={{ fontSize: 13.5, fontWeight: 800, marginTop: 0, marginBottom: 10 }}>지원 안내</h2>
            <EditableText
              value={infoNotice}
              fieldKey="applicationInfoNotice"
              onSaved={setInfoNotice}
              multiline
              placeholder="지원서 마감일, 면접 일정, OT/MT 일정 등을 적어주세요."
              style={{ fontSize: 13, lineHeight: 1.7, display: "block" }}
            />
            {(openChatLink || contactPhone || isAdmin) && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(204,82,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <EditableText
                  value={contactPhoneNote}
                  fieldKey="contactPhoneNote"
                  onSaved={setContactPhoneNote}
                  multiline
                  placeholder="문의 안내 문구"
                  style={{ fontSize: 12.5, lineHeight: 1.6, display: "block" }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 2 }}>
                  {openChatLink && (
                    <a
                      href={openChatLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700 }}
                    >
                      <MessageCircle size={14} /> 오픈채팅방 문의하기
                    </a>
                  )}
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700 }}
                    >
                      <Phone size={14} /> {contactPhone}
                    </a>
                  )}
                </div>
                <EditableText
                  value={openChatLink}
                  fieldKey="contactOpenChatLink"
                  onSaved={setOpenChatLink}
                  placeholder="오픈채팅방 링크 (https://open.kakao.com/...)"
                  style={{ fontSize: 11.5, opacity: 0.85, display: "block" }}
                />
                <EditableText
                  value={contactPhone}
                  fieldKey="contactPhone"
                  onSaved={setContactPhone}
                  placeholder="문의 전화번호 (예: 010-1234-5678)"
                  style={{ fontSize: 11.5, opacity: 0.85, display: "block" }}
                />
              </div>
            )}
          </section>
        )}

        {groupConfig.description && (
          <section
            style={{
              marginBottom: 24,
              padding: "16px 16px",
              borderRadius: 12,
              border: "1px solid var(--color-line)",
              background: "var(--color-card)",
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--color-black)",
              whiteSpace: "pre-wrap",
            }}
          >
            <Linkify text={groupConfig.description} />
          </section>
        )}

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>인적사항</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={inputStyle}
              placeholder="이름 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="이메일 * (활동 시 구글 드라이브를 사용하므로 구글 메일이면 더 좋습니다)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="연락처 * (예: 010-1234-5678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div>
              <div style={{ fontSize: 13, color: "var(--color-sub)", marginBottom: 8 }}>재학 중인 대학교 *</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {UNIVERSITY_OPTIONS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUniversity(u)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      border: `1.5px solid ${university === u ? "var(--color-orange)" : "var(--color-line-strong)"}`,
                      background: university === u ? "var(--color-orange-tint)" : "transparent",
                      color: university === u ? "var(--color-orange-dark)" : "var(--color-black)",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {track === "editor" && editorGroups && (
              <div>
                <div style={{ fontSize: 13, color: "var(--color-sub)", marginBottom: 8 }}>2지망 팀 *</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(editorGroups)
                    .filter(([key]) => key !== group)
                    .map(([key, g]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSecondChoiceTeam(g.label)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 999,
                          border: `1.5px solid ${secondChoiceTeam === g.label ? "var(--color-orange)" : "var(--color-line-strong)"}`,
                          background: secondChoiceTeam === g.label ? "var(--color-orange-tint)" : "transparent",
                          color: secondChoiceTeam === g.label ? "var(--color-orange-dark)" : "var(--color-black)",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>면접 가능 시간 *</h2>
          <p style={{ fontSize: 12.5, color: "var(--color-sub)", marginTop: 0, marginBottom: 10 }}>
            면접은 화상으로 진행됩니다. 가능한 날짜와 시간대를 모두 선택해주세요.
          </p>
          <InterviewTimePicker days={interviewDays} value={interviewAvailability} onChange={setInterviewAvailability} />
        </section>

        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 26 }}>지원자 필수 질문</h2>
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

        {(fileEmailNotice || isAdmin) && (
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
            <EditableText
              value={fileEmailNotice}
              fieldKey="fileEmailNoticeMessage"
              onSaved={setFileEmailNotice}
              multiline
              placeholder="첨부파일 이메일 전송 안내 문구"
              style={{ flex: 1 }}
            />
          </div>
        )}

        <ConsentCheckboxes checked={consent} onChange={setConsent} content={content} />

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