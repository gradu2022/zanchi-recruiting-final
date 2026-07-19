import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

/* 본문/제목 공용 고딕 폰트(굵기로 위계 구분) + 영문 라벨/태그용 지오메트릭 산세리프 */
const body = Noto_Sans_KR({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const label = Space_Grotesk({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "잔치 리크루팅 | 웹매거진 잔치",
  description: "신촌을 기록하는 웹매거진 '잔치' 신입 부원 지원서",
};

/* 모바일에서 좌우로 밀리거나 흔들리지 않도록 뷰포트를 고정합니다 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${body.variable} ${label.variable}`}>
      <body>
        <ToastProvider>
          <div className="app-shell">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
