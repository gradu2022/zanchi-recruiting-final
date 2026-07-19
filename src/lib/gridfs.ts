import mongoose from "mongoose";
import { Readable } from "stream";

function getBucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db as any, {
    bucketName: "attachments",
  });
}

// 메모리에 있는 Buffer를 곧바로 GridFS에 저장합니다.
// (Vercel 서버리스에는 안정적인 로컬 디스크가 없어서, 이전 버전의 "임시파일에 썼다가
//  GridFS로 옮기고 삭제" 단계 자체가 필요 없어졌습니다 — 메모리 → GridFS로 바로 저장합니다.)
export function saveBufferToGridFS(
  buffer: Buffer,
  filename: string,
  contentType?: string
): Promise<mongoose.Types.ObjectId> {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    Readable.from(buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id as mongoose.Types.ObjectId));
  });
}

export async function readBufferFromGridFS(fileId: mongoose.Types.ObjectId | string): Promise<Buffer> {
  const bucket = getBucket();
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
