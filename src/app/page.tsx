"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Instagram } from "lucide-react";
import Header from "@/components/Header";
import { getSiteContent, SiteContentResponse } from "@/lib/siteContent";

const HOMEPAGE_URL = "https://welcometozanchi.com/";
const INSTAGRAM_URL = "https://www.instagram.com/zanchi_sinchon?igsh=MWRyeG90eTZ0b2Nhag==";

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
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "72px 24px 60px", textAlign: "center" }}>
        <img
          src="/logo.png"
          alt={content.heroTitle}
          style={{
            width: "clamp(220px, 60vw, 340px)",
            height: "auto",
            margin: "0 auto",
            display: "block",
          }}
        />
        <p style={{ color: "var(--color-sub)", marginTop: 14, fontSize: 14.5, lineHeight: 1.6 }}>
          {content.heroTagline}
        </p>

        {!recruitmentOpen && (
          <div
            style={{
              marginTop: 22,
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--color-orange-tint)",
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

        <div id="apply-section" style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={sectionLabelStyle}>EDITOR</div>
          {Object.entries(questionGroups.editor || {}).map(([key, g]) => (
            <Link
              key={key}
              href={recruitmentOpen ? `/apply/editor/${key}` : "#"}
              aria-disabled={!recruitmentOpen}
              className="nav-btn"
              style={{ ...navBtnStyle, opacity: recruitmentOpen ? 1 : 0.4, pointerEvents: recruitmentOpen ? "auto" : "none" }}
            >
              {g.label} {content.editorCtaLabel}
            </Link>
          ))}

          <div style={{ ...sectionLabelStyle, marginTop: 18 }}>DESIGNER</div>
          {Object.entries(questionGroups.designer || {}).map(([key, g]) => (
            <Link
              key={key}
              href={recruitmentOpen ? `/apply/designer/${key}` : "#"}
              aria-disabled={!recruitmentOpen}
              className="nav-btn"
              style={{ ...navBtnStyle, opacity: recruitmentOpen ? 1 : 0.4, pointerEvents: recruitmentOpen ? "auto" : "none" }}
            >
              {g.label} {content.designerCtaLabel}
            </Link>
          ))}

          <a
            href={HOMEPAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="nav-btn"
            style={{ ...navBtnStyle, marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <ExternalLink size={15} /> 홈페이지 바로가기
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="nav-btn"
            style={{ ...navBtnStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Instagram size={15} /> 잔치 플러스 바로가기
          </a>
        </div>

        <Link
          href="/admin"
          style={{
            display: "inline-block",
            marginTop: 48,
            fontSize: 11.5,
            fontFamily: "var(--font-label)",
            letterSpacing: "0.04em",
            color: "var(--color-sub)",
          }}
        >
          ADMIN LOGIN
        </Link>
      </div>
    </div>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-label)",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--color-sub)",
  letterSpacing: "0.12em",
};

const navBtnStyle: React.CSSProperties = {
  display: "block",
  padding: "14px 0",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14.5,
};
