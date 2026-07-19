"use client";

type SummaryItem = { track: string; group: string; groupLabel: string; count: number };

export default function BarChart({ summary }: { summary: SummaryItem[] }) {
  const max = Math.max(1, ...summary.map((s) => s.count));

  if (summary.length === 0) {
    return <p style={{ color: "var(--color-sub)", fontSize: 13.5 }}>아직 접수된 지원서가 없어요.</p>;
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, padding: "10px 4px" }}>
      {summary.map((s) => (
        <div key={`${s.track}-${s.group}`} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 6 }}>{s.count}</div>
          <div
            style={{
              height: `${(s.count / max) * 130 + 4}px`,
              borderRadius: "8px 8px 0 0",
              background: s.track === "editor" ? "var(--color-orange)" : "var(--color-black)",
              transition: "height 0.3s",
            }}
          />
          <div style={{ fontSize: 11.5, color: "var(--color-sub)", marginTop: 6 }}>{s.groupLabel}</div>
        </div>
      ))}
    </div>
  );
}
