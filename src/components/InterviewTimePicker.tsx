"use client";

import { useEffect, useState } from "react";
import { INTERVIEW_TIME_SLOTS } from "@/lib/questionConfig";

type Props = {
  days: string[];
  value: string[];
  onChange: (next: string[]) => void;
};

// 구글폼처럼 시간대 60여 개를 한 줄로 쭉 나열하면 고르기 번거로워서,
// 날짜를 탭으로 먼저 고르고 그 날짜의 시간대만 스크롤 목록으로 보여주는 방식으로 바꿨습니다.
// 날짜 목록(days) 자체는 /admin/cms의 "면접 가능 날짜" 문구에서 관리자가 직접 고칩니다.
export default function InterviewTimePicker({ days, value, onChange }: Props) {
  const [activeDay, setActiveDay] = useState(days[0] || "");

  useEffect(() => {
    if (!days.includes(activeDay)) setActiveDay(days[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.join("|")]);

  const slotValue = (dayLabel: string, slot: string) => `${dayLabel} ${slot}`;

  const toggleSlot = (dayLabel: string, slot: string) => {
    const v = slotValue(dayLabel, slot);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const countForDay = (dayLabel: string) => value.filter((v) => v.startsWith(dayLabel)).length;

  if (days.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-sub)" }}>면접 가능 날짜가 아직 설정되지 않았습니다.</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {days.map((d) => {
          const count = countForDay(d);
          const active = d === activeDay;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(d)}
              style={{
                flex: "1 0 auto",
                padding: "10px 6px",
                borderRadius: 10,
                border: `1.5px solid ${active ? "var(--color-orange)" : "var(--color-line-strong)"}`,
                background: active ? "var(--color-orange-tint)" : "transparent",
                color: active ? "var(--color-orange-dark)" : "var(--color-black)",
                fontWeight: 700,
                fontSize: 13,
                position: "relative",
              }}
            >
              {d}
              {count > 0 && (
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--color-orange)",
                  }}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          border: "1.5px solid var(--color-line)",
          borderRadius: 10,
          padding: "6px 4px",
        }}
      >
        {INTERVIEW_TIME_SLOTS.map((slot) => {
          const v = slotValue(activeDay, slot);
          const checked = value.includes(v);
          return (
            <label
              key={slot}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                fontSize: 13.5,
                cursor: "pointer",
                borderRadius: 8,
                background: checked ? "var(--color-orange-tint)" : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSlot(activeDay, slot)}
                style={{ accentColor: "var(--color-orange)" }}
              />
              {slot}
            </label>
          );
        })}
      </div>

      {value.length > 0 && (
        <div style={{ fontSize: 12, color: "var(--color-sub)", marginTop: 8 }}>
          선택됨: {value.length}개 시간대
        </div>
      )}
    </div>
  );
}
