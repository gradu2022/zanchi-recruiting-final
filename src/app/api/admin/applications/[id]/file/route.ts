import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { withAdmin } from "@/lib/adminGuard";
import Application from "@/lib/models/Application";
import { readBufferFromGridFS } from "@/lib/gridfs";

export const runtime = "nodejs";

export const GET = withAdmin(async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const isPortfolio = searchParams.get("type") === "portfolio";

    const application = await Application.findById(params.id);
    const target = isPortfolio ? application?.portfolioFile : application?.file;
    if (!target?.gridfsId) {
      return NextResponse.json({ ok: false, message: "첨부된 파일이 없습니다." }, { status: 404 });
    }

    const buffer = await readBufferFromGridFS(target.gridfsId);
    const filename = target.storedName || "attachment";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": target.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (err: any) {
    console.error("[ADMIN-APPS] 파일 다운로드 실패:", err.message);
    return NextResponse.json({ ok: false, message: "파일을 불러오지 못했습니다." }, { status: 500 });
  }
});
