import { Schema, models, model } from "mongoose";

const AnswerSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true, maxlength: 1000 },
  },
  { _id: false }
);

const ApplicationSchema = new Schema(
  {
    track: { type: String, enum: ["editor", "designer"], required: true },
    group: { type: String, required: true },
    groupLabel: { type: String, required: true },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    studentId: { type: String, trim: true, default: "" },

    answers: { type: [AnswerSchema], required: true },

    file: {
      originalName: { type: String, default: null },
      storedName: { type: String, default: null },
      mimeType: { type: String, default: null },
      size: { type: Number, default: null },
      // 실제 바이너리는 BSON document 16MB 한도를 피하기 위해 GridFS에 저장하고,
      // 여기에는 참조 ID만 둡니다.
      gridfsId: { type: Schema.Types.ObjectId, default: null },
    },

    status: { type: String, enum: ["대기", "합격", "불합격"], default: "대기" },

    mailStatus: {
      adminMailSent: { type: Boolean, default: false },
      applicantMailSent: { type: Boolean, default: false },
      lastError: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// Next.js 개발 모드 핫리로드 시 "Cannot overwrite model" 에러를 막기 위해
// 이미 컴파일된 모델이 있으면 재사용합니다.
export default models.Application || model("Application", ApplicationSchema);
