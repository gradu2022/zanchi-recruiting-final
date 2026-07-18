export const metadata = {
  title: 'Zanchi Recruiting',
  description: '잔치 리크루팅 웹사이트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
