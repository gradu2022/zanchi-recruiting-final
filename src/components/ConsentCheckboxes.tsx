"use client";

import { useState } from "react";
import EditableText from "./admin/EditableText";
import type { SiteContent } from "@/lib/siteContent";

type ConsentItem = { fieldKey: keyof SiteContent; bold?: boolean };

// 3개(참여 여부) / 2개(OT·MT, 굵게) / 3개(개인정보·최종확인) 세 영역으로 구분합니다.
// 문구 자체는 Settings.content에 저장되어 관리자 로그인 시 연필 아이콘으로 바로 수정할 수 있습니다.
export const CONSENT_GROUPS: ConsentItem[][] = [
  [{ fieldKey: "consentZanplus" }, { fieldKey: "consentSemester" }, { fieldKey: "consentFee" }],
  [
    { fieldKey: "consentOT", bold: true },
    { fieldKey: "consentMT", bold: true },
  ],
  [{ fieldKey: "consentPrivacyCollect" }, { fieldKey: "consentPrivacyDestroy" }, { fieldKey: "consentFinal" }],
];

export const CONSENT_FLAT: ConsentItem[] = CONSENT_GROUPS.flat();

type Props = {
  checked: boolean[];
  onChange: (next: boolean[]) => void;
  content: SiteContent;
};

export default function ConsentCheckboxes({ checked, onChange, content }: Props) {
  const [texts, setTexts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    CONSENT_FLAT.forEach((item) => {
      initial[item.fieldKey] = (content[item.fieldKey] as string) || "";
    });
    return initial;
  });

  const toggle = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    onChange(next);
  };

  let runningIndex = 0;

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
      {CONSENT_GROUPS.map((group, groupIdx) => (
        <div
          key={groupIdx}
          style={{
            marginBottom: groupIdx < CONSENT_GROUPS.length - 1 ? 14 : 0,
            paddingBottom: groupIdx < CONSENT_GROUPS.length - 1 ? 12 : 0,
            borderBottom: groupIdx < CONSENT_GROUPS.length - 1 ? "1px solid rgba(204,82,0,0.22)" : "none",
          }}
        >
          {group.map((item, itemIdx) => {
            const idx = runningIndex++;
            const isLast = groupIdx === CONSENT_GROUPS.length - 1 && itemIdx === group.length - 1;
            return (
              <label
                key={item.fieldKey}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--color-black)",
                  marginBottom: isLast ? 0 : 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked[idx] || false}
                  onChange={() => toggle(idx)}
                  style={{ marginTop: 2, accentColor: "var(--color-orange)", flexShrink: 0 }}
                />
                <EditableText
                  value={texts[item.fieldKey]}
                  fieldKey={item.fieldKey}
                  onSaved={(v) => setTexts((prev) => ({ ...prev, [item.fieldKey]: v }))}
                  style={{ fontWeight: item.bold ? 800 : 400 }}
                />
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}
