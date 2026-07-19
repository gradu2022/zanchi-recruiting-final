import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/settingsService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await connectDB();
    const settings = await getOrCreateSettings();

    return NextResponse.json({
      ok: true,
      content: settings.content,
      questionGroups: settings.questionGroups,
      recruitmentOpen: settings.recruitmentOpen,
      recruitmentDeadline: settings.recruitmentDeadline,
    });
  } catch (err: any) {
    console.error("[SITE-CONTENT]", err.message);
    return NextResponse.json({ ok: false, message: "사이트 콘텐츠를 불러오지 못했습니다." }, { status: 500 });
  }
}
