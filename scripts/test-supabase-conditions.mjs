import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrhrqljixrsckdkstier.supabase.co";
const supabaseAnonKey = "sb_publishable_SESVhYIIfajqXjOqBWkI0Q_NutQJM-Q";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConditions() {
  console.log("Testing Supabase conditions...");
  
  // 1. Fetch conditions
  const { data: fetchConditions, error: fetchErr } = await supabase
    .from("conditions")
    .select("*");
    
  if (fetchErr) {
    console.error("Fetch conditions error:", JSON.stringify(fetchErr, null, 2));
  } else {
    console.log(`Fetched ${fetchConditions.length} conditions from Supabase.`);
    if (fetchConditions.length > 0) {
      console.log("Sample condition columns:", Object.keys(fetchConditions[0]));
    }
  }

  // 2. Test upsert
  const testPayload = {
    id: "back-pain",
    slug: "back-pain",
    name: "Back Pain Treatment Calgary",
    description: "Detailed description",
    is_published: true,
    updated_at: new Date().toISOString()
  };

  console.log("Testing upsert into conditions table...");
  const { data: upsertData, error: upsertErr } = await supabase
    .from("conditions")
    .upsert(testPayload, { onConflict: "slug" })
    .select();

  if (upsertErr) {
    console.error("Upsert condition error:", JSON.stringify(upsertErr, null, 2));
  } else {
    console.log("Upsert succeeded!", upsertData);
  }
}

testConditions();
