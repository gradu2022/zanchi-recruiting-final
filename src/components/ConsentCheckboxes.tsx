"use client";

export const CONSENT_ITEMS = [
  "[필수] 잔치 신촌+(부계정, @zanchi_sinchon) 콘텐츠 제작에 참여할 의향이 있습니다.",
  "[필수] 잔치는 2학기 연속 활동을 필수로 합니다. 2학기 연속 활동이 가능합니다.",
  "[필수] 한 학기 활동비 5만 원(이 중 1만 원은 회의 지각·불참 벌금을 제외하고 학기 후 환급)에 동의합니다.",
  "[필수] 9월 3일(목) 진행되는 오프라인 OT에 참여 가능합니다.",
  "[필수] 9월 4일(금) ~ 9월 5일(토) 1박 2일 MT에 참여 가능합니다.",
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
        background: "var(--color-orange-tint)",
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
