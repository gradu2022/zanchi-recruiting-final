import { getAdminToken } from "./adminAuth";



export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `요청에 실패했습니다 (status: ${res.status})`;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new AdminApiError(message, res.status);
  }
  return res;
}

export async function adminLogin(password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new AdminApiError(data.message || "로그인에 실패했습니다.", res.status);
  }
  return res.json() as Promise<{ ok: boolean; token: string }>;
}

export async function fetchSummary() {
  const res = await request("/api/admin/applications/summary");
  return res.json();
}

export async function fetchApplications(params: { track?: string; group?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.track) qs.set("track", params.track);
  if (params.group) qs.set("group", params.group);
  const res = await request(`/api/admin/applications${qs.toString() ? `?${qs}` : ""}`);
  return res.json();
}

export async function fetchApplicationDetail(id: string) {
  const res = await request(`/api/admin/applications/${id}`);
  return res.json();
}

export async function updateApplicationStatus(id: string, status: "대기" | "합격" | "불합격") {
  const res = await request(`/api/admin/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function downloadApplicationFile(id: string, fallbackName: string) {
  const res = await request(`/api/admin/applications/${id}/file`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCsvUrlWithToken() {
  // CSV는 브라우저 다운로드 링크가 아니라 fetch 후 blob으로 내려받아야
  // Authorization 헤더(JWT)를 포함시킬 수 있습니다.
  return async () => {
    const res = await request("/api/admin/applications/export.csv");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zanchi-applications-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
}

export async function fetchAdminSettings() {
  const res = await request("/api/admin/settings");
  return res.json();
}

export async function saveAdminSettings(payload: Record<string, unknown>) {
  const res = await request("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.json();
}
