"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import BackButton from "./BackButton";
import { getAdminToken, clearAdminToken } from "@/lib/adminAuth";

export default function Header({ showBack = false }: { showBack?: boolean }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!getAdminToken());
  }, []);

  return (
    <header
      style={{
        position: "relative",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      {showBack && <BackButton />}
      <Link href="/" style={{ display: "flex", alignItems: "center" }} aria-label="잔치 홈으로 이동">
        <img src="/logo-eng.png" alt="잔치" style={{ height: 30, width: "auto" }} />
      </Link>

      {/* 이전에 /admin에 로그인한 세션이 남아있으면(최대 12시간), 이 페이지에서도
          연필 편집 아이콘이 함께 뜹니다 — 로그인 상태를 눈에 보이게 하고,
          바로 여기서 끌 수 있도록 배지를 둡니다. */}
      {isAdmin && (
        <button
          onClick={() => {
            clearAdminToken();
            setIsAdmin(false);
            window.location.reload();
          }}
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            borderRadius: 999,
            border: "1px solid var(--color-orange)",
            background: "var(--color-orange-tint)",
            color: "var(--color-orange-dark)",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          관리자 모드 · 로그아웃 <LogOut size={12} />
        </button>
      )}
    </header>
  );
}
