"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X, Bold, Italic, Underline } from "lucide-react";
import { getAdminToken } from "@/lib/adminAuth";
import { saveAdminSettings } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import { sanitizeRichText, linkifyRichText } from "@/lib/richText";

// 관리자가 로그인한 상태로 실제 지원서 페이지를 열면, 이 컴포넌트로 감싼 문구마다
// 오른쪽 위에 작은 연필 아이콘이 나타나고 클릭하면 바로 그 자리에서 수정·저장할 수 있습니다.
// 편집 중에는 굵게/기울임/밑줄을 선택 영역에 바로 적용할 수 있습니다.
// (수정 내용은 Settings.content[fieldKey]로 저장되어 /admin/cms 편집과 동일한 데이터를 공유합니다.)
type Props = {
  value: string;
  fieldKey: string;
  onSaved: (newValue: string) => void;
  multiline?: boolean;
  placeholder?: string;
  emptyLabel?: string;
  style?: React.CSSProperties;
};

export default function EditableText({
  value,
  fieldKey,
  onSaved,
  multiline,
  placeholder,
  emptyLabel = "(비어 있음 — 연필 아이콘을 눌러 입력하세요)",
  style,
}: Props) {
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      document.execCommand("defaultParagraphSeparator", false, "br");
      editorRef.current.focus();
    }
  }, [editing]);

  const startEdit = () => setEditing(true);
  const cancel = () => setEditing(false);

  const withFocus = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault(); // 버튼 클릭이 contentEditable의 현재 선택 영역을 잃지 않도록
    editorRef.current?.focus();
    fn();
  };
  const exec = (cmd: string) => document.execCommand(cmd);

  const save = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    try {
      const html = sanitizeRichText(editorRef.current.innerHTML);
      await saveAdminSettings({ content: { [fieldKey]: html } });
      onSaved(html);
      setEditing(false);
      showToast("수정사항이 반영되었습니다.", "success");
    } catch (e: any) {
      showToast(e.message || "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    if (!value) return null;
    return (
      <span
        style={{ whiteSpace: multiline ? "pre-wrap" : undefined, ...style }}
        dangerouslySetInnerHTML={{ __html: linkifyRichText(value) }}
      />
    );
  }

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
          data-placeholder={placeholder}
          onKeyDown={(e) => {
            if (!multiline && e.key === "Enter") e.preventDefault();
          }}
          style={{ ...editBoxStyle, minHeight: multiline ? 90 : 20 }}
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
        <span
          style={{ whiteSpace: multiline ? "pre-wrap" : undefined }}
          dangerouslySetInnerHTML={{ __html: linkifyRichText(value) }}
        />
      ) : (
        <span style={{ color: "var(--color-sub)" }}>{emptyLabel}</span>
      )}
      <button onClick={startEdit} aria-label="편집" style={pencilBtnStyle}>
        <Pencil size={11} />
      </button>
    </div>
  );
}

const editBoxStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1.5px solid var(--color-orange)",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "var(--color-black)",
};

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
