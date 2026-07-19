"use client";

import Link from "next/link";
import BackButton from "./BackButton";

export default function Header({ showBack = false }: { showBack?: boolean }) {
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
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 19,
          color: "var(--color-black)",
          letterSpacing: "-0.02em",
        }}
      >
        잔치
      </Link>
    </header>
  );
}
