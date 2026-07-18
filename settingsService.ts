import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = body?.password;

  if (!password || password !== process.env.ADMIN_MASTER_PASSWORD) {
    return NextResponse.json({ ok: false, message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET as string, { expiresIn: "12h" });
  return NextResponse.json({ ok: true, token });
}
