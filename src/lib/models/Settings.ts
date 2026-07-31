import { Schema, models, model } from "mongoose";

const SettingsSchema = new Schema(
  {
    adminName: { type: String, default: "관리자" },
    adminEmails: { type: [String], default: [] },

    recruitmentOpen: { type: Boolean, default: true },
    recruitmentDeadline: { type: Date, default: null },

    content: {
      heroTitle: { type: String, default: "잔치!" },
      heroTagline: { type: String, default: "신촌을 기록하는 웹매거진, 잔치 신입 부원 지원서" },
      aboutCtaLabel: { type: String, default: "웹진 '잔치'란?" },
      editorCtaLabel: { type: String, default: "에디터 지원하기" },
      designerCtaLabel: { type: String, default: "디자이너 지원하기" },
      thankYouMessage: { type: String, default: "지원해주셔서 감사합니다." },
      fileTooLargeMessage: {
        type: String,
        default: "파일 업로드 오류 시 용량을 줄여서 다시 시도해 주세요.",
      },
      missingRequiredMessage: {
        type: String,
        default: "필수 응답 항목에 답변하지 않으셨습니다.",
      },
      recruitmentClosedMessage: {
        type: String,
        default: "현재는 모집 기간이 아닙니다. 다음 모집을 기다려주세요.",
      },
      fileEmailNoticeMessage: {
        type: String,
        default:
          "⚠️ 미션 파일은 위 '미션 첨부' 업로드와 welcometozanchi@gmail.com 이메일 발송, 두 가지 방법 모두로 제출해주셔야 합니다! (파일명 예시: OO팀_홍길동)",
      },
      // 에디터 지원서 전용: 파일 첨부 아래 주황 박스에 표시되는 1지망 팀 미션 제출 안내
      editorMissionNotice: {
        type: String,
        default:
          "에디터 지원자분들은 지원서와 함께 '1지망 팀'에 해당하는 미션을 제출해주셔야 합니다.\n\n⚠️ 미션글은 welcometozanchi@gmail.com 이메일 발송과 이 페이지 위 '미션 첨부' 업로드, 두 가지 방법 모두로 제출해주셔야 합니다!\n\n메일 제목: 성명_잔치 00팀 미션 제출\nex) 김잔치_잔치 아트팀 미션 제출",
      },
      // 디자이너(design) 전용: 미션 첨부 박스 위에 표시되는 포트폴리오 제출 안내
      designerPortfolioNotice: {
        type: String,
        default:
          "이번 학기 디자인 팀 디자이너의 업무는\n1. 잔치 인스타그램 카드뉴스 및 썸네일 디자인\n2. 종이 잡지 편집 디자인\n이 중점이 되므로, 관련된 역량을 보여주실 수 있는 포트폴리오를 제출해주시면 감사하겠습니다!\n\n제출 방법: 파일 첨부 및 welcometozanchi@gmail.com로 전송\n메일 제목: 성명_잔치 디자인팀_디자이너_포트폴리오 제출",
      },
      // 콘텐츠 디자이너(content-design) 전용: 미션 첨부 박스 위에 표시되는 포트폴리오 제출 안내
      contentDesignerPortfolioNotice: {
        type: String,
        default:
          "본인이 디자인한 작품이나 작업물의 포트폴리오를 제출해주세요!\n포트폴리오 파일은 웹, pdf, png, 문서 등 디자인한 작품을 볼 수 있는 형식이라면 자유롭게 제출 가능합니다.\n\n이번 학기 디자인 팀 콘텐츠 디자이너의 업무는\n1. 잔치플러스 인스타그램 카드뉴스 및 썸네일 디자인\n2. 잔치 플러스 및 잔치 인스타그램 운영 및 관리\n3. 종이잡지 편집 디자인\n이 중점이 되므로, 관련된 역량을 보여주실 수 있는 포트폴리오를 제출해주시면 감사하겠습니다!\n\n제출 방법: 파일 첨부 및 welcometozanchi@gmail.com로 전송\n메일 제목: 성명_잔치 디자인팀_디자이너_포트폴리오 제출",
      },
      applicationInfoNotice: {
        type: String,
        default:
          "신촌 웹매거진 \"잔치\"의 새로운 잔치꾼을 모집합니다!\n\n잔치와 함께 활동하고자 지원해주신 예비 잔치꾼 여러분 환영합니다.\n아래 문항에 솔직한 답변 부탁드리겠습니다 :)\n\n지원서 마감 일자: 8/16(일)\n면접 일자: 8/23(일) ~ 8/25(화) (비대면 면접)\n최종 합격 발표: 8/30(일)\n오프라인 OT: 9/3(목), 신촌\nMT: 9/4(금) ~ 9/5(토)\n\n함께 벌입시다, 잔치!\nwww.welcometozanchi.com",
      },
      contactOpenChatLink: { type: String, default: "" },
      contactPhone: { type: String, default: "" },
      contactPhoneNote: {
        type: String,
        default: "지원 관련 문의사항은 위 오픈채팅방 또는 아래 번호로 연락해주세요.",
      },
      // 면접 가능 날짜 목록 — 한 줄에 하나씩. 학기마다 관리자가 /admin/cms에서 직접 고칠 수 있습니다.
      interviewDays: {
        type: String,
        default: "8/23 (일)\n8/24 (월)\n8/25 (화)",
      },
      // 마무리 체크박스 문구 (그룹1: 참여 여부 3개 / 그룹2: OT·MT 2개 / 그룹3: 개인정보·최종확인 3개)
      consentZanplus: {
        type: String,
        default: "[필수] 잔치 신촌+(부계정, @zanchi_sinchon) 콘텐츠 제작에 참여할 의향이 있습니다.",
      },
      consentSemester: {
        type: String,
        default: "[필수] 잔치는 2학기 연속 활동을 필수로 합니다. 2학기 연속 활동이 가능합니다.",
      },
      consentFee: {
        type: String,
        default:
          "[필수] 한 학기 활동비 5만 원(이 중 1만 원은 회의 지각·불참 벌금을 제외하고 학기 후 환급)에 동의합니다.",
      },
      consentOT: {
        type: String,
        default: "[필수] 9월 3일(목) 진행되는 오프라인 OT에 참여 가능합니다.",
      },
      consentMT: {
        type: String,
        default: "[필수] 9월 4일(금) ~ 9월 5일(토) 1박 2일 MT에 참여 가능합니다.",
      },
      consentPrivacyCollect: {
        type: String,
        default: "[필수] 개인정보 수집 및 이용에 동의합니다.",
      },
      consentPrivacyDestroy: {
        type: String,
        default: "[필수] 수집된 개인정보와 파일은 지원자 선발 이후 전부 폐기됨에 동의합니다.",
      },
      consentFinal: {
        type: String,
        default: "[필수] 지원서는 한 번 제출하면 수정이 어렵습니다. 내용을 다시 한 번 확인하셨습니까?",
      },
    },

    // track -> group -> { label, questions: string[] }
    questionGroups: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default models.Settings || model("Settings", SettingsSchema);
