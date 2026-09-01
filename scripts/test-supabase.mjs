import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
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

console.log("Connecting to Supabase at:", url);
const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from("services").select("*").limit(5);
    if (error) {
      console.error("Supabase Query Error:", error.message, error.code);
      if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("relation")) {
        console.log("\n-> Table 'services' does not exist yet. Please run src/lib/supabase/schema.sql in your Supabase SQL Editor.");
      }
      return;
    }
    console.log("✓ Success! Connected to Supabase.");
    console.log(`Found ${data.length} services in Supabase database.`);
  } catch (err) {
    console.error("Exception:", err);
  }
}

test();
