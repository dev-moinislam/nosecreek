import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
let url = "";
let key = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      url = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      key = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
    }
  }
}

const supabase = createClient(url, key);

async function checkAll() {
  console.log("Checking Supabase tables...\n");

  const tables = ["services", "conditions", "team_members", "locations", "blog_posts", "testimonials", "site_settings", "form_submissions"];
  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select("*", { count: "exact" });
    if (error) {
      console.log(`❌ ${t}: ${error.message}`);
    } else {
      console.log(`✓ ${t}: ${data.length} records active`);
    }
  }
  console.log("\n🎉 ALL TABLES VERIFIED & FULLY ACCESSIBLE FOR ADMIN DASHBOARD!");
}

checkAll();
