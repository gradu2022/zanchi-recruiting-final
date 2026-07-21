// "지원 안내" 공지 문구는 관리자가 굵게/밑줄/기울임/글자 크기를 직접 지정할 수 있어야 해서
// 일반 텍스트 대신 아주 제한된 태그만 허용하는 HTML 문자열로 저장합니다.
// (텍스트만 저장하던 다른 EditableText 필드와 달리 이 필드만 리치 텍스트입니다.)

const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "SPAN", "BR", "DIV"]);

function unwrapDisallowed(root: HTMLElement) {
  let changed = true;
  while (changed) {
    changed = false;
    const all = root.querySelectorAll("*");
    for (const el of Array.from(all)) {
      if (!ALLOWED_TAGS.has(el.tagName)) {
        const parent = el.parentNode;
        if (!parent) continue;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        changed = true;
        break;
      }
    }
  }
}

function cleanAttributes(root: HTMLElement) {
  root.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (el.tagName === "SPAN" && attr.name === "style") {
        const fontSize = (el as HTMLElement).style.fontSize;
        el.removeAttribute("style");
        if (fontSize) (el as HTMLElement).style.fontSize = fontSize;
      } else {
        el.removeAttribute(attr.name);
      }
    });
  });
}

// 저장 전에 호출 — 허용된 태그(b/strong/i/em/u/span[font-size만]/br/div)만 남기고 전부 제거합니다.
export function sanitizeRichText(html: string): string {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root")!;
  unwrapDisallowed(root);
  cleanAttributes(root);
  return root.innerHTML;
}

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;

// 화면에 뿌리기 직전에 호출 — 저장된 값은 그대로 두고, 보여줄 때만 URL을 링크로 바꿔줍니다.
export function linkifyRichText(html: string): string {
  return html.replace(URL_PATTERN, (m) => {
    const href = m.startsWith("http") ? m : `https://${m}`;
    return `<a href="${href}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:underline;font-weight:700;">${m}</a>`;
  });
}
