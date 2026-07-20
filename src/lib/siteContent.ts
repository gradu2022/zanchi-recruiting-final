export type QuestionGroup = { label: string; description?: string; questions: string[] };
export type QuestionGroups = {
  editor: Record<string, QuestionGroup>;
  designer: Record<string, QuestionGroup>;
};

export type SiteContent = {
  heroTitle: string;
  heroTagline: string;
  aboutCtaLabel: string;
  editorCtaLabel: string;
  designerCtaLabel: string;
  thankYouMessage: string;
  fileTooLargeMessage: string;
  missingRequiredMessage: string;
  recruitmentClosedMessage: string;
  fileEmailNoticeMessage: string;
  applicationInfoNotice: string;
  contactOpenChatLink: string;
  contactPhone: string;
  contactPhoneNote: string;
  interviewDays: string;
  consentZanplus: string;
  consentSemester: string;
  consentFee: string;
  consentOT: string;
  consentMT: string;
  consentPrivacyCollect: string;
  consentPrivacyDestroy: string;
  consentFinal: string;
};

export type SiteContentResponse = {
  content: SiteContent;
  questionGroups: QuestionGroups;
  recruitmentOpen: boolean;
  recruitmentDeadline: string | null;
};



export async function getSiteContent(): Promise<SiteContentResponse> {
  const res = await fetch("/api/site-content", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("사이트 콘텐츠를 불러오지 못했습니다.");
  }
  const data = await res.json();
  return {
    content: data.content,
    questionGroups: data.questionGroups,
    recruitmentOpen: data.recruitmentOpen,
    recruitmentDeadline: data.recruitmentDeadline,
  };
}
