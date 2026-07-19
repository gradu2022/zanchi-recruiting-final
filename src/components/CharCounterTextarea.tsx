"use client";

const MAX_LEN = 1000;

type Props = {
  index: number;
  question: string;
  value: string;
  onChange: (v: string) => void;
};

export default function CharCounterTextarea({ index, question, value, onChange }: Props) {
  const remaining = MAX_LEN - value.length;
  const isNearLimit = remaining <= 50;

  return (
    <div style={{ marginBottom: 22 }}>
      <label
        style={{
          display: "flex",
          gap: 8,
          fontWeight: 700,
          fontSize: 15,
          color: "var(--color-black)",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--color-orange)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {index}
        </span>
        <span>{question}</span>
      </label>
      <textarea
        value={value}
        maxLength={MAX_LEN}
        rows={4}
        placeholder="답변을 입력해주세요 (최대 1000자)"
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LEN))}
        style={{
          width: "100%",
          resize: "vertical",
          padding: "12px 14px",
          borderRadius: 10,
          border: "1.5px solid var(--color-line)",
          fontSize: 14.5,
          lineHeight: 1.6,
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-orange)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-line)")}
      />
      <div
        style={{
          textAlign: "right",
          fontSize: 12,
          marginTop: 4,
          color: isNearLimit ? "var(--color-danger)" : "var(--color-sub)",
        }}
      >
        {value.length} / {MAX_LEN}자
      </div>
    </div>
  );
}
