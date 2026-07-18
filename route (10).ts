:root {
  --color-orange: #f2622e;
  --color-orange-dark: #d9491a;
  --color-sky: #2fa9e0;
  --color-black: #14161a;
  --color-sub: #5b6673;
  --color-bg: #fffcfa;
  --color-card: #ffffff;
  --color-line: rgba(20, 22, 26, 0.1);
  --color-danger: #e0392c;
  --color-success: #1fa565;

  --font-display: "Black Han Sans", sans-serif;
  --font-body: "Noto Sans KR", sans-serif;
}

* {
  box-sizing: border-box;
}

/* 모바일 접속 시 화면이 좌우로 밀리거나 흔들리지 않도록 강제 고정 */
html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-black);
  font-family: var(--font-body);
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: none;
}

.app-shell {
  max-width: 100vw;
  min-height: 100dvh;
  overflow-x: hidden;
  position: relative;
  /* 노치/세이프에어리어 대응 (viewport-fit=cover) */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

img,
video {
  max-width: 100%;
  height: auto;
}

button {
  font-family: inherit;
  cursor: pointer;
}

textarea,
input {
  font-family: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}
