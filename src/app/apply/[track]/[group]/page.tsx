"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ApplicationForm from "@/components/ApplicationForm";
import { getSiteContent, SiteContentResponse } from "@/lib/siteContent";
import type { Track } from "@/lib/questionConfig";

export default function ApplyPage() {
  const params = useParams<{ track: string; group: string }>();
  const track = params.track as Track;
  const group = params.group as string;

  const [data, setData] = useState<SiteContentResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSiteContent()
      .then(setData)
      .catch(() => setError("콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
  }, []);

  if (error) {
    return (
      <div>
        <Header showBack />
        <p style={{ textAlign: "center", color: "var(--color-danger)", marginTop: 40 }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Header showBack />
        <p style={{ textAlign: "center", color: "var(--color-sub)", marginTop: 40 }}>불러오는 중...</p>
      </div>
    );
  }

  if (!data.recruitmentOpen) {
    return (
      <div>
        <Header showBack />
        <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "var(--color-orange-dark)" }}>{data.content.recruitmentClosedMessage}</p>
          <Link href="/" style={{ color: "var(--color-orange)", fontSize: 13 }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const groupConfig = data.questionGroups?.[track]?.[group];

  if (!groupConfig) {
    return (
      <div>
        <Header showBack />
        <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "var(--color-sub)" }}>존재하지 않는 지원 분야입니다.</p>
          <Link href="/" style={{ color: "var(--color-orange)", fontSize: 13 }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ApplicationForm track={track} group={group} groupConfig={groupConfig} content={data.content} />
  );
}
