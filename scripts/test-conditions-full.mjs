import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrhrqljixrsckdkstier.supabase.co";
const supabaseAnonKey = "sb_publishable_SESVhYIIfajqXjOqBWkI0Q_NutQJM-Q";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConditionFullFields() {
  const payload = {
    id: "back-pain",
    slug: "back-pain",
    name: "Back Pain Treatment Calgary",
    description: "Detailed description",
    side_image: "/images/clinic/reception-four.jpg",
    cta_text: "Book Assessment Online",
    cta_muted: false,
    benefits: ["Relieves lower back pain"],
    custom_sections: [{ id: "sec1", title: "Custom Section", content: "Some content", background: "white", imagePosition: "right" }],
    faqs: [{ question: "Do I need referral?", answer: "No referral needed." }],
    hidden_sections: [],
    section_order: [],
    is_published: true,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("conditions")
    .upsert(payload, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Conditions full fields error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Conditions full fields SUCCESS!", data);
  }
}

testConditionFullFields();
