"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Group = { label: string; description?: string };

type Props = {
  groups: Record<string, Group>;
};

// ART/PLACE/PEOPLE 버튼 3개. 마우스를 올리면 해당 팀의 미션 설명이 잠깐 보이고,
// 클릭하면 그 설명이 고정(pin)됩니다. 고정된 상태에서는 오른쪽 위 X로 닫을 수 있어요.
// 팀 이름·설명 문구 자체는 /admin/cms의 "팀 이름" / "미션·소개 문구"에서 관리자가 수정합니다.
export default function MissionTeamButtons({ groups }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const activeKey = pinned || hovered;
  const active = activeKey ? groups[activeKey] : null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {Object.entries(groups).map(([key, g]) => (
          <button
            key={key}
            type="button"
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setPinned((prev) => (prev === key ? null : key))}
            style={{
              flex: 1,
              padding: "10px 6px",
              borderRadius: 10,
              border: `1.5px solid ${activeKey === key ? "var(--color-orange)" : "var(--color-line-strong)"}`,
              background: activeKey === key ? "#fff" : "transparent",
              color: "var(--color-orange-dark)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {active?.description && (
        <div
          style={{
            position: "relative",
            marginTop: 8,
            padding: "12px 30px 12px 14px",
            borderRadius: 10,
            background: "#fff",
            border: "1px solid var(--color-line)",
            fontSize: 12.5,
            lineHeight: 1.6,
            color: "var(--color-black)",
          }}
        >
          {pinned && (
            <button
              onClick={() => setPinned(null)}
              aria-label="닫기"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "none",
                border: "none",
                color: "var(--color-sub)",
              }}
            >
              <X size={14} />
            </button>
          )}
          <div style={{ fontWeight: 800, marginBottom: 4, color: "var(--color-orange-dark)" }}>{active.label}</div>
          {active.description}
        </div>
      )}
    </div>
  );
}
