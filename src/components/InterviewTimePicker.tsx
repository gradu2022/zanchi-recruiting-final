"use client";

import { useState } from "react";
import { INTERVIEW_DAYS, INTERVIEW_TIME_SLOTS } from "@/lib/questionConfig";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

// 구글폼처럼 시간대 60여 개를 한 줄로 쭉 나열하면 고르기 번거로워서,
// 날짜를 탭으로 먼저 고르고 그 날짜의 시간대만 스크롤 목록으로 보여주는 방식으로 바꿨습니다.
export default function InterviewTimePicker({ value, onChange }: Props) {
  const [activeDay, setActiveDay] = useState(INTERVIEW_DAYS[0].key);

  const slotValue = (dayLabel: string, slot: string) => `${dayLabel} ${slot}`;

  const toggleSlot = (dayLabel: string, slot: string) => {
    const v = slotValue(dayLabel, slot);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const countForDay = (dayLabel: string) => value.filter((v) => v.startsWith(dayLabel)).length;

  const activeDayInfo = INTERVIEW_DAYS.find((d) => d.key === activeDay)!;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {INTERVIEW_DAYS.map((d) => {
          const count = countForDay(d.label);
          const active = d.key === activeDay;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setActiveDay(d.key)}
              style={{
                flex: 1,
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
              {d.label}
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
          const v = slotValue(activeDayInfo.label, slot);
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
                onChange={() => toggleSlot(activeDayInfo.label, slot)}
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
