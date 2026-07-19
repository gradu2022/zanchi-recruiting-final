"use client";

export const CONSENT_ITEMS = [
  "[필수] 개인정보 수집 및 이용에 동의합니다.",
  "[필수] 수집된 개인정보와 파일은 지원자 선발 이후 전부 폐기됨에 동의합니다.",
  "[필수] 지원서는 한 번 제출하면 수정이 어렵습니다. 내용을 다시 한 번 확인하셨습니까?",
];

type Props = {
  checked: boolean[];
  onChange: (next: boolean[]) => void;
};

export default function ConsentCheckboxes({ checked, onChange }: Props) {
  const toggle = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    onChange(next);
  };

  return (
    <div
      style={{
        background: "#FFF6F1",
        border: "1px solid var(--color-line)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      {CONSENT_ITEMS.map((text, idx) => (
        <label
          key={idx}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 13,
            color: "var(--color-black)",
            marginBottom: idx < CONSENT_ITEMS.length - 1 ? 8 : 0,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={checked[idx] || false}
            onChange={() => toggle(idx)}
            style={{ marginTop: 2, accentColor: "var(--color-orange)" }}
          />
          <span>{text}</span>
        </label>
      ))}
    </div>
  );
}
