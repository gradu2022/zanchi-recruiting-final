// 주의: 이 파일은 Part 1(프론트엔드) 단계의 임시 로컬 설정입니다.
// Part 2(관리자 CMS)와 Part 3(백엔드)가 완성되면, 이 값은
// GET /api/site-content 같은 API 응답으로 대체되어야 합니다.
// (지금 단계에서는 백엔드가 없으므로 폼이 정상 동작하도록 시드 데이터를 둡니다.)

// Part 2 CMS 연동 이후: 이 파일의 실제 데이터(QUESTION_CONFIG)는 더 이상 화면에 쓰이지 않습니다.
// 질문 목록은 이제 GET /api/site-content 를 통해 백엔드 Settings(DB)에서 가져옵니다
// (app/page.tsx, app/apply/[track]/[group]/page.tsx 참고).
// 이 파일은 QuestionGroup / Track 타입 정의만 계속 사용됩니다.

export type QuestionGroup = {
  label: string;
  description?: string;
  questions: string[];
};

export type Track = "editor" | "designer";

export const UNIVERSITY_OPTIONS = ["연세대", "이화여대", "서강대", "홍익대"];

// 면접 가능 시간 선택 UI에 쓰이는 날짜/시간대 목록입니다.
// 학기마다 면접 일자가 바뀌면 이 배열만 고치면 됩니다.
export const INTERVIEW_DAYS = [
  { key: "8-23", label: "8/23 (일)" },
  { key: "8-24", label: "8/24 (월)" },
  { key: "8-25", label: "8/25 (화)" },
];

export const INTERVIEW_TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 10; h < 21; h++) {
    for (const m of [0, 30]) {
      const start = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? 0 : 30;
      const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      slots.push(`${start} - ${end}`);
    }
  }
  return slots;
})();

export const QUESTION_CONFIG: Record<Track, Record<string, QuestionGroup>> = {
  editor: {
    art: {
      label: "ART",
      questions: [
        "잔치 아트팀에 지원한 동기를 자유롭게 작성해주세요.",
        "최근 인상 깊었던 문화예술 콘텐츠와 그 이유를 알려주세요.",
        "신촌에서 다뤄보고 싶은 예술적 소재가 있다면 소개해주세요.",
        "본인의 표현 방식(글/사진/영상/그림 등)과 관련 경험을 적어주세요.",
        "한 학기 동안 아트팀 활동에서 이루고 싶은 목표는 무엇인가요?",
      ],
    },
    place: {
      label: "PLACE",
      questions: [
        "잔치 플레이스팀에 지원한 동기를 자유롭게 작성해주세요.",
        "본인만 알고 있는 신촌의 공간이 있다면 소개해주세요.",
        "공간을 취재하고 글로 풀어낸 경험이 있다면 알려주세요.",
        "소개하고 싶은 신촌의 장소와 그 이유를 적어주세요.",
        "한 학기 동안 플레이스팀 활동에서 이루고 싶은 목표는 무엇인가요?",
      ],
    },
    people: {
      label: "PEOPLE",
      questions: [
        "잔치 피플팀에 지원한 동기를 자유롭게 작성해주세요.",
        "인터뷰이로 만나보고 싶은 신촌의 사람이 있다면 소개해주세요.",
        "인터뷰 또는 사람 이야기를 기록해본 경험이 있다면 알려주세요.",
        "낯선 사람과 대화를 시작할 때 본인만의 방식이 있다면 적어주세요.",
        "한 학기 동안 피플팀 활동에서 이루고 싶은 목표는 무엇인가요?",
      ],
    },
  },
  designer: {
    design: {
      label: "Designer",
      questions: [
        "잔치 디자이너에 지원한 동기를 자유롭게 작성해주세요.",
        "본인의 디자인 툴 활용 능력과 경험을 알려주세요.",
        "포트폴리오 링크 또는 대표작 설명을 적어주세요.",
        "잡지/편집 디자인에 관심을 갖게 된 계기가 있다면 소개해주세요.",
        "한 학기 동안 디자이너로서 이루고 싶은 목표는 무엇인가요?",
      ],
    },
    "content-design": {
      label: "Content Designer",
      questions: [
        "잔치 콘텐츠 디자이너에 지원한 동기를 자유롭게 작성해주세요.",
        "SNS 콘텐츠 기획·제작 경험이 있다면 소개해주세요.",
        "평소 즐겨보는 큐레이팅/매거진 계정이 있다면 알려주세요.",
        "본인의 디자인 툴 활용 능력과 경험을 알려주세요.",
        "한 학기 동안 콘텐츠 디자이너로서 이루고 싶은 목표는 무엇인가요?",
      ],
    },
  },
};
