// 지원자가 도중에 뒤로가기를 누르거나 창을 이탈해도 글이 날아가지 않도록
// localStorage에 문항 답변(텍스트만)을 자동 임시저장합니다.
// 주의: 파일(File 객체)은 용량/보안 문제로 localStorage에 저장할 수 없으므로
// 텍스트 답변과 지원자 정보만 저장되며, 파일은 복귀 시 재첨부가 필요합니다.

export type DraftData = {
  name: string;
  email: string;
  phone: string;
  university: string;
  answers: string[];
  savedAt: string;
};

const draftKey = (track: string, group: string) => `zanchi-draft-${track}-${group}`;

export function saveDraft(track: string, group: string, data: Omit<DraftData, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: DraftData = { ...data, savedAt: new Date().toISOString() };
    window.localStorage.setItem(draftKey(track, group), JSON.stringify(payload));
  } catch (e) {
    // 저장 실패(용량 초과 등)는 조용히 무시 - 폼 작성 자체를 막지 않습니다.
    console.warn("임시저장 실패:", e);
  }
}

export function loadDraft(track: string, group: string): DraftData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(track, group));
    return raw ? (JSON.parse(raw) as DraftData) : null;
  } catch (e) {
    return null;
  }
}

export function clearDraft(track: string, group: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftKey(track, group));
  } catch (e) {
    // 무시
  }
}
