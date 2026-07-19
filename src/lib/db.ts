import mongoose from "mongoose";

// Vercel 서버리스 환경에서는 함수가 호출될 때마다 매번 새로 연결하면
// 커넥션이 급격히 늘어날 수 있어, Next.js/MongoDB 공식 예제와 동일하게
// global 객체에 연결(Promise)을 캐싱해서 재사용합니다.
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached =
  globalForMongoose.mongooseConn ??
  (globalForMongoose.mongooseConn = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI가 설정되지 않았습니다. .env.local을 확인해주세요 (.env.example 참고).");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
