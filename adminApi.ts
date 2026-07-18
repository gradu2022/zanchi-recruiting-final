import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";
import { applicationsToCsv } from "@/lib/csv";

export const runtime = "nodejs";

export const GET = withAdmin(async () => {
  try {
    await connectDB();
    const applications = await Application.find().sort({ createdAt: -1 });
    const csv = applicationsToCsv(applications);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="zanchi-applications-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("[ADMIN-APPS] CSV 내보내기 실패:", err.message);
    return NextResponse.json({ ok: false, message: "CSV를 생성하지 못했습니다." }, { status: 500 });
  }
});
