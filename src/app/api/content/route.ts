import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // e.g. 'services' | 'conditions' | 'team' | 'locations' | 'settings'

    if (type) {
      const filePath = path.resolve(process.cwd(), `src/data/${type}.json`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return NextResponse.json(JSON.parse(fileContent));
      }
      return NextResponse.json({ error: `File ${type}.json not found` }, { status: 404 });
    }

    // Return all main content sets
    const readJson = (name: string) => {
      try {
        const p = path.resolve(process.cwd(), `src/data/${name}.json`);
        if (fs.existsSync(p)) {
          return JSON.parse(fs.readFileSync(p, "utf-8"));
        }
      } catch {}
      return [];
    };

    return NextResponse.json({
      services: readJson("services"),
      conditions: readJson("conditions"),
      team: readJson("team"),
      locations: readJson("locations"),
      settings: readJson("settings"),
      blog: readJson("blog")
    });
  } catch (err: any) {
    console.error("API /api/content error:", err);
    return NextResponse.json({ error: err.message || "Failed to load content" }, { status: 500 });
  }
}
