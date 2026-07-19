import { Schema, models, model } from "mongoose";

const SettingsSchema = new Schema(
  {
    adminName: { type: String, default: "관리자" },
    adminEmails: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 4,
        message: "관리자 이메일은 최대 4개까지 등록할 수 있습니다.",
      },
    },

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
          "첨부파일은 업로드 후 welcometozanchi@gmail.com으로도 함께 보내주세요. (파일명 예시: OO팀_홍길동)",
      },
    },

    // track -> group -> { label, questions: string[] }
    questionGroups: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default models.Settings || model("Settings", SettingsSchema);
