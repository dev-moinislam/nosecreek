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

async function testLead() {
  console.log("Testing Lead insertion with anon key (visitor simulation)...");
  const { error } = await supabase.from("form_submissions").insert([
    {
      form_type: "contact",
      name: "John Doe (Verification Lead)",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe.test@example.com",
      phone: "403-555-0199",
      service_interest: "Physiotherapy",
      message: "Testing end-to-end inquiry submission to Supabase from website form.",
      status: "new"
    }
  ]);

  if (error) {
    console.error("❌ Lead insert failed:", error);
    return;
  }

  console.log("✓ Success! Lead inquiry inserted into Supabase form_submissions table without error!");
}

testLead();
