import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";

export const runtime = "nodejs";

export const GET = withAdmin(async () => {
  try {
    await connectDB();
    const rows = await Application.aggregate([
      {
        $group: {
          _id: { track: "$track", group: "$group", groupLabel: "$groupLabel" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const summary = rows.map((r) => ({
      track: r._id.track,
      group: r._id.group,
      groupLabel: r._id.groupLabel,
      count: r.count,
    }));

    return NextResponse.json({ ok: true, summary, total: summary.reduce((s, x) => s + x.count, 0) });
  } catch (err: any) {
    console.error("[ADMIN-APPS] 요약 조회 실패:", err.message);
    return NextResponse.json({ ok: false, message: "현황을 불러오지 못했습니다." }, { status: 500 });
  }
});
