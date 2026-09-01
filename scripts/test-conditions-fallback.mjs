import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrhrqljixrsckdkstier.supabase.co";
const supabaseAnonKey = "sb_publishable_SESVhYIIfajqXjOqBWkI0Q_NutQJM-Q";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConditionFallback() {
  const corePayload = {
    id: "back-pain",
    slug: "back-pain",
    name: "Back Pain Treatment Calgary (Live Supabase DB Test)",
    short_description: "Targeted spinal rehabilitation in Calgary.",
    description: "Full clinical back pain description in Supabase.",
    symptoms: ["Lower back pain", "Stiffness in morning"],
    treatment_approach: ["Assessment", "Manual therapy"],
    hidden_sections: [],
    section_order: ["hero", "clinical_overview"],
    related_services: ["physiotherapy"],
    category: "Spine & Core",
    is_published: true,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("conditions")
    .upsert(corePayload, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Condition core upsert error:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS! Saved directly into Supabase database:", data[0].name, data[0].updated_at);
  }
}

testConditionFallback();
