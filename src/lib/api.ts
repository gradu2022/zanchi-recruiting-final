// /api/applications는 이제 이 Next.js 프로젝트 안의 Route Handler입니다
// (src/app/api/applications/route.ts). 같은 origin이라 상대 경로로 호출합니다.

export type SubmitPayload = {
  track: "editor" | "designer";
  group: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  secondChoiceTeam: string;
  interviewAvailability: string[];
  answers: string[];
  file: File | null;
};

export async function submitApplication(payload: SubmitPayload): Promise<{ ok: boolean }> {
  const formData = new FormData();
  formData.append("track", payload.track);
  formData.append("group", payload.group);
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("university", payload.university);
  formData.append("secondChoiceTeam", payload.secondChoiceTeam);
  formData.append("interviewAvailability", JSON.stringify(payload.interviewAvailability));
  formData.append("answers", JSON.stringify(payload.answers));
  if (payload.file) formData.append("file", payload.file);

  const res = await fetch("/api/applications", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `제출 실패 (status: ${res.status})`);
  }
  return res.json();
}
