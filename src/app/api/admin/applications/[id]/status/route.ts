import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";

export const runtime = "nodejs";

export const PATCH = withAdmin(async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json().catch(() => ({}));
  const status = body?.status;

  if (!["대기", "합격", "불합격"].includes(status)) {
    return NextResponse.json({ ok: false, message: "status 값이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    await connectDB();
    const application = await Application.findByIdAndUpdate(params.id, { status }, { new: true });
    if (!application) {
      return NextResponse.json({ ok: false, message: "지원서를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, application });
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
});
