import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function verifyAdmin(req: Request): { ok: true } | { ok: false; message: string } {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return { ok: false, message: "로그인이 필요합니다." };

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return { ok: true };
  } catch {
    return { ok: false, message: "세션이 만료되었습니다. 다시 로그인해주세요." };
  }
}

// Route Handler를 감싸서 인증되지 않은 요청은 401로 먼저 차단합니다.
export function withAdmin<Ctx = any>(
  handler: (req: Request, ctx: Ctx) => Promise<Response>
) {
  return async (req: Request, ctx: Ctx) => {
    const auth = verifyAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: auth.message }, { status: 401 });
    }
    return handler(req, ctx);
  };
}
