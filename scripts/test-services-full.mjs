import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vrhrqljixrsckdkstier.supabase.co";
const supabaseAnonKey = "sb_publishable_SESVhYIIfajqXjOqBWkI0Q_NutQJM-Q";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testServicesFullFields() {
  const payload = {
    id: "physiotherapy",
    slug: "physiotherapy",
    title: "Physiotherapy in Calgary North",
    short_description: "Expert physical therapy care",
    description: "Detailed description",
    hero_image: "/images/clinic/reception-desktop.jpg",
    side_image: "/images/clinic/reception-four.jpg",
    cta_text: "Book Assessment Online",
    cta_muted: false,
    benefits: ["Reduces pain naturally"],
    symptoms: ["Lower back pain"],
    treatment_approach: ["Orthopaedic assessment"],
    custom_sections: [{ id: "sec1", title: "Custom Section", content: "Some content", background: "white", imagePosition: "right" }],
    faqs: [{ question: "Do I need referral?", answer: "No referral needed." }],
    hidden_sections: ["at_a_glance"],
    section_order: ["hero", "clinical_overview", "at_a_glance"],
    related_services: ["massage-therapy"],
    related_conditions: ["back-pain"],
    is_published: true,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("services")
    .upsert(payload, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Services full fields error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Services full fields SUCCESS!", data[0].title, data[0].hidden_sections, data[0].section_order);
  }
}

testServicesFullFields();
