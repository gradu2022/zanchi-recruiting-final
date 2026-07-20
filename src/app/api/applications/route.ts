import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/settingsService";
import Application from "@/lib/models/Application";
import { saveBufferToGridFS } from "@/lib/gridfs";
import { buildAttachmentFilename, resolveGroupLabel } from "@/lib/filename";
import { sendApplicationEmails } from "@/lib/mailer";

export const runtime = "nodejs";
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
    const university = String(formData.get("university") || "").trim();
    const secondChoiceTeam = String(formData.get("secondChoiceTeam") || "").trim();

    let answersRaw: string[] = [];
    try {
      answersRaw = JSON.parse(String(formData.get("answers") || "[]"));
    } catch {
      answersRaw = [];
    }

    let interviewAvailability: string[] = [];
    try {
      interviewAvailability = JSON.parse(String(formData.get("interviewAvailability") || "[]"));
    } catch {
      interviewAvailability = [];
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
      !university ||
      (track === "editor" && !secondChoiceTeam) ||
      !Array.isArray(interviewAvailability) ||
      interviewAvailability.length === 0 ||
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
      university,
      secondChoiceTeam: track === "editor" ? secondChoiceTeam : "",
      interviewAvailability,
      answers,
      file: file
        ? { originalName: file.name, mimeType: file.type, size: file.size }
        : undefined,
    });

    let attachmentBuffer: Buffer | null = null;
    let attachmentName: string | null = null;

    if (file) {
      attachmentBuffer = Buffer.from(await file.arrayBuffer());
      attachmentName = buildAttachmentFilename({ track, group, name, phone, originalName: file.name });
    }

    // ── GridFS 저장과 메일 발송은 서로 의존하지 않으므로 동시에(병렬로) 처리해서
    //    전체 대기 시간을 줄입니다. (이메일에는 더 이상 파일을 직접 동봉하지 않고,
    //    관리자 대시보드에서 다운로드하도록 안내만 합니다 — 그래서 메일 발송이
    //    훨씬 가벼워지고 빨라집니다.)
    const gridfsPromise = attachmentBuffer
      ? saveBufferToGridFS(attachmentBuffer, attachmentName as string, file!.type)
          .then((gridfsId) => {
            application.file.storedName = attachmentName;
            application.file.gridfsId = gridfsId;
          })
          .catch((err: any) => {
            console.error("[GRIDFS] 파일 저장 실패:", err.message);
            application.mailStatus.lastError = `GridFS 저장 실패: ${err.message}`;
          })
      : Promise.resolve();

    const mailPromise = sendApplicationEmails({
      app: application,
      adminEmails: (settings.adminEmails || []).slice(0, 4),
      thankYouMessage: settings.content.thankYouMessage,
      attachmentBuffer: null,
      attachmentName,
      hasFile: Boolean(file),
    });

    const [, mailResult] = await Promise.all([gridfsPromise, mailPromise]);

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
      { ok: false, message: err?.message || "서버 오류로 지원서를 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}