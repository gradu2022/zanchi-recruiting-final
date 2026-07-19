import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";

export const runtime = "nodejs";

export const DELETE = withAdmin(async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const application = await Application.findByIdAndDelete(params.id);
    if (!application) {
      return NextResponse.json({ ok: false, message: "지원서를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "삭제에 실패했습니다." }, { status: 400 });
  }
});