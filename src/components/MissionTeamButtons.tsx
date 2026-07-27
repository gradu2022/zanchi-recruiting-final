"use client";

import { useEffect, useRef, useState } from "react";
import { X, Pencil, Check, Bold, Italic, Underline } from "lucide-react";
import { getAdminToken } from "@/lib/adminAuth";
import { saveAdminSettings } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import { sanitizeRichText, linkifyRichText } from "@/lib/richText";

type Group = { label: string; description?: string };

type Props = {
  groups: Record<string, Group>;
  track?: "editor" | "designer";
};

// ART/PLACE/PEOPLE 버튼 3개. 마우스를 올리면 해당 팀의 미션 설명이 잠깐 보이고,
// 클릭하면 그 설명이 고정(pin)됩니다. 고정된 상태에서는 오른쪽 위 X로 닫을 수 있어요.
// 관리자 로그인 상태에서는 고정된 설명 옆에 연필 아이콘이 떠서 바로 그 팀의 설명을 수정할 수 있습니다
// (굵게/기울임/밑줄 서식도 선택 영역에 바로 적용 가능).
export default function MissionTeamButtons({ groups, track = "editor" }: Props) {
  const { showToast } = useToast();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  const activeKey = pinned || hovered;
  const activeGroup = activeKey ? groups[activeKey] : null;
  const activeDescription = activeKey ? overrides[activeKey] ?? activeGroup?.description ?? "" : "";

  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.innerHTML = activeDescription || "";
      document.execCommand("defaultParagraphSeparator", false, "br");
      editorRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const startEdit = () => setEditing(true);

  const withFocus = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    fn();
  };
  const exec = (cmd: string) => document.execCommand(cmd);

  const save = async () => {
    if (!activeKey || !editorRef.current) return;
    setSaving(true);
    try {
      const html = sanitizeRichText(editorRef.current.innerHTML);
      const nextGroups = {
        ...groups,
        [activeKey]: { ...groups[activeKey], description: html },
      };
      await saveAdminSettings({ questionGroups: { [track]: nextGroups } });
      setOverrides((prev) => ({ ...prev, [activeKey]: html }));
      setEditing(false);
      showToast("수정사항이 반영되었습니다.", "success");
    } catch (e: any) {
      showToast(e.message || "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11.5, color: "var(--color-orange-dark)", opacity: 0.85, marginBottom: 6 }}>
        👇 팀을 누르면(또는 마우스를 올리면) 미션 내용이 보여요
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {Object.entries(groups).map(([key, g]) => (
          <button
            key={key}
            type="button"
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setPinned((prev) => (prev === key ? null : key));
              setEditing(false);
            }}
            style={{
              flex: 1,
              padding: "10px 6px",
              borderRadius: 10,
              border: `1.5px solid ${activeKey === key ? "var(--color-orange)" : "transparent"}`,
              background: activeKey === key ? "#fff" : "rgba(255,255,255,0.5)",
              color: "var(--color-orange-dark)",
              fontWeight: 800,
              fontSize: 13,
              boxShadow: activeKey === key ? "0 2px 8px rgba(204,82,0,0.18)" : "none",
              transition: "background 0.12s, border-color 0.12s",
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {activeKey && (activeDescription || isAdmin) && (
        <div
          style={{
            position: "relative",
            marginTop: 8,
            padding: "12px 34px 12px 14px",
            borderRadius: 10,
            background: "#fff",
            border: "1px solid var(--color-line)",
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--color-black)",
          }}
        >
          {pinned && (
            <button
              onClick={() => {
                setPinned(null);
                setEditing(false);
              }}
              aria-label="닫기"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "none",
                border: "none",
                color: "var(--color-sub)",
              }}
            >
              <X size={14} />
            </button>
          )}
          <div style={{ fontWeight: 800, marginBottom: 4, color: "var(--color-orange-dark)" }}>
            {activeGroup?.label}
          </div>

          {editing ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 4,
                  padding: 3,
                  borderRadius: 7,
                  background: "#fff",
                  border: "1px solid var(--color-line-strong)",
                  width: "fit-content",
                }}
              >
                <button type="button" onMouseDown={withFocus(() => exec("bold"))} style={toolBtnStyle} aria-label="굵게">
                  <Bold size={12} />
                </button>
                <button type="button" onMouseDown={withFocus(() => exec("italic"))} style={toolBtnStyle} aria-label="기울임">
                  <Italic size={12} />
                </button>
                <button type="button" onMouseDown={withFocus(() => exec("underline"))} style={toolBtnStyle} aria-label="밑줄">
                  <Underline size={12} />
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1.5px solid var(--color-orange)",
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  color: "var(--color-black)",
                }}
              />
              <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  aria-label="취소"
                  style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--color-line-strong)", background: "#fff" }}
                >
                  <X size={13} />
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  aria-label="저장"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1px solid var(--color-orange)",
                    background: "var(--color-orange)",
                    color: "#fff",
                  }}
                >
                  <Check size={13} />
                </button>
              </div>
            </>
          ) : (
            <>
              {activeDescription ? (
                <span dangerouslySetInnerHTML={{ __html: linkifyRichText(activeDescription) }} />
              ) : (
                <span style={{ color: "var(--color-sub)" }}>(비어 있음 — 연필 아이콘을 눌러 입력하세요)</span>
              )}
              {isAdmin && pinned && (
                <button
                  onClick={startEdit}
                  aria-label="편집"
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "1px solid var(--color-line-strong)",
                    background: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-orange)",
                    boxShadow: "0 1px 4px rgba(20,22,26,0.12)",
                  }}
                >
                  <Pencil size={11} />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const toolBtnStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 5,
  border: "none",
  background: "transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-black)",
};
