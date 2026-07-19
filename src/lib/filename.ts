const GROUP_LABELS: Record<string, Record<string, string>> = {
  editor: { art: "에디터_ART", place: "에디터_PLACE", people: "에디터_PEOPLE" },
  designer: { design: "디자이너_Designer", "content-design": "디자이너_ContentDesigner" },
};

export function resolveGroupLabel(track: string, group: string) {
  return GROUP_LABELS[track]?.[group] || `${track}_${group}`;
}

function sanitize(str: string) {
  return String(str)
    .trim()
    .replace(/[\\/:*?"<>|\s]+/g, "");
}

function lastDigits(phone: string, n = 4) {
  const digitsOnly = String(phone).replace(/\D/g, "");
  return digitsOnly.slice(-n) || "0000";
}

// 예: [에디터_ART_홍길동_1234].pdf
export function buildAttachmentFilename({
  track,
  group,
  name,
  phone,
  originalName,
}: {
  track: string;
  group: string;
  name: string;
  phone: string;
  originalName: string;
}) {
  const dot = originalName.lastIndexOf(".");
  const ext = dot >= 0 ? originalName.slice(dot).toLowerCase() : "";
  const groupLabel = sanitize(resolveGroupLabel(track, group));
  const safeName = sanitize(name);
  const phoneTail = lastDigits(phone);
  return `[${groupLabel}_${safeName}_${phoneTail}]${ext}`;
}
