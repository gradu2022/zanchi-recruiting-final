"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getSiteContent, SiteContentResponse } from "@/lib/siteContent";

export default function HomePage() {
  const [data, setData] = useState<SiteContentResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSiteContent()
      .then(setData)
      .catch(() => setError("콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
  }, []);

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <Header />
        <p style={{ color: "var(--color-danger)", marginTop: 40 }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <Header />
        <p style={{ color: "var(--color-sub)", marginTop: 40 }}>불러오는 중...</p>
      </div>
    );
  }

  const { content, questionGroups, recruitmentOpen, recruitmentDeadline } = data;

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 16vw, 84px)",
            color: "var(--color-orange)",
            margin: 0,
          }}
        >
          {content.heroTitle}
        </h1>
        <p style={{ color: "var(--color-sub)", marginTop: 12, fontSize: 14.5 }}>{content.heroTagline}</p>

        {!recruitmentOpen && (
          <div
            style={{
              marginTop: 20,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#FFF6F1",
              color: "var(--color-orange-dark)",
              fontSize: 13,
            }}
          >
            {content.recruitmentClosedMessage}
          </div>
        )}
        {recruitmentOpen && recruitmentDeadline && (
          <p style={{ color: "var(--color-sub)", fontSize: 12, marginTop: 10 }}>
            모집 마감: {new Date(recruitmentDeadline).toLocaleString("ko-KR")}
          </p>
        )}

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-sub)", letterSpacing: 1 }}>
            EDITOR
          </div>
          {Object.entries(questionGroups.editor || {}).map(([key, g]) => (
            <Link
              key={key}
              href={recruitmentOpen ? `/apply/editor/${key}` : "#"}
              aria-disabled={!recruitmentOpen}
              style={{ ...navBtnStyle, opacity: recruitmentOpen ? 1 : 0.4, pointerEvents: recruitmentOpen ? "auto" : "none" }}
            >
              {g.label} {content.editorCtaLabel}
            </Link>
          ))}

          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-sub)", letterSpacing: 1, marginTop: 16 }}>
            DESIGNER
          </div>
          {Object.entries(questionGroups.designer || {}).map(([key, g]) => (
            <Link
              key={key}
              href={recruitmentOpen ? `/apply/designer/${key}` : "#"}
              aria-disabled={!recruitmentOpen}
              style={{ ...navBtnStyle, opacity: recruitmentOpen ? 1 : 0.4, pointerEvents: recruitmentOpen ? "auto" : "none" }}
            >
              {g.label} {content.designerCtaLabel}
            </Link>
          ))}
        </div>

        <Link href="/admin" style={{ display: "inline-block", marginTop: 40, fontSize: 12, color: "var(--color-sub)" }}>
          관리자 로그인
        </Link>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: "block",
  padding: "14px 0",
  borderRadius: 999,
  border: "1.5px solid var(--color-black)",
  color: "var(--color-black)",
  fontWeight: 700,
  fontSize: 14.5,
};
