import type { Metadata, Viewport } from "next";
import { Black_Han_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

/* 커스텀 폰트: 로고/타이틀용 임팩트 폰트 + 본문용 고딕 폰트 */
const display = Black_Han_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Noto_Sans_KR({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-body",
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
    <html lang="ko" className={`${display.variable} ${body.variable}`}>
      <body>
        <ToastProvider>
          <div className="app-shell">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
