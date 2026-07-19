import Settings from "./models/Settings";
import DEFAULT_QUESTION_GROUPS from "./defaultQuestionGroups";

// 서버리스 환경에는 "서버 최초 구동" 시점이 명확하지 않으므로(함수가 매번 새로 뜰 수 있음),
// Settings 문서가 없을 때 최초로 이 함수를 호출한 요청이 기본값을 심습니다(지연 시드).
// connectDB()는 호출부에서 먼저 실행되어 있어야 합니다.
export async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (settings) return settings;

  const envEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .slice(0, 4);

  settings = await Settings.create({
    adminName: "관리자",
    adminEmails: envEmails,
    recruitmentOpen: true,
    recruitmentDeadline: null,
    questionGroups: DEFAULT_QUESTION_GROUPS,
  });

  return settings;
}
