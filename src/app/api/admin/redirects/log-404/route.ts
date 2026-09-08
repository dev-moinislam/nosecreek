import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { RedirectsData, NotFoundLogItem } from "@/types/redirects";

const dataFilePath = path.join(process.cwd(), "src", "data", "redirects.json");

function readRedirectsData(): RedirectsData {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading redirects data:", err);
  }
  return { rules: [], notFoundLogs: [] };
}

function writeRedirectsData(data: RedirectsData) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing redirects data:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path: rawPath, referrer } = body;

    if (!rawPath || typeof rawPath !== "string") {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const cleanPath = rawPath.split("?")[0].trim().toLowerCase();

    // Ignore assets, api, next internal paths
    if (
      cleanPath.startsWith("/_next") ||
      cleanPath.startsWith("/api") ||
      cleanPath.endsWith(".map") ||
      cleanPath.endsWith(".ico") ||
      cleanPath.endsWith(".png") ||
      cleanPath.endsWith(".jpg")
    ) {
      return NextResponse.json({ ignored: true });
    }

    const data = readRedirectsData();
    if (!data.notFoundLogs) data.notFoundLogs = [];

    const existing = data.notFoundLogs.find((l) => l.path.toLowerCase() === cleanPath);
    const now = new Date().toISOString();

    if (existing) {
      existing.hitCount += 1;
      existing.lastHitAt = now;
      if (referrer && !existing.referrer) existing.referrer = referrer;
    } else {
      const newLog: NotFoundLogItem = {
        id: `404-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        path: cleanPath,
        hitCount: 1,
        firstSeenAt: now,
        lastHitAt: now,
        referrer: referrer || undefined
      };
      // Keep most recent 100 logs
      data.notFoundLogs.unshift(newLog);
      if (data.notFoundLogs.length > 100) {
        data.notFoundLogs = data.notFoundLogs.slice(0, 100);
      }
    }

    writeRedirectsData(data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Log 404 Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
