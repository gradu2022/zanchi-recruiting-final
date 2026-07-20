import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(str: string) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function buildAnswersTableHtml(answers: { question: string; answer: string }[]) {
  const rows = answers
    .map(
      (a, i) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #e5e5e5;background:#FDECE0;font-weight:700;vertical-align:top;white-space:nowrap;">Q${i + 1}</td>
        <td style="padding:10px 12px;border:1px solid #e5e5e5;vertical-align:top;">
          <div style="font-weight:700;margin-bottom:6px;">${escapeHtml(a.question)}</div>
          <div style="white-space:pre-wrap;color:#333;">${escapeHtml(a.answer)}</div>
        </td>
      </tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;"><tbody>${rows}</tbody></table>`;
}

function buildAdminHtml(app: any, hasFile: boolean) {
  return `
    <div style="font-family:sans-serif;">
      <h2 style="color:#FF6700;">새 지원서가 접수되었습니다 — ${escapeHtml(app.groupLabel)}</h2>
      <table style="border-collapse:collapse;margin-bottom:16px;font-size:14px;">
        <tr><td style="padding:4px 10px;color:#666;">이름</td><td style="padding:4px 10px;font-weight:700;">${escapeHtml(app.name)}</td></tr>
        <tr><td style="padding:4px 10px;color:#666;">이메일</td><td style="padding:4px 10px;">${escapeHtml(app.email)}</td></tr>
        <tr><td style="padding:4px 10px;color:#666;">연락처</td><td style="padding:4px 10px;">${escapeHtml(app.phone)}</td></tr>
        <tr><td style="padding:4px 10px;color:#666;">대학교</td><td style="padding:4px 10px;">${escapeHtml(app.university || "미입력")}</td></tr>
        ${
          app.secondChoiceTeam
            ? `<tr><td style="padding:4px 10px;color:#666;">2지망 팀</td><td style="padding:4px 10px;">${escapeHtml(app.secondChoiceTeam)}</td></tr>`
            : ""
        }
        <tr><td style="padding:4px 10px;color:#666;vertical-align:top;">면접 가능 시간</td><td style="padding:4px 10px;">${escapeHtml((app.interviewAvailability || []).join(", ") || "미입력")}</td></tr>
      </table>
      ${buildAnswersTableHtml(app.answers)}
      ${
        hasFile
          ? '<p style="margin-top:16px;color:#666;font-size:13px;">첨부파일은 이메일에 동봉되지 않았습니다 — 관리자 대시보드(/admin/dashboard)에서 다운로드해주세요.</p>'
          : ""
      }
    </div>`;
}

function buildApplicantHtml(app: any, thankYouMessage?: string) {
  return `
    <div style="font-family:sans-serif;">
      <h2 style="color:#FF6700;">잔치(Zanchi) 지원서 접수 확인</h2>
      <p>${escapeHtml(app.name)}님, ${escapeHtml(thankYouMessage || "지원해주셔서 감사합니다.")}</p>
      <p style="color:#666;font-size:13px;">지원 분야: ${escapeHtml(app.groupLabel)}</p>
      ${buildAnswersTableHtml(app.answers)}
    </div>`;
}

type SendArgs = {
  app: any;
  adminEmails: string[];
  thankYouMessage?: string;
  attachmentBuffer: Buffer | null;
  attachmentName: string | null;
  hasFile?: boolean;
};

/**
 * 관리자(최대 4명, 한 통) + 지원자 확인 메일을 await로 기다리며 보냅니다.
 * 파일은 더 이상 메일에 직접 동봉하지 않습니다(GridFS에만 저장) — 첨부파일 인코딩·전송
 * 시간이 Vercel 함수 실행 시간 제한을 넘겨 "Failed to fetch"를 유발했기 때문입니다.
 */
export async function sendApplicationEmails({
  app,
  adminEmails,
  thankYouMessage,
  attachmentBuffer,
  attachmentName,
  hasFile,
}: SendArgs) {
  const transporter = getTransporter();
  const attachments =
    attachmentBuffer && attachmentName ? [{ filename: attachmentName, content: attachmentBuffer }] : [];

  const result = { adminMailSent: false, applicantMailSent: false, lastError: null as string | null };

  if (adminEmails.length > 0) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: adminEmails.join(","),
        subject: `[잔치 지원서] ${app.groupLabel} - ${app.name}`,
        html: buildAdminHtml(app, Boolean(hasFile)),
        attachments,
      });
      result.adminMailSent = true;
    } catch (err: any) {
      console.error("[MAIL] 관리자 메일 발송 실패:", err.message);
      result.lastError = `관리자 메일 실패: ${err.message}`;
    }
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: app.email,
      subject: "[잔치] 지원서가 정상 접수되었습니다",
      html: buildApplicantHtml(app, thankYouMessage),
    });
    result.applicantMailSent = true;
  } catch (err: any) {
    console.error("[MAIL] 지원자 확인 메일 발송 실패:", err.message);
    result.lastError = `${result.lastError ? result.lastError + " / " : ""}지원자 메일 실패: ${err.message}`;
  }

  return result;
}