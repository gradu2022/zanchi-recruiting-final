"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, Pencil, Check, X } from "lucide-react";
import { getAdminToken } from "@/lib/adminAuth";
import { saveAdminSettings } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";
import { sanitizeRichText, linkifyRichText } from "@/lib/richText";

type Props = {
  value: string; // 저장된 HTML (제한된 태그만 포함)
  fieldKey: string;
  onSaved: (newValue: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
};

const FONT_SIZES = [
  { label: "작게", px: "12px" },
  { label: "보통", px: "14px" },
  { label: "크게", px: "18px" },
  { label: "아주 크게", px: "23px" },
];

// applicationInfoNotice(지원 안내) 전용 리치 텍스트 편집기입니다.
// 관리자 로그인 상태에서만 연필 아이콘이 뜨고, 편집 모드에서 굵게/기울임/밑줄/글자 크기를
// 선택 영역에 바로 적용할 수 있습니다. 저장 전 sanitizeRichText로 허용된 태그만 남깁니다.
export default function RichEditableNotice({ value, fieldKey, onSaved, placeholder, style }: Props) {
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

  const applyFontSize = (px: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      showToast("글자 크기를 적용할 부분을 먼저 드래그해서 선택해주세요.", "info");
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = px;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
  };

  const save = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    try {
      const html = sanitizeRichText(editorRef.current.innerHTML);
      await saveAdminSettings({ content: { [fieldKey]: html } });
      onSaved(html);
      setEditing(false);
      showToast("수정되었습니다.", "success");
    } catch (e: any) {
      showToast(e.message || "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    if (!value) return null;
    return <div style={style} dangerouslySetInnerHTML={{ __html: linkifyRichText(value) }} />;
  }

  if (editing) {
    return (
      <div style={style}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 6,
            padding: 4,
            borderRadius: 8,
            background: "#fff",
            border: "1px solid var(--color-line-strong)",
          }}
        >
          <button type="button" onMouseDown={withFocus(() => exec("bold"))} style={toolBtnStyle} aria-label="굵게">
            <Bold size={14} />
          </button>
          <button type="button" onMouseDown={withFocus(() => exec("italic"))} style={toolBtnStyle} aria-label="기울임">
            <Italic size={14} />
          </button>
          <button type="button" onMouseDown={withFocus(() => exec("underline"))} style={toolBtnStyle} aria-label="밑줄">
            <Underline size={14} />
          </button>
          <div style={{ width: 1, background: "var(--color-line-strong)", margin: "2px 4px" }} />
          {FONT_SIZES.map((f) => (
            <button
              key={f.px}
              type="button"
              onMouseDown={withFocus(() => applyFontSize(f.px))}
              style={{ ...toolBtnStyle, width: "auto", padding: "0 8px", fontSize: 11.5 }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          style={editBoxStyle}
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
        <div dangerouslySetInnerHTML={{ __html: linkifyRichText(value) }} />
      ) : (
        <span style={{ color: "var(--color-sub)" }}>(비어 있음 — 연필 아이콘을 눌러 입력하세요)</span>
      )}
      <button onClick={startEdit} aria-label="편집" style={pencilBtnStyle}>
        <Pencil size={11} />
      </button>
    </div>
  );
}

const editBoxStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 100,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1.5px solid var(--color-orange)",
  fontSize: 13,
  lineHeight: 1.7,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
  color: "var(--color-black)",
  boxSizing: "border-box",
};

const toolBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: "1px solid transparent",
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
