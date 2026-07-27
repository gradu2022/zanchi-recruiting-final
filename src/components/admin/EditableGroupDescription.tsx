"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X, Bold, Italic, Underline } from "lucide-react";
import { getAdminToken } from "@/lib/adminAuth";
import { saveAdminSettings } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import { sanitizeRichText, linkifyRichText } from "@/lib/richText";

type Group = { label: string; description?: string; questions: string[] };

type Props = {
  groups: Record<string, Group>; // 같은 트랙(editor/designer)의 모든 그룹 — 저장 시 형제 그룹 데이터 보존용
  activeKey: string; // 지금 보고 있는 그룹(예: "design", "content-design")
  track: "editor" | "designer";
  style?: React.CSSProperties;
};

// 미션/소개 안내 카드(디자이너·콘텐츠 디자이너 등 단일 그룹용)를 관리자 로그인 시
// 연필 아이콘으로 바로 수정할 수 있게 합니다. 굵게/기울임/밑줄 서식도 지원합니다.
export default function EditableGroupDescription({ groups, activeKey, track, style }: Props) {
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [override, setOverride] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  const value = override ?? groups[activeKey]?.description ?? "";

  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      document.execCommand("defaultParagraphSeparator", false, "br");
      editorRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  if (!isAdmin && !value) return null;

  const startEdit = () => setEditing(true);
  const cancel = () => setEditing(false);

  const withFocus = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    editorRef.current?.focus();
    fn();
  };
  const exec = (cmd: string) => document.execCommand(cmd);

  const save = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    try {
      const html = sanitizeRichText(editorRef.current.innerHTML);
      const nextGroups = {
        ...groups,
        [activeKey]: { ...groups[activeKey], description: html },
      };
      await saveAdminSettings({ questionGroups: { [track]: nextGroups } });
      setOverride(html);
      setEditing(false);
      showToast("수정사항이 반영되었습니다.", "success");
    } catch (e: any) {
      showToast(e.message || "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div style={{ position: "relative", ...style }}>
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
            minHeight: 100,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1.5px solid var(--color-orange)",
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
            background: "#fff",
            color: "var(--color-black)",
          }}
        />
        <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
          <button onClick={cancel} disabled={saving} aria-label="취소" style={smallBtnStyle}>
            <X size={13} />
          </button>
          <button
            onClick={save}
            disabled={saving}
            aria-label="저장"
            style={{ ...smallBtnStyle, background: "var(--color-orange)", borderColor: "var(--color-orange)", color: "#fff" }}
          >
            <Check size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", ...style }}>
      {value ? (
        <span dangerouslySetInnerHTML={{ __html: linkifyRichText(value) }} />
      ) : (
        <span style={{ color: "var(--color-sub)" }}>(비어 있음 — 연필 아이콘을 눌러 입력하세요)</span>
      )}
      {isAdmin && (
        <button onClick={startEdit} aria-label="편집" style={pencilBtnStyle}>
          <Pencil size={11} />
        </button>
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

const smallBtnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "1px solid var(--color-line-strong)",
  background: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const pencilBtnStyle: React.CSSProperties = {
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
};
