import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { RedirectRule, NotFoundLogItem, RedirectsData } from "@/types/redirects";

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

export async function GET() {
  const data = readRedirectsData();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, rule, rules, notFoundId } = body;
    const data = readRedirectsData();

    // Action 1: Save full rules array
    if (action === "saveAll" && Array.isArray(rules)) {
      data.rules = rules;
      writeRedirectsData(data);
      return NextResponse.json({ success: true, rules: data.rules });
    }

    // Action 2: Add or Update a single rule
    if (rule) {
      const normalizedFrom = rule.fromPath.trim().startsWith("/") 
        ? rule.fromPath.trim().toLowerCase() 
        : `/${rule.fromPath.trim().toLowerCase()}`;

      const existingIndex = data.rules.findIndex((r) => r.id === rule.id || r.fromPath.toLowerCase() === normalizedFrom);

      const updatedRule: RedirectRule = {
        id: rule.id || `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fromPath: normalizedFrom,
        toPath: rule.toPath.trim(),
        statusCode: Number(rule.statusCode) as any || 301,
        enabled: rule.enabled ?? true,
        notes: rule.notes?.trim() || "",
        hitCount: rule.hitCount ?? (existingIndex >= 0 ? data.rules[existingIndex].hitCount : 0),
        createdAt: rule.createdAt || (existingIndex >= 0 ? data.rules[existingIndex].createdAt : new Date().toISOString())
      };

      if (existingIndex >= 0) {
        data.rules[existingIndex] = updatedRule;
      } else {
        data.rules.unshift(updatedRule);
      }

      // If this was created from a 404 log, remove or mark the 404 log as resolved
      if (notFoundId) {
        data.notFoundLogs = data.notFoundLogs.filter((l) => l.id !== notFoundId);
      }

      writeRedirectsData(data);
      return NextResponse.json({ success: true, rule: updatedRule, rules: data.rules });
    }

    // Action 3: Toggle enabled status
    if (action === "toggle" && body.id) {
      const target = data.rules.find((r) => r.id === body.id);
      if (target) {
        target.enabled = !target.enabled;
        writeRedirectsData(data);
        return NextResponse.json({ success: true, rules: data.rules });
      }
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    // Action 4: Clear 404 logs
    if (action === "clear404Logs") {
      data.notFoundLogs = [];
      writeRedirectsData(data);
      return NextResponse.json({ success: true, notFoundLogs: [] });
    }

    return NextResponse.json({ error: "Invalid request action" }, { status: 400 });
  } catch (err: any) {
    console.error("API Redirects Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process redirect" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hitId = searchParams.get("hitId");
    if (!hitId) return NextResponse.json({ error: "Missing hitId" }, { status: 400 });

    const data = readRedirectsData();
    const rule = data.rules.find((r) => r.id === hitId);
    if (rule) {
      rule.hitCount = (rule.hitCount || 0) + 1;
      rule.lastHitAt = new Date().toISOString();
      writeRedirectsData(data);
      return NextResponse.json({ success: true, hitCount: rule.hitCount });
    }
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update hit count" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get("id");
    const notFoundId = searchParams.get("notFoundId");

    const data = readRedirectsData();

    if (ruleId) {
      data.rules = data.rules.filter((r) => r.id !== ruleId);
      writeRedirectsData(data);
      return NextResponse.json({ success: true, rules: data.rules });
    }

    if (notFoundId) {
      data.notFoundLogs = data.notFoundLogs.filter((l) => l.id !== notFoundId);
      writeRedirectsData(data);
      return NextResponse.json({ success: true, notFoundLogs: data.notFoundLogs });
    }

    return NextResponse.json({ error: "Missing id to delete" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
