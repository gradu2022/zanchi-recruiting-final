# 잔치(Zanchi) 리크루팅 — 단일 Next.js 프로젝트 (App Router)

이전에 Next.js 프론트엔드 + Express 백엔드로 나뉘어 있던 프로젝트를 **하나의 Next.js(App
Router) 프로젝트**로 합쳤습니다. 백엔드 API는 Express 대신 Next.js Route Handler로
다시 구현되어 있고, 배포는 Vercel 하나로 끝납니다.

## 폴더 구조 (표준 App Router 레이아웃)
```
src/
  app/
    layout.tsx, page.tsx, globals.css      # 홈
    apply/[track]/[group]/page.tsx         # 지원서 폼
    admin/                                 # 로그인 · 대시보드 · 마이페이지 · CMS
    api/                                   # 백엔드 (Route Handlers)
      applications/route.ts                # POST 지원서 제출
      site-content/route.ts                # GET 공개 CMS 콘텐츠
      admin/login/route.ts                 # POST 로그인
      admin/settings/route.ts              # GET/PUT 마이페이지+CMS+모집토글
      admin/applications/route.ts          # GET 목록(필터)
      admin/applications/summary/route.ts  # GET 팀별 현황
      admin/applications/export/route.ts   # GET CSV
      admin/applications/[id]/route.ts     # GET 상세
      admin/applications/[id]/status/route.ts # PATCH 합불
      admin/applications/[id]/file/route.ts   # GET 첨부파일(GridFS)
  components/            # Header, Toast, 지원서 폼 부품, 관리자 대시보드 부품
  lib/                   # DB 연결, 모델, 메일, GridFS, CSV, 인증, 클라이언트 fetch
```
깃허브에 올릴 때는 이 구조 그대로(`src/`, `package.json`, `next.config.js`,
`tsconfig.json`가 저장소 최상위) 커밋하시면, 예전처럼 컴포넌트 파일들이 최상위에
낱개로 흩어지는 문제 없이 Vercel이 정상적으로 Next.js 프로젝트로 인식합니다.

## 실행
```
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```
Vercel에 배포할 때는 프로젝트 설정의 Environment Variables에 `.env.example`에 있는
값들을 그대로 등록하시면 됩니다 (Preview/Production 환경 모두).

## 이번에 바뀐 핵심 구조: 동기(await) 이메일 발송
말씀하신 대로 "이메일 유실 없이 확실히 발송"을 우선순위로 두고,
`POST /api/applications`가 아래 순서를 **전부 await로 기다린 뒤** 응답합니다.
1. DB에 지원서 저장
2. (첨부파일이 있으면) GridFS에 저장
3. 관리자 동보 메일 + 지원자 확인 메일 발송
4. 그제서야 지원자 화면에 "제출 완료" 응답

이렇게 하면 Vercel 서버리스 함수가 응답 이후 실행을 이어간다고 가정할 필요가 없어져서,
Next.js API 라우트로 통합해도 안전하게 동작합니다. 대신 지원자는 파일 첨부 + 메일
발송이 끝날 때까지(보통 1~3초, 느리면 그 이상) 제출 버튼을 누른 채 기다리게 됩니다 —
말씀하신 대로 이 트레이드오프를 의도적으로 선택한 구조입니다.

## 정직하게 짚어드리는 부분
- **Vercel 함수 실행 시간 제한**: 검색해서 확인한 바로는(2026년 기준) Hobby(무료)
  플랜은 기본 10초 제한이고, Fluid Compute를 켜면 Hobby에서도 최대 300초까지 늘릴 수
  있다는 자료와 "Hobby는 60초가 최대치라 우회 방법이 없다"는 자료가 동시에 있어서
  정확한 상한이 계정 설정에 따라 달라 보입니다. `maxDuration = 60`으로 설정해뒀지만,
  실제 배포 후 Vercel 대시보드 > Settings > Functions에서 본인 플랜의 정확한 상한을
  확인하시고, 필요하면 Pro 플랜 또는 Fluid Compute를 검토해주세요. 첨부파일이 크고
  SMTP가 느리면 타임아웃(504)이 날 수 있는 지점입니다.
- **임시파일 정리 로직이 사라진 이유**: 예전 Express 버전에 있던 "메일 발송 후 `finally`
  블록에서 `uploads/` 폴더 파일을 `fs.promises.unlink`로 삭제" 요구사항은, 이번 구조에서
  파일을 디스크에 전혀 쓰지 않고 메모리(Buffer) → GridFS로 바로 저장하는 방식으로 바뀌면서
  더 이상 적용 대상이 없어졌습니다. Vercel 서버리스에는애초에 안정적인 로컬 디스크가 없어서,
  같은 목적(디스크 용량 낭비 방지)을 더 확실한 방법으로 달성한 셈입니다.
- **실제 이메일 발송/Vercel 배포 자체는 이 환경에서 끝까지 테스트하지 못했습니다.**
  `.env.local`을 채운 뒤 로컬에서 지원서 1건 제출 → 실제 메일 도착까지 확인해보시고,
  그다음 Vercel에 배포해서 한 번 더 확인해보시는 걸 권해드려요.
