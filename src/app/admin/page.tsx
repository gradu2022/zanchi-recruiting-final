"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { adminLogin } from "@/lib/adminApi";
import { saveAdminToken } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      showToast("비밀번호를 입력해주세요.", "error");
      return;
    }
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      saveAdminToken(token);
      router.push("/admin/dashboard");
    } catch (e: any) {
      showToast(e.message || "로그인에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header showBack />
      <div style={{ maxWidth: 360, margin: "60px auto", padding: "0 24px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          관리자 로그인
        </h1>

        <input
          type="password"
          placeholder="마스터 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "13px 14px",
            borderRadius: 10,
            border: "1.5px solid var(--color-line)",
            fontSize: 14.5,
            outline: "none",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 14,
            padding: "13px 0",
            borderRadius: 999,
            border: "none",
            background: "var(--color-orange)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          {loading ? "확인 중..." : "로그인"}
        </button>

        <button
          onClick={() =>
            showToast("비밀번호를 잃어버리셨다면 에디터 '폴'에게 문의하세요", "info")
          }
          style={{
            display: "block",
            margin: "16px auto 0",
            background: "none",
            border: "none",
            color: "var(--color-sub)",
            fontSize: 12.5,
          }}
        >
          비밀번호 찾기 힌트
        </button>
      </div>
    </div>
  );
}
