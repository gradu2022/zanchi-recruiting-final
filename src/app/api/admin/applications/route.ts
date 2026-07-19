import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";

export const runtime = "nodejs";

export const GET = withAdmin(async (req: Request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const track = searchParams.get("track");
    const group = searchParams.get("group");

    const filter: Record<string, string> = {};
    if (track) filter.track = track;
    if (group) filter.group = group;

    const applications = await Application.find(filter)
      .select("track group groupLabel name email status createdAt file.originalName")
      .sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, applications });
  } catch (err: any) {
    console.error("[ADMIN-APPS] 목록 조회 실패:", err.message);
    return NextResponse.json({ ok: false, message: "지원자 목록을 불러오지 못했습니다." }, { status: 500 });
  }
});
