import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";

export const runtime = "nodejs";

export const GET = withAdmin(async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const application = await Application.findById(params.id);
    if (!application) {
      return NextResponse.json({ ok: false, message: "지원서를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, application });
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
});
