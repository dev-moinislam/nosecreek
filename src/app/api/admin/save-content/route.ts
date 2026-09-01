import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body; // type: 'services' | 'conditions' | 'team' | 'locations' | 'settings'

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), `src/data/${type}.json`);
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return NextResponse.json({ success: true, message: `Updated ${type}.json successfully` });
    }

    return NextResponse.json({ error: `File src/data/${type}.json not found` }, { status: 404 });
  } catch (err: any) {
    console.error("API save-content error:", err);
    return NextResponse.json({ error: err.message || "Failed to save content" }, { status: 500 });
  }
}
