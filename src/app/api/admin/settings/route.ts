import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import { getOrCreateSettings } from "@/lib/settingsService";

export const runtime = "nodejs";

export const GET = withAdmin(async () => {
  await connectDB();
  const settings = await getOrCreateSettings();
  return NextResponse.json({ ok: true, settings });
});

export const PUT = withAdmin(async (req: Request) => {
  try {
    await connectDB();
    const settings = await getOrCreateSettings();
    const body = await req.json();
    const { adminName, adminEmails, recruitmentOpen, recruitmentDeadline, content, questionGroups } = body || {};

    if (typeof adminName === "string") settings.adminName = adminName;

    if (Array.isArray(adminEmails)) {
      if (adminEmails.length > 4) {
        return NextResponse.json(
          { ok: false, message: "관리자 이메일은 최대 4개까지 등록할 수 있습니다." },
          { status: 400 }
        );
      }
      settings.adminEmails = adminEmails.filter(Boolean);
    }

    if (typeof recruitmentOpen === "boolean") settings.recruitmentOpen = recruitmentOpen;
    if (recruitmentDeadline !== undefined) {
      settings.recruitmentDeadline = recruitmentDeadline ? new Date(recruitmentDeadline) : null;
    }

    if (content && typeof content === "object") {
      const current = settings.content?.toObject?.() ?? settings.content ?? {};
      settings.content = { ...current, ...content };
    }

    if (questionGroups && typeof questionGroups === "object") {
      settings.questionGroups = { ...(settings.questionGroups || {}), ...questionGroups };
      settings.markModified("questionGroups");
    }

    await settings.save();
    return NextResponse.json({ ok: true, settings });
  } catch (err: any) {
    console.error("[ADMIN-SETTINGS] 저장 실패:", err.message);
    return NextResponse.json({ ok: false, message: "설정을 저장하지 못했습니다." }, { status: 500 });
  }
});
