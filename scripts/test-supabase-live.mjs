import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrhrqljixrsckdkstier.supabase.co";
const supabaseAnonKey = "sb_publishable_SESVhYIIfajqXjOqBWkI0Q_NutQJM-Q";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase connection...");
  
  // 1. Fetch services
  const { data: fetchServices, error: fetchErr } = await supabase
    .from("services")
    .select("*");
    
  if (fetchErr) {
    console.error("Fetch services error:", JSON.stringify(fetchErr, null, 2));
  } else {
    console.log(`Fetched ${fetchServices.length} services from Supabase.`);
    if (fetchServices.length > 0) {
      console.log("Sample service columns:", Object.keys(fetchServices[0]));
    }
  }

  // 2. Test upsert
  const testPayload = {
    id: "physiotherapy",
    slug: "physiotherapy",
    title: "Physiotherapy in Calgary North",
    short_description: "Expert physical therapy care",
    description: "Detailed description",
    is_published: true,
    updated_at: new Date().toISOString()
  };

  console.log("Testing upsert into services table...");
  const { data: upsertData, error: upsertErr } = await supabase
    .from("services")
    .upsert(testPayload, { onConflict: "slug" })
    .select();

  if (upsertErr) {
    console.error("Upsert service error:", JSON.stringify(upsertErr, null, 2));
  } else {
    console.log("Upsert succeeded!", upsertData);
  }
}

test();
