// 안내 문구 안에 들어간 www.xxx.com / https://... 같은 주소를 자동으로 클릭 가능한 링크로 바꿔줍니다.
const URL_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

export default function Linkify({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(URL_PATTERN);

  return (
    <>
      {parts.map((part, i) => {
        if (/^(https?:\/\/|www\.)/.test(part)) {
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{ color: "inherit", textDecoration: "underline", fontWeight: 700 }}
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
