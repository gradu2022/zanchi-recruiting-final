"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { getAdminToken } from "@/lib/adminAuth";
import { saveAdminSettings } from "@/lib/adminApi";
import { useToast } from "@/components/Toast";

// 관리자가 로그인한 상태로 실제 지원서 페이지를 열면, 이 컴포넌트로 감싼 문구마다
// 오른쪽 위에 작은 연필 아이콘이 나타나고 클릭하면 바로 그 자리에서 수정·저장할 수 있습니다.
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
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveAdminSettings({ content: { [fieldKey]: draft } });
      onSaved(draft);
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
    return (
      <span style={{ whiteSpace: multiline ? "pre-wrap" : undefined, ...style }}>{value}</span>
    );
  }

  if (editing) {
    return (
      <div style={{ position: "relative", ...style }}>
        {multiline ? (
          <textarea
            autoFocus
            rows={5}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            style={editBoxStyle}
          />
        ) : (
          <input
            autoFocus
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            style={editBoxStyle}
          />
        )}
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
      <span style={{ whiteSpace: multiline ? "pre-wrap" : undefined, color: value ? undefined : "var(--color-sub)" }}>
        {value || emptyLabel}
      </span>
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
  fontFamily: "inherit",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
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
