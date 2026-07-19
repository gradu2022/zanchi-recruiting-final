function csvEscape(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function applicationsToCsv(applications: any[]) {
  const header = [
    "제출일시",
    "트랙",
    "지원분야",
    "이름",
    "이메일",
    "연락처",
    "학번",
    "상태",
    "첨부파일",
    "질답",
  ];

  const rows = applications.map((a) => {
    const qa = a.answers.map((x: any) => `Q. ${x.question} / A. ${x.answer}`).join(" || ");
    return [
      new Date(a.createdAt).toLocaleString("ko-KR"),
      a.track,
      a.groupLabel,
      a.name,
      a.email,
      a.phone,
      a.studentId || "",
      a.status,
      a.file?.storedName || a.file?.originalName || "",
      qa,
    ];
  });

  const lines = [header, ...rows].map((row) => row.map(csvEscape).join(","));
  return "\uFEFF" + lines.join("\r\n");
}
