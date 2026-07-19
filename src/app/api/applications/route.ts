import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/settingsService";
import Application from "@/lib/models/Application";
import { saveBufferToGridFS } from "@/lib/gridfs";
import { buildAttachmentFilename, resolveGroupLabel } from "@/lib/filename";
import { sendApplicationEmails } from "@/lib/mailer";

export const runtime = "nodejs";
// 메일 발송까지 끝난 뒤 응답하는 동기 구조라 넉넉히 잡아둡니다.
// 주의: Vercel Hobby 플랜은 함수 실행 시간에 상한이 있습니다(무료 요금제 기준 기본 10초,
// 유료 플랜/Fluid Compute 설정에 따라 더 길게 늘릴 수 있어요 - 정확한 상한은 사용 중인
// Vercel 플랜의 대시보드에서 확인해주세요. 큰 첨부파일 + 느린 SMTP가 겹치면
// 타임아웃(504)이 날 수 있다는 점을 감안해주세요).
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXT = [".hwp", ".pdf"];

export async function POST(req: Request) {
  try {
    await connectDB();
    const settings = await getOrCreateSettings();

    const deadlinePassed =
      settings.recruitmentDeadline && new Date() > new Date(settings.recruitmentDeadline);
    if (!settings.recruitmentOpen || deadlinePassed) {
      return NextResponse.json(
        { ok: false, message: settings.content.recruitmentClosedMessage },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const track = String(formData.get("track") || "");
    const group = String(formData.get("group") || "");
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const studentId = String(formData.get("studentId") || "").trim();

    let answersRaw: string[] = [];
    try {
      answersRaw = JSON.parse(String(formData.get("answers") || "[]"));
    } catch {
      answersRaw = [];
    }

    const fileEntry = formData.get("file");
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

    if (file) {
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
      if (!ALLOWED_EXT.includes(ext)) {
        return NextResponse.json(
          { ok: false, message: "HWP 또는 PDF 파일만 첨부할 수 있습니다." },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { ok: false, message: settings.content.fileTooLargeMessage },
          { status: 400 }
        );
      }
    }

    const groupConfig = (settings.questionGroups as any)?.[track]?.[group];
    const missing =
      !track ||
      !group ||
      !groupConfig ||
      !name ||
      !email ||
      !phone ||
      !Array.isArray(answersRaw) ||
      answersRaw.length !== groupConfig.questions.length ||
      answersRaw.some((a) => !String(a || "").trim());

    if (missing) {
      return NextResponse.json(
        { ok: false, message: settings.content.missingRequiredMessage },
        { status: 400 }
      );
    }

    const answers = groupConfig.questions.map((q: string, i: number) => ({
      question: q,
      answer: String(answersRaw[i]).slice(0, 1000),
    }));

    const application = await Application.create({
      track,
      group,
      groupLabel: resolveGroupLabel(track, group),
      name,
      email,
      phone,
      studentId,
      answers,
      file: file
        ? { originalName: file.name, mimeType: file.type, size: file.size }
        : undefined,
    });

    // ── 동기 구조: 파일 저장(GridFS) + 메일 발송을 모두 끝낸 뒤에만 응답합니다.
    let attachmentBuffer: Buffer | null = null;
    let attachmentName: string | null = null;

    if (file) {
      attachmentBuffer = Buffer.from(await file.arrayBuffer());
      attachmentName = buildAttachmentFilename({ track, group, name, phone, originalName: file.name });

      try {
        const gridfsId = await saveBufferToGridFS(attachmentBuffer, attachmentName, file.type);
        application.file.storedName = attachmentName;
        application.file.gridfsId = gridfsId;
      } catch (err: any) {
        console.error("[GRIDFS] 파일 저장 실패:", err.message);
        application.mailStatus.lastError = `GridFS 저장 실패: ${err.message}`;
      }
    }

    const mailResult = await sendApplicationEmails({
      app: application,
      adminEmails: (settings.adminEmails || []).slice(0, 4),
      thankYouMessage: settings.content.thankYouMessage,
      attachmentBuffer,
      attachmentName,
    });

    application.mailStatus.adminMailSent = mailResult.adminMailSent;
    application.mailStatus.applicantMailSent = mailResult.applicantMailSent;
    application.mailStatus.lastError = mailResult.lastError || application.mailStatus.lastError;
    await application.save();

    return NextResponse.json({
      ok: true,
      id: application._id,
      thankYouMessage: settings.content.thankYouMessage,
      mailSent: mailResult.adminMailSent && mailResult.applicantMailSent,
    });
  } catch (err: any) {
    console.error("[SUBMIT] 지원서 저장 실패:", err);
    return NextResponse.json(
      { ok: false, message: "서버 오류로 지원서를 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
