-- ==============================================================================
-- NOSE CREEK PHYSIOTHERAPY - INITIAL DATA SEED SCRIPT
-- ==============================================================================
-- Run this in your Supabase SQL Editor to populate all website content instantly.
-- ==============================================================================

-- 1. Site Settings
INSERT INTO site_settings (id, clinic_name, logo_text, contact, opening_hours, social_links, booking_url, primary_cta, footer_content, seo, marketing)
VALUES (
  'main',
  'Nose Creek Physiotherapy',
  'Nose Creek Physiotherapy',
  '{"phone":"403-295-8590","email":"info@nosecreekphysiotherapy.com","address":"#22, 8120 Beddington Blvd NW, Calgary, AB T3K 2A8","mapEmbedUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2503.7027581561765!2d-114.09503612349079!3d51.132514538183226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53716503c200be6f%3A0xe54d9095bb12be8f!2sNose%20Creek%20Physiotherapy%20-%20Beddington!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"}'::jsonb,
  '{"monday":"7:00 am — 8:00 pm","tuesday":"7:00 am — 8:00 pm","wednesday":"7:00 am — 8:00 pm","thursday":"7:00 am — 8:00 pm","friday":"7:00 am — 6:00 pm","saturday":"8:00 am — 1:00 pm","sunday":"Closed"}'::jsonb,
  '{"facebook":"https://facebook.com/nosecreekphysio","instagram":"https://instagram.com/nosecreekphysio","tiktok":"https://tiktok.com/@nosecreekphysio"}'::jsonb,
  '#booking',
  'Book Online',
  '© 2026 Nose Creek Physiotherapy. All rights reserved. Registered physiotherapy, chiropractic, and massage therapy clinic in Calgary.',
  '{"title":"Nose Creek Physiotherapy | Calgary North NW & NE","description":"Welcome to Nose Creek Physiotherapy in Calgary. We offer patient-focused physical therapy, chiropractic adjustments, and dry needling since 2001.","ogTitle":"Nose Creek Physiotherapy | Calgary NW & NE","ogDescription":"Move well and feel better with our expert-led, tailored physiotherapy, massage therapy, and chiropractic care in Calgary.","ogImage":"/images/og-home.jpg","canonicalUrl":"https://nosecreekphysiotherapy.com"}'::jsonb,
  '{"callTracking":{"enabled":true,"scriptUrl":"https://cdn.calltrk.com/companies/208038913/2a4e80164caeb8bbc760/12/swap.js"},"gtm":{"enabled":false,"containerId":""}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  clinic_name = EXCLUDED.clinic_name,
  logo_text = EXCLUDED.logo_text,
  contact = EXCLUDED.contact,
  opening_hours = EXCLUDED.opening_hours,
  social_links = EXCLUDED.social_links,
  booking_url = EXCLUDED.booking_url,
  primary_cta = EXCLUDED.primary_cta,
  footer_content = EXCLUDED.footer_content,
  seo = EXCLUDED.seo,
  marketing = EXCLUDED.marketing;

-- 2. Services
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'physiotherapy',
  'physiotherapy',
  'Physiotherapy',
  'Expert, hands-on physio to restore mobility, strength and balance — while minimizing your dependence on medication.',
  'Our physiotherapy services are designed to help you regain motion, strength, and functionality. We address acute or chronic pain, post-surgical recovery, sports injuries, and mobility restrictions using evidence-based clinical techniques, manual manipulation, and progressive exercise rehabilitation.',
  '/images/clinic/reception-desktop.jpg',
  '/images/clinic/reception-four.jpg',
  'heart-pulse',
  '#e9f5fb',
  '#1c9fd8',
  'Learn more →',
  false,
  '["Reduces or eliminates pain naturally without invasive procedures","Restores spinal and peripheral joint range of motion and flexibility","Accelerates recovery from sports injuries, workplace accidents, and surgery","Strengthens stabilizer muscles to prevent injury recurrence"]'::jsonb,
  '["Lower back pain, sciatica, and spinal stiffness","Neck pain, whiplash, and tension headaches","Shoulder impingement, rotator cuff strains, and frozen shoulder","Knee pain, hip restriction, and difficulty with daily movement"]'::jsonb,
  '["Thorough orthopaedic assessment and biomechanical movement analysis","Hands-on joint mobilization, spinal manipulation, and soft tissue release","Intramuscular Stimulation (IMS / Dry Needling) when indicated","Personalized active exercise prescriptions and postural education"]'::jsonb,
  '[{"id":"manual-therapy-focus","eyebrow":"Advanced Clinical Technique","eyebrowColor":"#6faf1c","title":"Hands-On Manual Therapy & Joint Mobilization","subtitle":"Direct spinal and extremity joint mobilization to unlock restricted motion.","content":"At Nose Creek Physiotherapy, our manual therapists are Fellows of the Canadian Academy of Manipulative Physiotherapy (FCAMPT) — representing the highest internationally recognized standard in orthopaedic physical therapy. We don''t just hand you a sheet of exercises; we use targeted hands-on mobilizations to free stiff joints and calm irritated nerve roots on your very first visit.","bullets":["FCAMPT-certified orthopaedic joint mobilizations","Myofascial trigger point and soft-tissue release","Spinal traction and mechanical decompression strategies","Safe and gentle techniques tailored to your comfort"],"image":"/images/clinic/reception-four.jpg","imageAlt":"Physiotherapist performing manual joint mobilization","imagePosition":"right","background":"white","ctaText":"Book An Assessment Online →","ctaHref":"https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"},{"id":"dry-needling-ims","eyebrow":"Deep Muscle Release","eyebrowColor":"#1c9fd8","title":"Gunn Intramuscular Stimulation (IMS / Dry Needling)","subtitle":"Relieve deep, chronic muscle spasms that stretching cannot reach.","content":"When nerve roots are sensitized or compressed, deep postural muscles develop permanent taut bands (neuropathic shortening) that stay tight no matter how much you stretch. Gunn IMS uses ultra-fine needles to release these deep contracted muscle fibers, allowing the nerve to heal and eliminating radiating pain.","bullets":["Targets deep spinal and buttock muscles unreachable by hand","Resets hyperactive nerve pathways for lasting pain relief","Highly effective for chronic sciatica, neck pain, and headaches","Administered by certified CGIMS practitioners"],"image":"/images/clinic/clinic-mobile.jpg","imageAlt":"IMS Dry Needling treatment at Nose Creek Physiotherapy","imagePosition":"left","background":"light"}]'::jsonb,
  '[{"question":"Do I need a doctor''s referral for physiotherapy?","answer":"No, in Alberta you do not need a physician referral to see a licensed physiotherapist. You can book an appointment directly with our clinic. (Some private insurance plans may request one for claim reimbursement)."},{"question":"Is physiotherapy covered by my insurance plan?","answer":"Yes, physiotherapy is covered under almost all extended health care benefit plans, WCB workplace claims, and auto insurance policies. We provide direct billing to all major insurers."},{"question":"What should I wear to my physiotherapy appointment?","answer":"Wear comfortable, loose-fitting clothing that allows easy access to the injured area (e.g., shorts for knee or hip injuries, a tank top or loose shirt for shoulder and neck issues)."}]'::jsonb,
  '["massage-therapy","shockwave-therapy","acupuncture"]'::jsonb,
  '["back-pain","knee-pain","neck-shoulder-pain"]'::jsonb,
  '["blair-schachterle","rizelle-manzano","madelyne-agius"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '["review-1"]'::jsonb,
  '{"title":"Physiotherapy in Calgary North | Nose Creek Physiotherapy","description":"Expert hands-on physiotherapy to restore mobility, strength and balance. Extended health direct billing available in Calgary.","ogTitle":"Physiotherapy Services | Nose Creek Physiotherapy","ogDescription":"Restore mobility, strength, and balance naturally with our certified Calgary physiotherapists."}'::jsonb,
  0,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'massage-therapy',
  'massage-therapy',
  'Massage Therapy',
  'Therapeutic massage that soothes muscles, promotes recovery and leaves you refreshed and revitalized.',
  'Our Registered Massage Therapy (RMT) treatments utilize deep tissue techniques, trigger point release, and myofascial therapy to relieve tension, reduce physiological stress, and accelerate musculoskeletal recovery.',
  '/images/clinic/reception-four.jpg',
  '/images/clinic/reception-three.jpg',
  'sparkles',
  '#eef6e4',
  '#6faf1c',
  'Learn more →',
  false,
  '["Alleviates chronic muscular tension, spasms, and trigger points","Improves localized blood circulation and lymphatic drainage","Reduces physical stress hormones and promotes deep relaxation","Complements physiotherapy for faster full-body recovery"]'::jsonb,
  '["Muscle tightness in neck, upper shoulders, and lower back","Repetitive strain from desk work or intense physical training","Post-accident soreness and soft tissue tightness","Stress-related headaches and chronic stiffness"]'::jsonb,
  '["Pre-treatment consultation to pinpoint areas of restriction","Targeted deep tissue massage and myofascial trigger point release","Swedish relaxation techniques to calm the nervous system","Therapist recommendations for home stretching and hydration"]'::jsonb,
  '[{"id":"rmt-credentials","eyebrow":"Certified 2200-Hour RMTs","eyebrowColor":"#6faf1c","title":"Medical & Therapeutic Registered Massage Therapy","subtitle":"Targeted soft tissue release tailored to your exact physical tension.","content":"All our massage therapists are fully registered (2200-Hour RMTs) with recognized Alberta associations. Whether you need focused deep-tissue therapy for a stubborn muscle spasm or gentle myofascial release following a car accident, our RMTs collaborate with our physiotherapists to accelerate your complete physical recovery.","bullets":["Deep Tissue & Myofascial Trigger Point Release","Sports & Athletic Pre/Post Performance Massage","Prenatal & Postnatal Gentle Muscle Therapy","100% Direct Billing to Extended Health Insurance"],"image":"/images/clinic/reception-three.jpg","imageAlt":"Registered Massage Therapy treatment room at Nose Creek","imagePosition":"right","background":"white"}]'::jsonb,
  '[{"question":"Are your massage therapists registered in Alberta?","answer":"Yes, all massage therapists at Nose Creek are fully registered (2200-Hour RMTs) and can provide official receipts for extended health insurance reimbursement."},{"question":"Can I combine massage therapy with physiotherapy?","answer":"Yes, combining massage therapy with active physiotherapy is often the most effective approach for resolving chronic pain and complex injuries."}]'::jsonb,
  '["physiotherapy","acupuncture","shockwave-therapy"]'::jsonb,
  '["neck-shoulder-pain","back-pain"]'::jsonb,
  '["katie-luu","shawn-gille","amalia","smita-nagpal","jihan-shayya"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '["review-2"]'::jsonb,
  '{"title":"Registered Massage Therapy (RMT) Calgary | Nose Creek","description":"Therapeutic, deep tissue, and relaxation massage therapy by Registered Massage Therapists in Calgary NW & NE.","ogTitle":"Registered Massage Therapy | Nose Creek Physiotherapy","ogDescription":"Soothe muscle tension and speed injury recovery with our licensed RMTs in Calgary."}'::jsonb,
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'shockwave-therapy',
  'shockwave-therapy',
  'Shockwave Therapy',
  'State-of-the-art, non-invasive treatment that accelerates healing by targeting the root cause of persistent pain.',
  'Extracorporeal Shockwave Therapy (ESWT) delivers acoustic soundwaves deep into injured tendons and soft tissues, stimulating blood vessel formation, breaking down calcifications, and reactivating the body''s natural cellular repair cycle.',
  '/images/clinic/reception-three.jpg',
  '/images/clinic/reception-desktop.jpg',
  'zap',
  '#e9f5fb',
  '#1c9fd8',
  'Learn more →',
  false,
  '["Non-surgical, non-invasive treatment for chronic tendon conditions","Breaks down stubborn calcium deposits and scar tissue","Stimulates collagen synthesis and new blood vessel growth","Significantly reduces pain in 3 to 5 targeted sessions"]'::jsonb,
  '["Chronic plantar fasciitis and morning heel pain","Achilles tendonitis and jumper''s knee (patellar tendinopathy)","Calcific tendonitis of the rotator cuff in the shoulder","Tennis elbow (lateral epicondylitis) and golfer''s elbow"]'::jsonb,
  '["Precise anatomical localization of injured tendon fibers","Application of acoustic shockwave pulses tailored to your comfort level","Integration with eccentric strengthening and loading exercises","Progressive rehabilitation protocol over 4–6 weeks"]'::jsonb,
  '[{"id":"how-shockwave-heals","eyebrow":"Advanced Medical Technology","eyebrowColor":"#1c9fd8","title":"How Acoustic Shockwaves Dissolve Chronic Calcifications","subtitle":"Reactivating your body''s natural cellular healing cycle without surgery.","content":"Radial shockwave therapy generates high-energy acoustic pulses that pass through skin into deep tendon structures. These soundwaves trigger ''neovascularization'' — the formation of new micro-capillaries that flood scarred, stagnant tendon tissue with oxygen and healing nutrients, while simultaneously breaking apart painful calcifications.","bullets":["Non-invasive alternative to cortisone shots or surgery","Typically requires only 3 to 5 weekly sessions of 10–15 minutes","High clinical success rate for chronic plantar fasciitis and tennis elbow","Administered by trained physiotherapy clinicians"],"image":"/images/clinic/reception-desktop.jpg","imageAlt":"Acoustic Radial Shockwave Therapy at Nose Creek","imagePosition":"left","background":"white"}]'::jsonb,
  '[{"question":"Is shockwave therapy painful?","answer":"You may experience mild discomfort during the 5-minute treatment, but our therapists adjust the intensity so it is always tolerable. Discomfort stops immediately when the pulses finish."},{"question":"How many shockwave sessions do I need?","answer":"Most patients achieve substantial relief within 3 to 5 weekly sessions."}]'::jsonb,
  '["physiotherapy","custom-orthotics"]'::jsonb,
  '["foot-pain","knee-pain","sports-injury"]'::jsonb,
  '["blair-schachterle","rizelle-manzano"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '[]'::jsonb,
  '{"title":"Shockwave Therapy Calgary | Nose Creek Physiotherapy","description":"Advanced non-invasive shockwave therapy to heal chronic plantar fasciitis, tennis elbow, and calcific tendinopathy in Calgary.","ogTitle":"Shockwave Therapy Calgary | Nose Creek","ogDescription":"Heal stubborn tendon pain and calcifications with acoustic shockwave treatments."}'::jsonb,
  2,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'acupuncture',
  'acupuncture',
  'Acupuncture',
  'Certified practitioners stimulate specific points to balance energy and ease a wide range of ailments.',
  'Our Traditional Chinese Medicine (TCM) and anatomical medical acupuncture treatments stimulate specific neuro-pathways, release deep intramuscular trigger points, and encourage the nervous system to release natural pain-relieving endorphins.',
  '/images/clinic/clinic-mobile.jpg',
  NULL,
  'needle',
  '#eef6e4',
  '#6faf1c',
  'Learn more →',
  false,
  '["Stimulates endorphin release for natural pain relief","Relaxes deep muscle trigger points and chronic spasms","Balances autonomic nervous system response and reduces stress","Reduces inflammation and supports overall recovery"]'::jsonb,
  '["Chronic neck, back, and joint pain","Persistent tension headaches and migraine episodes","Sciatica and radiating nerve discomfort","Muscle tightness resistant to conventional stretching"]'::jsonb,
  '["Comprehensive diagnostic assessment of symptoms and tension points","Insertion of ultra-thin, single-use sterile micro-needles","Gentle manual stimulation or optional electro-acupuncture for nerve modulation","Relaxing 20–30 minute resting phase in a private treatment room"]'::jsonb,
  '[]'::jsonb,
  '[{"question":"Does acupuncture hurt?","answer":"Acupuncture needles are hair-thin and most patients feel only a slight prick or dull warmth on insertion. Many patients find the experience deeply relaxing."},{"question":"Is acupuncture covered by extended health insurance?","answer":"Yes, acupuncture provided by licensed practitioners is covered by most extended health plans in Alberta."}]'::jsonb,
  '["physiotherapy","massage-therapy"]'::jsonb,
  '["neck-shoulder-pain","back-pain"]'::jsonb,
  '["dr-eileen-wei","blair-schachterle"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '[]'::jsonb,
  '{"title":"Acupuncture & TCM in Calgary | Nose Creek Physiotherapy","description":"Licensed acupuncture and TCM treatments in Calgary to relieve chronic pain, headaches, and muscle tension naturally.","ogTitle":"Acupuncture Treatment | Nose Creek Physiotherapy","ogDescription":"Ease chronic pain, headaches, and muscle tension with licensed acupuncture care in Calgary."}'::jsonb,
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'custom-orthotics',
  'custom-orthotics',
  'Custom Orthotics',
  'Orthotics designed to align and support your feet — tailored to your unique needs for lasting comfort.',
  'Custom foot orthotics are precision medical appliances made to support and align your feet, ankles, and entire lower body kinetic chain, redistributing pressure and reducing strain on your knees, hips, and lower back.',
  '/images/clinic/reception-desktop.jpg',
  NULL,
  'footprints',
  '#e9f5fb',
  '#1c9fd8',
  'Learn more →',
  false,
  '["Corrects over-pronation, supination, and arch collapse","Relieves heel pain, plantar fasciitis, and metatarsalgia","Improves posture and kinetic chain alignment upward to the back","Custom-cast specifically for your footwear and activity level"]'::jsonb,
  '["Stabbing heel pain, arch fatigue, or plantar fasciitis","Foot and ankle fatigue after standing or walking","Chronic knee, hip, or lower back discomfort","Uneven shoe wear or flat feet (fallen arches)"]'::jsonb,
  '["3D computerized gait analysis and biomechanical foot assessment","Precision foam cast or 3D digital scan of both feet","Custom fabrication by specialized orthotic laboratories","Fitting, footwear review, and follow-up adjustments"]'::jsonb,
  '[]'::jsonb,
  '[{"question":"How long do custom orthotics last?","answer":"High-quality custom orthotics typically last 2 to 4 years depending on your daily wear, body weight, and activity level."},{"question":"Will my insurance cover custom orthotics?","answer":"Most extended healthcare plans cover custom orthotics when prescribed by a doctor or qualified specialist. We provide all detailed lab documentation for claims."}]'::jsonb,
  '["physiotherapy","shockwave-therapy","knee-bracing"]'::jsonb,
  '["foot-pain","knee-pain","back-pain"]'::jsonb,
  '["blair-schachterle"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '[]'::jsonb,
  '{"title":"Custom Foot Orthotics Calgary | Nose Creek Physiotherapy","description":"Customized orthotic insoles to correct foot alignment and alleviate heel, knee, and lower back pain in Calgary.","ogTitle":"Custom Orthotics Calgary | Nose Creek","ogDescription":"Restore proper gait and foot alignment with custom-made medical orthotics."}'::jsonb,
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'knee-bracing',
  'knee-bracing',
  'Knee Bracing',
  'Premium knee braces to protect, support and stabilize — whether recovering from injury or preventing one.',
  'We provide custom and specialized knee braces, including spring-loaded and unloader braces for osteoarthritis, ligament instability (ACL, MCL, PCL), and sports protection, allowing you to stay active with confidence and reduced joint pain.',
  '/images/clinic/reception-four.jpg',
  NULL,
  'shield',
  '#eef6e4',
  '#6faf1c',
  'Learn more →',
  false,
  '["Unloads osteoarthritis pressure to significantly reduce knee pain","Stabilizes knees recovering from ACL, MCL, or meniscus tears","Provides spring-assisted knee extension to assist with stairs and hills","Custom-fitted for athletic security and all-day comfort"]'::jsonb,
  '["Knee osteoarthritis pain when walking or taking stairs","Instability or feeling like your knee is giving way","Post-operative ligament protection (ACL / meniscus recovery)","Desire to return to skiing, running, or heavy sports safely"]'::jsonb,
  '["Clinical knee joint evaluation and stability testing","Measurement and selection of the ideal brace design (Custom / Off-the-shelf)","Custom fitting, strap calibration, and movement trial in clinic","Integration with knee-strengthening physiotherapy exercises"]'::jsonb,
  '[]'::jsonb,
  '[{"question":"What is a Spring-Loaded Knee Brace?","answer":"Spring-loaded knee braces store energy during knee bending and return it during knee extension, taking up to 40% of the mechanical load off your joint when standing up or climbing stairs."},{"question":"Is custom knee bracing covered by insurance?","answer":"Yes, many extended health insurance plans cover custom knee bracing with a physician prescription."}]'::jsonb,
  '["physiotherapy","custom-orthotics"]'::jsonb,
  '["knee-pain","sports-injury"]'::jsonb,
  '["blair-schachterle"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '[]'::jsonb,
  '{"title":"Custom Knee Bracing & Osteoarthritis Braces | Calgary","description":"Custom knee bracing, spring-loaded braces, and unloader braces for knee osteoarthritis and ACL stability in Calgary.","ogTitle":"Knee Bracing Solutions | Nose Creek Physiotherapy","ogDescription":"Protect your knees, reduce osteoarthritis pain, and return to sports with custom bracing."}'::jsonb,
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  'pelvic-health',
  'pelvic-health',
  'Pelvic Health',
  'A dedicated women''s health program — because caring for your body supports the wellbeing of your whole family.',
  'Specialized pelvic floor physiotherapy to evaluate and treat pelvic floor muscle dysfunction, bladder incontinence, pelvic organ prolapse, pre/post-natal recovery, and chronic pelvic girdle discomfort in a private, supportive environment.',
  '/images/clinic/clinic-mobile.jpg',
  NULL,
  'user-check',
  '#e9f5fb',
  '#1c9fd8',
  'Learn more →',
  false,
  '["Resolves stress and urge bladder leaks naturally","Restores core and pelvic stability following pregnancy and childbirth","Relieves chronic pelvic girdle, tailbone, and sacroiliac joint pain","Empowers with practical strategies for long-term pelvic wellness"]'::jsonb,
  '["Involuntary leakage when coughing, laughing, or exercising","Frequent, sudden, or urgent needs to urinate","Feelings of heaviness or pressure in the pelvic floor","Diastasis recti (abdominal separation) after delivery"]'::jsonb,
  '["Private, compassionate consultation and pelvic floor assessment","Breathing, pressure management, and pelvic floor coordination training","Hands-on soft tissue release and gentle joint alignment","Gradual return to running, gym workouts, and daily living"]'::jsonb,
  '[]'::jsonb,
  '[{"question":"What happens during a pelvic health assessment?","answer":"Your therapist takes a detailed history of your symptoms and, with your consent, assesses your pelvic floor muscles, breathing, posture, and core coordination in a private room."},{"question":"Can pelvic physiotherapy help years after having children?","answer":"Yes! It is never too late to rehabilitate your pelvic floor muscles and restore strength and bladder control."}]'::jsonb,
  '["physiotherapy"]'::jsonb,
  '["back-pain"]'::jsonb,
  '["rizelle-manzano","madelyne-agius"]'::jsonb,
  '["nose-creek-clinic"]'::jsonb,
  '[]'::jsonb,
  '{"title":"Pelvic Floor Physiotherapy Calgary | Nose Creek Physiotherapy","description":"Specialized pelvic health and women''s health physiotherapy in Calgary for incontinence, prolapse, and post-partum recovery.","ogTitle":"Pelvic Floor Physiotherapy | Nose Creek","ogDescription":"Strengthen your core and solve bladder leakage with certified pelvic floor physiotherapy in Calgary."}'::jsonb,
  6,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;

-- 3. Conditions
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'back-pain',
  'back-pain',
  'Back Pain',
  'Targeted spinal rehabilitation, manual mobilization, and core stabilization to resolve acute and chronic lower back pain.',
  'Lower back pain is one of the most common musculoskeletal complaints in Calgary. Whether caused by disc herniation, facet joint irritation, ligament sprains, or prolonged postural strain, our physiotherapists use advanced orthopaedic manual therapy and functional core retraining to eliminate pain and restore full spinal mobility.',
  NULL,
  '["Dull, persistent ache or sharp pinching in the lumbar spine","Stiffness when getting out of bed or rising from a chair","Spasms in the paraspinal and gluteal muscles","Difficulty bending forward, lifting, or standing for long periods"]'::jsonb,
  '["Comprehensive biomechanical lumbar spine and pelvic assessment","CAMPT-certified joint mobilizations and spinal manual therapy","IMS / Dry Needling to release chronic deep lumbar muscle spasms","Custom active core stabilization exercises (McKenzie / Stuart McGill protocols)"]'::jsonb,
  '["physiotherapy","massage-therapy","acupuncture"]'::jsonb,
  'Spine & Core',
  '{"title":"Back Pain Treatment Calgary | Nose Creek Physiotherapy","description":"Comprehensive back pain therapy, IMS dry needling, and spinal manual therapy in Calgary NW & NE.","ogTitle":"Back Pain Treatment | Nose Creek Physiotherapy","ogDescription":"End back pain without pills or surgery with evidence-based physical therapy in Calgary."}'::jsonb,
  0,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'neck-shoulder-pain',
  'neck-shoulder-pain',
  'Neck & Shoulder Pain',
  'Relief from cervical stiffness, pinched nerves, posture fatigue, and radiating shoulder tension.',
  'Neck and shoulder pain often stem from cervical joint restrictions, poor desk ergonomics (''tech neck''), or whiplash. When the cervical spine loses natural mobility, compensatory strain builds up across the upper trapezius and levator scapulae muscles, causing chronic aching and restricted rotation.',
  NULL,
  '["Stiffness turning the head or checking blind spots while driving","Radiating tension from the neck down into the shoulder blades","Tension headaches originating at the base of the skull (cervicogenic headaches)","Numbness or tingling sensations into the shoulder or arm"]'::jsonb,
  '["Gentle cervical and upper thoracic joint mobilizations","Myofascial release of suboccipital and shoulder girdle muscles","Cervical deep flexor retraining and chin-tuck exercises","Postural and workplace ergonomic calibration"]'::jsonb,
  '["physiotherapy","massage-therapy","acupuncture"]'::jsonb,
  'Spine & Neck',
  '{"title":"Neck & Shoulder Pain Treatment Calgary | Nose Creek","description":"Relieve neck stiffness, tech-neck, and shoulder tension with hands-on physiotherapy and massage in Calgary.","ogTitle":"Neck & Shoulder Pain Relief | Nose Creek","ogDescription":"Restore neck mobility and stop tension headaches with targeted physical therapy."}'::jsonb,
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'knee-pain',
  'knee-pain',
  'Knee Pain',
  'Specialized care for knee osteoarthritis, meniscus tears, patellar tendinitis, and ligament strains.',
  'Knee pain can severely limit your ability to walk, take stairs, or enjoy Calgary''s outdoor lifestyle. We diagnose the root biomechanical cause — whether it is cartilage wear, patellofemoral tracking dysfunction, or ligament instability — and deliver non-invasive treatments to restore joint function.',
  NULL,
  '["Aching or grinding sensation under the kneecap when walking down stairs","Swelling, stiffness, or warmth around the joint after physical activity","Feeling of knee instability, catching, or giving way","Sharp pain during squatting, kneeling, or running"]'::jsonb,
  '["Patellar tracking and lower-limb biomechanical assessment","Quadriceps, hamstring, and hip abductor strengthening","Shockwave therapy for chronic patellar tendinopathy","Custom or spring-loaded unloader knee bracing recommendations"]'::jsonb,
  '["physiotherapy","knee-bracing","shockwave-therapy","custom-orthotics"]'::jsonb,
  'Lower Extremity',
  '{"title":"Knee Pain Treatment & Knee Bracing Calgary | Nose Creek","description":"Evidence-based knee pain rehabilitation, custom knee bracing, and shockwave therapy in Calgary.","ogTitle":"Knee Pain Rehabilitation | Nose Creek Physiotherapy","ogDescription":"Stop knee pain without injections or surgery. Personalized physical therapy in Calgary."}'::jsonb,
  2,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'foot-pain',
  'foot-pain',
  'Foot Pain',
  'Targeted therapies for plantar fasciitis, Achilles tendinopathy, flat feet, and heel spurs.',
  'Your feet bear the weight of your entire body. Chronic foot pain — especially plantar fasciitis and Achilles tendinopathy — occurs when arches lack support or soft tissues undergo repetitive micro-trauma. Our combined shockwave and custom orthotic treatments provide rapid, lasting relief.',
  NULL,
  '["Sharp, stabbing heel pain during your very first morning steps","Aching arch pain after standing or walking on hard surfaces","Stiffness in the Achilles tendon after resting or exercising","Burning sensations in the ball of the foot (metatarsalgia)"]'::jsonb,
  '["Dynamic 3D digital gait analysis and foot mechanics evaluation","Radial shockwave therapy to stimulate cellular collagen repair","Custom medical orthotics to realign arch structure and foot biomechanics","Calf stretching, intrinsic foot muscle strengthening, and taping"]'::jsonb,
  '["custom-orthotics","shockwave-therapy","physiotherapy"]'::jsonb,
  'Lower Extremity',
  '{"title":"Foot Pain & Plantar Fasciitis Calgary | Nose Creek","description":"Heal plantar fasciitis, heel spurs, and Achilles tendon pain with shockwave therapy and custom orthotics in Calgary.","ogTitle":"Foot & Heel Pain Treatment | Nose Creek Physiotherapy","ogDescription":"Custom orthotics and acoustic shockwave therapy for lasting foot pain relief."}'::jsonb,
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'sports-injury',
  'sports-injury',
  'Sports Injury',
  'Sport-specific physical therapy and rehabilitation to get athletes back in the game safely and fast.',
  'From weekend warriors to competitive athletes, sports injuries require progressive, phase-based rehabilitation. We treat acute ligament sprains, muscle tears, and overuse syndromes with a focus on restoring strength, agility, and neuromuscular control to prevent re-injury.',
  NULL,
  '["Sudden popping sensation or swelling in a joint during play","Inability to bear full weight or sprint at top speed","Recurring muscle pulls (hamstring, groin, or calf strains)","Persistent tendon inflammation following high-intensity training"]'::jsonb,
  '["Sport-specific functional movement screen and strength testing","Manual therapy, soft tissue mobilization, and IMS dry needling","Progressive eccentric loading and plyometric training","Gradual return-to-sport protocols and injury prevention coaching"]'::jsonb,
  '["physiotherapy","massage-therapy","shockwave-therapy"]'::jsonb,
  'Athletic Rehab',
  '{"title":"Sports Injury Rehabilitation Calgary | Nose Creek","description":"Sport physiotherapy and athletic rehabilitation in Calgary NW & NE for sprains, tears, and tendonitis.","ogTitle":"Sports Injury Clinic | Nose Creek Physiotherapy","ogDescription":"Recover faster and return to your sport stronger with certified sport physiotherapy."}'::jsonb,
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'balance-falls',
  'balance-falls',
  'Balance & Falls',
  'Vestibular therapy and balance retraining to improve stability, confidence, and fall prevention.',
  'Balance problems and dizziness significantly increase fall risk and reduce daily independence. Our vestibular physiotherapists assess inner ear function, vision-proprioception integration, and lower extremity strength to build steady, confident movement.',
  NULL,
  '["Feeling unsteady, off-balance, or lightheaded when walking","Difficulty navigating dim rooms or uneven Calgary terrain","Fear of falling while stepping off curbs or ascending stairs","Dizziness or room-spinning sensations when turning the head (BPPV)"]'::jsonb,
  '["Vestibular ocular motor screening and Dix-Hallpike diagnostic maneuver","Canalith repositioning procedures (Epley maneuver for BPPV vertigo)","Dynamic balance retraining on uneven and multi-surface platforms","Gait speed training and lower limb stabilizer strengthening"]'::jsonb,
  '["physiotherapy"]'::jsonb,
  'Vestibular & Balance',
  '{"title":"Balance & Fall Prevention Clinic Calgary | Nose Creek","description":"Improve your balance, resolve vertigo, and prevent falls with specialized vestibular physiotherapy in Calgary.","ogTitle":"Balance & Fall Prevention | Nose Creek Physiotherapy","ogDescription":"Build steady footing and confidence with specialized balance and vestibular therapy."}'::jsonb,
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'shoulder-conditions',
  'shoulder-conditions',
  'Shoulder Conditions',
  'Specialized rehabilitation for rotator cuff tears, shoulder impingement, and frozen shoulder.',
  'The shoulder is the most mobile joint in the human body, making it vulnerable to impingement, rotator cuff strains, labral tears, and adhesive capsulitis (frozen shoulder). Our FCAMPT-certified manual therapists restore joint mechanics and scapular control.',
  NULL,
  '["Inability to reach behind your back or lift overhead without pain","Aching shoulder pain that interrupts sleep when lying on your side","Clicking, popping, or catching sensations during arm movement","Progressive loss of shoulder motion (Frozen Shoulder)"]'::jsonb,
  '["Glenohumeral and scapulothoracic joint mobilization","Rotator cuff strengthening and scapular stabilizer coordination","Shockwave therapy for calcific rotator cuff tendinitis","IMS dry needling to release hypertonic shoulder musculature"]'::jsonb,
  '["physiotherapy","shockwave-therapy","massage-therapy"]'::jsonb,
  'Upper Extremity',
  '{"title":"Shoulder Pain & Rotator Cuff Clinic Calgary | Nose Creek","description":"Expert rotator cuff rehabilitation, frozen shoulder therapy, and impingement treatment in Calgary.","ogTitle":"Shoulder Pain Rehabilitation | Nose Creek Physiotherapy","ogDescription":"Restore full overhead reach and pain-free sleep with evidence-based shoulder physiotherapy."}'::jsonb,
  6,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'concussion',
  'concussion',
  'Concussion',
  'Evidence-based post-concussion management, visual-vestibular therapy, and safe return-to-activity.',
  'A concussion is a mild traumatic brain injury caused by a direct impact or rapid acceleration-deceleration force. Our evidence-based concussion management protocol addresses cervical spine involvement, vestibular-ocular dysfunction, and autonomic symptom tolerance.',
  NULL,
  '["Persistent headaches, brain fog, and fatigue","Sensitivity to bright light or noisy environments","Dizziness, visual strain, or trouble focusing while reading screens","Memory difficulties and slowed processing speed"]'::jsonb,
  '["Comprehensive baseline and post-injury cognitive/vestibular evaluation","Cervical manual therapy for associated neck whiplash tension","Vestibular-ocular reflex (VOR) and gaze stabilization drills","Sub-symptom threshold aerobic conditioning for autonomic recovery"]'::jsonb,
  '["physiotherapy"]'::jsonb,
  'Neurological & Head',
  '{"title":"Concussion Management Clinic Calgary | Nose Creek","description":"Comprehensive concussion testing, visual-vestibular rehab, and cervical treatment in Calgary.","ogTitle":"Concussion Rehabilitation | Nose Creek Physiotherapy","ogDescription":"Evidence-based post-concussion care to restore mental clarity and safe return to sport."}'::jsonb,
  7,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'hip-pain',
  'hip-pain',
  'Hip Pain',
  'Therapy for hip osteoarthritis, labral tears, trochanteric bursitis, and groin tightness.',
  'Hip pain can originate from the joint capsule itself (osteoarthritis or labral tears) or peri-articular structures like the gluteal tendons and bursae. We pinpoint the exact driver of hip discomfort and restore painless walking, stair climbing, and athletic activity.',
  NULL,
  '["Deep groin aching after prolonged sitting or walking","Sharp pain on the outside of the hip when sleeping on your side (bursitis)","Stiffness in the morning when putting on socks and shoes","Pinching feeling in the front of the hip when squatting"]'::jsonb,
  '["Pelvic-lumbar-hip kinetic chain biomechanical assessment","Hip capsule distraction and manual mobilization techniques","Gluteus medius and deep hip rotator strengthening","Shockwave therapy for stubborn greater trochanteric pain syndrome"]'::jsonb,
  '["physiotherapy","shockwave-therapy","massage-therapy"]'::jsonb,
  'Lower Extremity',
  '{"title":"Hip Pain Treatment Calgary | Nose Creek Physiotherapy","description":"Relieve hip bursitis, arthritis, and groin pain with specialized physical therapy in Calgary.","ogTitle":"Hip Pain Rehabilitation | Nose Creek Physiotherapy","ogDescription":"Restore hip mobility and pain-free walking with expert manual physiotherapy."}'::jsonb,
  8,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'sciatica',
  'sciatica',
  'Sciatica',
  'Targeted nerve decompression, gentle neural flossing, and herniated disc recovery.',
  'Sciatica occurs when the sciatic nerve is compressed or irritated by a lumbar disc herniation, spinal stenosis, or piriformis muscle spasm. We use gentle neural mobilizations, spinal decompression strategies, and core stability to relieve radiating nerve pain.',
  NULL,
  '["Electric, burning, or shooting pain traveling down the buttock into the leg","Numbness, ''pins and needles'', or weakness in the foot and toes","Pain that worsens when sitting, coughing, or driving","Constant deep ache in one side of the lower back and buttock"]'::jsonb,
  '["Neurological sensory, motor, and reflex testing","Gentle neural mobilization and ''nerve flossing'' techniques","Lumbar directional preference exercises to centralize pain","Piriformis and deep gluteal myofascial release"]'::jsonb,
  '["physiotherapy","acupuncture","massage-therapy"]'::jsonb,
  'Spine & Nerve',
  '{"title":"Sciatica & Pinched Nerve Relief Calgary | Nose Creek","description":"Fast relief from radiating sciatic nerve pain and lumbar disc compression in Calgary.","ogTitle":"Sciatica Treatment Clinic | Nose Creek Physiotherapy","ogDescription":"Decompress your sciatic nerve and stop radiating leg pain without invasive surgery."}'::jsonb,
  9,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'nerve-pain',
  'nerve-pain',
  'Nerve Pain',
  'Advanced treatment for peripheral neuropathy, carpal tunnel, and compressed nerves.',
  'Nerve entrapment syndromes like carpal tunnel, thoracic outlet syndrome, and cubital tunnel cause burning, tingling, and motor weakness. Our targeted nerve mobilization and manual decompression treatments alleviate mechanical pressure and restore healthy neural glide.',
  NULL,
  '["Tingling, burning sensations, or numbness in the hands, arms, or feet","Loss of grip strength or dropping objects unexpectedly","Deep, unrelenting ache along a specific nerve pathway","Increased sensitivity to light touch or temperature changes"]'::jsonb,
  '["Detailed upper and lower limb neurodynamic tension testing","Manual decompression of anatomical entrapment tunnels","Gentle neural glide exercises and postural retraining","Acupuncture and IMS dry needling for nerve signal regulation"]'::jsonb,
  '["physiotherapy","acupuncture","massage-therapy"]'::jsonb,
  'Nerve & Neurological',
  '{"title":"Nerve Pain & Neuropathy Treatment Calgary | Nose Creek","description":"Targeted nerve decompression, neural glide therapy, and pain management in Calgary.","ogTitle":"Nerve Pain Treatment | Nose Creek Physiotherapy","ogDescription":"Resolve carpal tunnel, pinched nerves, and neuropathy with specialized physical therapy."}'::jsonb,
  10,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'headaches',
  'headaches',
  'Headaches',
  'Relief from cervicogenic headaches, tension headaches, and posture-induced migraine triggers.',
  'Up to 80% of persistent tension headaches originate from the upper cervical spine (cervicogenic headaches). When upper neck joints and suboccipital muscles are irritated, referred pain radiates upward over the skull into the temples and behind the eyes.',
  NULL,
  '["Aching pain starting at the base of the skull spreading forward to the forehead","Headache intensity that increases after prolonged screen work","Neck tightness or tenderness to touch at the top of the neck","Light or sound sensitivity linked with neck stiffness"]'::jsonb,
  '["Upper cervical (C1–C3) facet joint assessment and gentle mobilization","Suboccipital trigger point release and acupuncture","Ergonomic computer and sitting posture adjustment","Cervical stabilization and progressive postural endurance exercises"]'::jsonb,
  '["physiotherapy","massage-therapy","acupuncture"]'::jsonb,
  'Head & Neck',
  '{"title":"Cervicogenic Headache Treatment Calgary | Nose Creek","description":"Stop tension and neck headaches with cervical manual therapy and dry needling in Calgary.","ogTitle":"Headache Relief Clinic | Nose Creek Physiotherapy","ogDescription":"Target the cervical root cause of chronic headaches for lasting relief without daily pills."}'::jsonb,
  11,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'muscle-pain',
  'muscle-pain',
  'Muscle Pain',
  'Deep tissue therapies, IMS dry needling, and myofascial release for chronic muscle soreness.',
  'Chronic muscle pain, taut bands, and myofascial trigger points develop from repetitive strain, postural overload, or protective guarding after injury. We combine deep tissue massage, IMS dry needling, and active loading to release contracted fibers.',
  NULL,
  '["Deep, constant muscle aching in the back, shoulders, or legs","Tender knots or trigger points that refer pain when pressed","Stiffness and reduced muscle flexibility","Muscle fatigue and sluggish recovery after physical work"]'::jsonb,
  '["Intramuscular Stimulation (IMS / Dry Needling) for deep muscle release","Registered Massage Therapy and myofascial trigger point work","Therapeutic stretching and progressive resistance loading","Hydration, heat/ice protocols, and postural modifications"]'::jsonb,
  '["massage-therapy","physiotherapy","acupuncture"]'::jsonb,
  'Muscular & Soft Tissue',
  '{"title":"Muscle Pain & Myofascial Relief Calgary | Nose Creek","description":"Release chronic muscle knots and soreness with IMS dry needling and massage therapy in Calgary.","ogTitle":"Muscle Pain Treatment | Nose Creek Physiotherapy","ogDescription":"Relieve deep muscle knots and spasms with registered massage therapy and IMS dry needling."}'::jsonb,
  12,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'joint-pain',
  'joint-pain',
  'Joint Pain',
  'Non-invasive treatments for arthritis, joint stiffness, bursitis, and cartilage wear.',
  'Whether dealing with osteoarthritis in the knees, hips, or spine, or inflammatory joint stiffness, physical therapy helps lubricate joint surfaces, strengthen surrounding stabilizers, and offload joint pressure.',
  NULL,
  '["Stiffness and joint cracking that improves with gentle movement","Joint swelling or localized tenderness after activity","Loss of full range of motion in shoulders, hips, or knees","Aching during cold or damp Calgary weather changes"]'::jsonb,
  '["Joint traction, distraction, and manual mobilization","Low-impact strengthening exercises (glute, quad, and core stabilizers)","Shockwave therapy for adjacent tendinopathy and calcifications","Custom bracing and orthotics to optimize joint loading"]'::jsonb,
  '["physiotherapy","shockwave-therapy","knee-bracing","custom-orthotics"]'::jsonb,
  'Joints & Arthritis',
  '{"title":"Joint Pain & Arthritis Management Calgary | Nose Creek","description":"Non-surgical joint pain relief, osteoarthritis care, and joint mobilization in Calgary.","ogTitle":"Joint Pain & Arthritis Therapy | Nose Creek","ogDescription":"Lubricate joints and restore pain-free movement with customized physiotherapy."}'::jsonb,
  13,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'workplace-injuries',
  'workplace-injuries',
  'Workplace Injuries',
  'WCB-approved physiotherapy and active conditioning to return to work safely and comfortably.',
  'Workplace injuries range from repetitive strain and heavy lifting disc herniations to slips and falls on job sites. We provide prompt clinical assessment, WCB claim coordination, and functional work conditioning to get you back on the job safely.',
  NULL,
  '["Acute back or shoulder pain following heavy lifting at work","Repetitive strain injury (RSI) in wrists, elbows, or neck","Joint sprains or contusions resulting from slips and falls","Inability to complete full physical shifts without significant discomfort"]'::jsonb,
  '["Immediate WCB clinical assessment and paperwork support","Pain relief through manual therapy and soft tissue treatments","Work-simulation conditioning and ergonomic education","Structured, graduated return-to-work planning"]'::jsonb,
  '["physiotherapy","massage-therapy"]'::jsonb,
  'Work & Occupational',
  '{"title":"WCB Workplace Injury Physiotherapy Calgary | Nose Creek","description":"WCB-approved physical therapy and occupational rehabilitation in Calgary NW & NE.","ogTitle":"Workplace Injury Rehabilitation | Nose Creek","ogDescription":"Fast recovery and WCB claim support for workplace injuries in Calgary."}'::jsonb,
  14,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'motor-vehicle-accidents',
  'motor-vehicle-accidents',
  'Motor Vehicle Accidents',
  'Direct-billed MVA auto insurance rehabilitation for whiplash, back strains, and trauma recovery.',
  'Motor vehicle collisions (MVA) subject the body to rapid deceleration forces, resulting in whiplash, spinal ligament sprains, concussions, and chest wall contusions. In Alberta, accident claims are direct-billed to your auto insurer without out-of-pocket costs.',
  NULL,
  '["Neck stiffness, whiplash tension, and restricted head turning","Persistent tension headaches and cognitive fatigue following collision","Lower back pain and thoracic spinal soreness","Seatbelt bruising and chest wall tenderness"]'::jsonb,
  '["Comprehensive diagnostic AB-2 injury assessment","Direct billing coordination with auto insurance providers (No out-of-pocket fees)","Gentle cervical manual therapy, IMS, and massage therapy","Progressive spinal stabilization and active range of motion recovery"]'::jsonb,
  '["physiotherapy","massage-therapy","acupuncture"]'::jsonb,
  'MVA & Whiplash',
  '{"title":"MVA Whiplash & Car Accident Physiotherapy Calgary","description":"Direct-billed auto insurance physiotherapy for whiplash and car accident injuries in Calgary.","ogTitle":"Motor Vehicle Accident Rehab | Nose Creek","ogDescription":"Complete whiplash and auto injury rehabilitation with 100% direct insurance billing in Alberta."}'::jsonb,
  15,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
INSERT INTO conditions (id, slug, name, short_description, description, hero_image, symptoms, treatment_approach, related_services, category, seo, sort_order, is_published)
VALUES (
  'chest-rib-pain',
  'chest-rib-pain',
  'Chest & Rib Pain',
  'Therapy for costochondritis, rib joint subluxations, and intercostal muscle strains.',
  'Sharp pain when taking a deep breath, coughing, or twisting is often caused by rib joint dysfunction (costovertebral subluxation), costochondritis, or intercostal muscle strains. Our gentle thoracic mobilizations quickly restore rib mechanics and painless breathing.',
  NULL,
  '["Sharp, localized pain in the chest wall or upper back when inhaling deeply","Pinching sensation between the shoulder blades and rib cage","Tenderness over the cartilage connections along the breastbone (costochondritis)","Pain with torso twisting, laughing, or coughing"]'::jsonb,
  '["Thoracic spine and rib cage joint mobility assessment","Gentle costovertebral joint mobilization and rib realignments","Intercostal muscle release and thoracic mobility stretches","Diaphragmatic breathing mechanics and postural training"]'::jsonb,
  '["physiotherapy","massage-therapy"]'::jsonb,
  'Thorax & Ribs',
  '{"title":"Chest & Rib Pain Treatment Calgary | Nose Creek","description":"Relieve costochondritis, rib subluxations, and thoracic pain with gentle physiotherapy in Calgary.","ogTitle":"Chest & Rib Pain Physiotherapy | Nose Creek","ogDescription":"Restore painless breathing and rib cage alignment with expert physical therapy."}'::jsonb,
  16,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;

-- 4. Team Members
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'blair-schachterle',
  'blair-schachterle',
  'Blair Schachterle',
  'President & Physiotherapist',
  'BScPT, Dip Manip PT, Dip Sport PT, FCAMPT, CGIMS',
  'Blair has been a physiotherapist at Nose Creek since 2001. Graduated from University of Alberta with a BScPT in 1992, specializing in Orthopaedic Manual Therapy and Sport Therapy.',
  'Blair Schachterle graduated from the University of Alberta with a BScPT in 1992, focusing on Orthopaedic Manual Therapy and Sport Therapy. He completed his Sport Therapy Diploma in 1997 and his Advanced Manual & Manipulative Diploma in 1998. Blair is a Fellow of the Canadian Academy of Manipulative Physiotherapy (FCAMPT) and previously served six years as Executive Chair of CAMPT. He is also certified in Gunn Intramuscular Stimulation (IMS / Dry Needling) and custom knee bracing.',
  '/images/team/blair-schachterle.jpg',
  '["Orthopaedic Manual Therapy","Sport Therapy","IMS Dry Needling","Spinal Rehabilitation","Knee Bracing","Shockwave Therapy"]'::jsonb,
  '["BScPT","Dip Manip PT","Dip Sport PT","FCAMPT","CGIMS"]'::jsonb,
  '["Bachelor of Science in Physical Therapy - University of Alberta (1992)","Sport Therapy Diploma - Canadian Academy of Sport Physical Therapy (1997)","Advanced Manual & Manipulative Diploma - Orthopaedic Division CPA (1998)"]'::jsonb,
  '["Fellow of Canadian Academy of Manipulative Physiotherapy (FCAMPT)","Gunn IMS Certified Practitioner (CGIMS)","Custom Knee Bracing Specialist"]'::jsonb,
  '24+ Years at Nose Creek Physiotherapy',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy","shockwave-therapy","knee-bracing","custom-orthotics"]'::jsonb,
  '["English"]'::jsonb,
  'blair@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '{"linkedin":"https://www.linkedin.com/company/nose-creek-sport-physical-therapy"}'::jsonb,
  true,
  true,
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'rizelle-manzano',
  'rizelle-manzano',
  'Rizelle Manzano',
  'Physiotherapist',
  'BScPT, Registered Physiotherapist',
  'Rizelle is a dedicated physiotherapist passionate about helping patients restore movement and reduce pain through evidence-based treatments.',
  'Rizelle Manzano is a registered physiotherapist with a strong foundation in orthopaedic and musculoskeletal rehabilitation. She combines gentle joint mobilization, soft tissue release, pelvic floor health, and therapeutic exercise prescription to empower patients to achieve lasting, pain-free mobility.',
  '/images/team/rizelle-manzano.webp',
  '["Orthopaedic Rehabilitation","Manual Therapy","Exercise Prescription","Pelvic Floor Physiotherapy","Post-Surgical Recovery"]'::jsonb,
  '["Registered Physiotherapist (Physiotherapy Alberta College + Association)"]'::jsonb,
  '["Bachelor of Science in Physical Therapy","Advanced Orthopaedic Manual Therapy Training","Pelvic Floor Health Certification"]'::jsonb,
  '["Registered Physiotherapist","Pelvic Floor Rehabilitation"]'::jsonb,
  '4+ Years Clinical Experience',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy","pelvic-health"]'::jsonb,
  '["English","Tagalog"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  2,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'samuel-adelugba',
  'samuel-adelugba',
  'Samuel Adelugba',
  'Physiotherapist Assistant',
  'PTA, Exercise Specialist',
  'Samuel supports our physiotherapy team with hands-on rehabilitation, active exercise guidance, and patient recovery programs.',
  'Samuel Adelugba is a dedicated Physiotherapist Assistant who works closely alongside our licensed physical therapists. He assists patients through active exercise conditioning, modality application, and functional recovery programs designed to restore muscle strength and joint mobility.',
  '/images/team/samuel-adelugba.webp',
  '["Therapeutic Exercise Coaching","Postural Conditioning","Rehabilitation Support"]'::jsonb,
  '["Certified Physiotherapist Assistant (PTA)"]'::jsonb,
  '["Diploma in Physical Therapist Assistant & Occupational Therapist Assistant","Kinesiology & Exercise Science Studies"]'::jsonb,
  '["Certified PTA","CPR & First Aid Certified"]'::jsonb,
  '3+ Years Experience',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy"]'::jsonb,
  '["English"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'janvi-shah',
  'janvi-shah',
  'Janvi Shah',
  'Physiotherapist Assistant',
  'PTA',
  'Janvi assists in delivering patient-focused rehabilitation programs with a focus on recovery and functional improvement.',
  'Janvi Shah is a compassionate Physiotherapist Assistant who helps guide patients through their prescribed therapeutic exercise routines. She provides dedicated one-on-one encouragement, gait training support, and modality treatments to ensure each visit is comfortable and effective.',
  '/images/team/janvi-shah.webp',
  '["Rehabilitation Exercise","Patient Education","Mobility Retraining"]'::jsonb,
  '["Certified Physiotherapist Assistant (PTA)"]'::jsonb,
  '["Physiotherapist Assistant Diploma","Movement Science & Rehabilitation Fundamentals"]'::jsonb,
  '["Certified PTA"]'::jsonb,
  '2+ Years Experience',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy"]'::jsonb,
  '["English","Hindi","Gujarati"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'hanna-johnson',
  'hanna-johnson',
  'Hanna Johnson',
  'Physiotherapist Intern',
  'BScPT (Candidate)',
  'Hanna brings enthusiasm and modern evidence-based knowledge to patient assessments and treatment programs.',
  'Hanna Johnson is an enthusiastic Physiotherapist Intern working under the direct clinical supervision of our senior physical therapy team. She utilizes modern biomechanical assessment methods, active therapeutic exercise, and hands-on techniques to help patients recover safely from injury.',
  '/images/team/hanna-johnson.webp',
  '["Musculoskeletal Assessment","Active Exercise Therapy","Sports Rehabilitation"]'::jsonb,
  '["Physiotherapist Intern"]'::jsonb,
  '["Master of Science in Physical Therapy (Candidate)","Bachelor of Science in Kinesiology"]'::jsonb,
  '["Clinical Intern"]'::jsonb,
  'Clinical Intern',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy"]'::jsonb,
  '["English"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'madelyne-agius',
  'madelyne-agius',
  'Madelyne Agius',
  'Physiotherapist',
  'BScPT, Registered Physiotherapist',
  'Madelyne is a registered physiotherapist with a passion for helping patients recover from musculoskeletal conditions.',
  'Madelyne Agius is a Registered Physiotherapist who utilizes individualized manual therapy, postural education, and evidence-based exercise therapy to treat spinal complaints, joint dysfunction, and post-surgical conditions. Her goal is to equip every patient with tools for long-term health.',
  '/images/team/madelyne-agius.webp',
  '["Musculoskeletal Rehabilitation","Spinal Therapy","Manual Joint Mobilization","Post-Surgical Care"]'::jsonb,
  '["Registered Physiotherapist (Physiotherapy Alberta College)"]'::jsonb,
  '["Bachelor of Science in Physical Therapy","Post-Graduate Orthopaedic Division Level Courses"]'::jsonb,
  '["Registered Physiotherapist"]'::jsonb,
  '4+ Years Clinical Practice',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy","pelvic-health"]'::jsonb,
  '["English"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  6,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'dr-alex-toutant',
  'dr-alex-toutant',
  'Dr. Alex Toutant',
  'Chiropractor',
  'DC, Doctor of Chiropractic',
  'Dr. Toutant provides comprehensive chiropractic care focused on spinal health, posture, and athletic performance.',
  'Dr. Alex Toutant is a Doctor of Chiropractic dedicated to diagnosing and resolving biomechanical restrictions in the spine and extremities. Through gentle chiropractic adjustments, soft tissue release, and functional movement screens, Dr. Toutant helps patients overcome back pain, neck stiffness, and headaches.',
  '/images/team/alex-toutant.jpg',
  '["Spinal Adjustments","Postural Correction","Athletic Rehabilitation","Extremity Adjustments","Sciatica Relief"]'::jsonb,
  '["Doctor of Chiropractic (DC)","Canadian Chiropractic Association Member"]'::jsonb,
  '["Doctor of Chiropractic - Canadian Memorial Chiropractic College","Bachelor of Science in Kinesiology"]'::jsonb,
  '["Licensed Doctor of Chiropractic","Myofascial Release Certified"]'::jsonb,
  '5+ Years Experience',
  '["nose-creek-clinic"]'::jsonb,
  '["physiotherapy"]'::jsonb,
  '["English","French"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  7,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'katie-luu',
  'katie-luu',
  'Katie Luu',
  'Massage Therapist',
  'RMT, Registered Massage Therapist',
  'Katie is a Registered Massage Therapist specializing in therapeutic and relaxation massage for stress relief and recovery.',
  'Katie Luu is a highly skilled 2200-hour Registered Massage Therapist (RMT). She specializes in deep tissue massage, trigger point therapy, and myofascial release to relieve chronic neck, shoulder, and back tension while promoting deep relaxation.',
  '/images/team/katie-luu.jpg',
  '["Deep Tissue Massage","Trigger Point Release","Therapeutic Massage","Relaxation & Stress Relief"]'::jsonb,
  '["Registered Massage Therapist (2200-Hour RMT)"]'::jsonb,
  '["2200-Hour Advanced Massage Therapy Diploma","Myofascial Trigger Point Specialization"]'::jsonb,
  '["Registered Massage Therapist (MTAA / CRMTA Member)"]'::jsonb,
  '5+ Years Practice',
  '["nose-creek-clinic"]'::jsonb,
  '["massage-therapy"]'::jsonb,
  '["English","Cantonese"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  8,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'shawn-gille',
  'shawn-gille',
  'Shawn Gille',
  'Massage Therapist',
  'RMT, Registered Massage Therapist',
  'Shawn specializes in sports massage, deep tissue therapy, and injury rehabilitation to help clients recover faster.',
  'Shawn Gille is a Registered Massage Therapist with extensive experience in sports massage and injury rehabilitation. He works with athletes, runners, and active individuals to resolve stubborn muscle knots, enhance flexibility, and accelerate muscle recovery.',
  '/images/team/shawn-gille.jpg',
  '["Sports Massage","Deep Tissue Therapy","Injury Rehabilitation","Myofascial Cupping"]'::jsonb,
  '["Registered Massage Therapist (2200-Hour RMT)"]'::jsonb,
  '["2200-Hour Massage Therapy Diploma","Sports Injury Rehabilitation Workshop Certifications"]'::jsonb,
  '["Registered Massage Therapist","Cupping Therapy Certified"]'::jsonb,
  '6+ Years Practice',
  '["nose-creek-clinic"]'::jsonb,
  '["massage-therapy"]'::jsonb,
  '["English"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  9,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'amalia',
  'amalia',
  'Amalia',
  'Massage Therapist',
  'RMT, Registered Massage Therapist',
  'Amalia is a compassionate massage therapist focused on holistic wellness and therapeutic pain relief.',
  'Amalia is a Registered Massage Therapist who provides gentle yet deeply effective therapeutic massage treatments. She blends Swedish relaxation techniques with trigger point and myofascial therapy to relieve stress, tension headaches, and muscle tightness.',
  '/images/team/amalia.webp',
  '["Therapeutic Massage","Relaxation Massage","Stress & Headache Relief","Prenatal Massage"]'::jsonb,
  '["Registered Massage Therapist (2200-Hour RMT)"]'::jsonb,
  '["2200-Hour Massage Therapy Program","Prenatal & Therapeutic Massage Specialization"]'::jsonb,
  '["Registered Massage Therapist"]'::jsonb,
  '4+ Years Practice',
  '["nose-creek-clinic"]'::jsonb,
  '["massage-therapy"]'::jsonb,
  '["English"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  10,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'smita-nagpal',
  'smita-nagpal',
  'Smita Nagpal',
  'Massage Therapist',
  'RMT, Registered Massage Therapist',
  'Smita brings a warm, caring approach to massage therapy with a focus on chronic pain management and stress reduction.',
  'Smita Nagpal is a Registered Massage Therapist dedicated to helping clients manage chronic pain, reduce postural strain, and improve overall quality of life. Her therapeutic treatments focus on loosening tight fascia and restoring balanced muscle tone.',
  '/images/team/smita-nagpal.webp',
  '["Chronic Pain Management","Stress Reduction","Postural Realignment Massage","Swedish Relaxation"]'::jsonb,
  '["Registered Massage Therapist (2200-Hour RMT)"]'::jsonb,
  '["2200-Hour Registered Massage Therapy Diploma","Advanced Soft Tissue Mobilization"]'::jsonb,
  '["Registered Massage Therapist"]'::jsonb,
  '5+ Years Practice',
  '["nose-creek-clinic"]'::jsonb,
  '["massage-therapy"]'::jsonb,
  '["English","Hindi","Punjabi"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  11,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'jihan-shayya',
  'jihan-shayya',
  'Jihan Shayya',
  'Massage Therapist',
  'RMT, Registered Massage Therapist',
  'Jihan offers therapeutic massage with a focus on muscle recovery, tension relief, and patient comfort.',
  'Jihan Shayya is a Registered Massage Therapist who provides tailored therapeutic treatments for muscle spasms, desk posture tension, and post-accident recovery. She creates a calm, restorative environment for every patient.',
  '/images/team/jihan-shayya.webp',
  '["Muscle Recovery","Tension Relief","Therapeutic Massage","Trigger Point Therapy"]'::jsonb,
  '["Registered Massage Therapist (2200-Hour RMT)"]'::jsonb,
  '["2200-Hour Massage Therapy Training","Clinical Trigger Point Therapy"]'::jsonb,
  '["Registered Massage Therapist"]'::jsonb,
  '4+ Years Practice',
  '["nose-creek-clinic"]'::jsonb,
  '["massage-therapy"]'::jsonb,
  '["English","Arabic"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  12,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'dr-eileen-wei',
  'dr-eileen-wei',
  'Dr. Eileen Wei',
  'TCM Acupuncturist',
  'Dr.TCM, R.Ac, Registered Acupuncturist',
  'Dr. Wei is a Doctor of Traditional Chinese Medicine offering acupuncture for pain management, stress, and holistic health.',
  'Dr. Eileen Wei is a registered Doctor of Traditional Chinese Medicine (Dr.TCM) and Acupuncturist with over a decade of clinical experience. She uses classical pulse/tongue diagnostics, fine sterile acupuncture needling, and cupping to treat chronic back pain, arthritis, migraines, and systemic tension.',
  '/images/team/eileen-wei.jpg',
  '["Acupuncture","Traditional Chinese Medicine","Chronic Pain Management","Migraine & Headache Relief","Stress & Sleep Balance"]'::jsonb,
  '["Doctor of Traditional Chinese Medicine (Dr.TCM)","Registered Acupuncturist (R.Ac)"]'::jsonb,
  '["Doctor of Traditional Chinese Medicine Diploma","Advanced Classical Acupuncture & Herbology Training"]'::jsonb,
  '["Registered Acupuncturist (CAAA Member)","Doctor of TCM"]'::jsonb,
  '10+ Years Clinical Experience',
  '["nose-creek-clinic"]'::jsonb,
  '["acupuncture"]'::jsonb,
  '["English","Mandarin","Cantonese"]'::jsonb,
  'info@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  13,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  'lorna-ebron',
  'lorna-ebron',
  'Lorna Ebron',
  'Accounts Receivable / Billings Manager',
  'Billing & Patient Insurance Coordinator',
  'Lorna manages our billing and accounts receivable, ensuring smooth and accurate insurance direct billing for all patients.',
  'Lorna Ebron is the Accounts Receivable and Billings Manager at Nose Creek Physiotherapy. With extensive knowledge of Alberta health insurance portals, MVA auto insurance claims, and WCB protocols, Lorna makes direct billing effortless and transparent for all our patients.',
  '/images/team/lorna-ebron.jpg',
  '["Direct Insurance Billing","Extended Health Plans","MVA Auto Claims Coordination","WCB Claims"]'::jsonb,
  '["Healthcare Billing Administration Specialist"]'::jsonb,
  '["Medical Office & Billing Administration Diploma","Alberta Health & Extended Benefits Claims Coordination"]'::jsonb,
  '["Direct Billing Specialist"]'::jsonb,
  '6+ Years at Nose Creek',
  '["nose-creek-clinic"]'::jsonb,
  '[]'::jsonb,
  '["English","Tagalog"]'::jsonb,
  'billing@nosecreekphysiotherapy.com',
  '403-295-8590',
  'https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington',
  '[]'::jsonb,
  true,
  false,
  14,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;

-- 5. Locations
INSERT INTO locations (id, name, slug, address, phone, email, opening_hours, map_embed_url, services, team_members, testimonials, description, images, booking_url, seo, is_published)
VALUES (
  'nose-creek-clinic',
  'Nose Creek Clinic',
  'nose-creek-clinic',
  '123 Nose Creek Gate NW, Calgary, AB T3K 5N4',
  '(403) 555-0199',
  'nosecreek@beactiveclinic.ca',
  '{"monday":"8:00 am — 8:00 pm","tuesday":"8:00 am — 8:00 pm","wednesday":"8:00 am — 8:00 pm","thursday":"8:00 am — 8:00 pm","friday":"8:00 am — 8:00 pm","saturday":"8:00 am — 3:00 pm","sunday":"Closed"}'::jsonb,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d80211.23439401777!2d-114.15049386343513!3d51.134261763138865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53716447ab2881a7%3A0x7d6f51be0e6f6630!2sNose%20Creek!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca',
  '["physiotherapy","chiropractic-care","sports-injury-rehabilitation","massage-therapy"]'::jsonb,
  '["dr-junmo-lee","falgun-patel"]'::jsonb,
  '["review-1","review-2"]'::jsonb,
  'Located in the heart of Nose Creek in Northwest Calgary, our modern clinic is equipped with the latest physiotherapy modalities, active exercise gym equipment, and comfortable private treatment rooms. We offer ample free parking and are easily accessible by public transit.',
  '["/images/locations/nosecreek-exterior.jpg","/images/locations/nosecreek-interior.jpg"]'::jsonb,
  '#booking',
  '{"title":"BeActive Clinic at Nose Creek NW | Calgary Physiotherapy & Chiropractic","description":"Visit BeActive Chiropractic & Physiotherapy Clinic at Nose Creek Gate NW. Expert care in Northwest Calgary. Free parking, direct insurance billing.","ogTitle":"Nose Creek Clinic NW Calgary | BeActive","ogDescription":"Find location details, maps, hours, and book chiropractic and physical therapy at our Nose Creek clinic."}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- 6. Blog Posts
INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image, author, category, tags, published_at, reading_time, related_posts, seo, is_published)
VALUES (
  'post-1',
  'navigating-shoulder-muscle-strain-recovery-calgary-north',
  'Navigating Shoulder Muscle Strain Recovery: What to Expect Over Weeks',
  'Shoulder strain recovery typically runs 12–16 weeks across three phases. Rushing it raises the risk of setbacks — here is what to expect, week by week.',
  '<p>Shoulder muscle strain is one of the most common injuries we treat at Nose Creek Physiotherapy. Whether from sport, workplace activity, or a motor vehicle collision, a shoulder strain requires structured, phased rehabilitation to achieve full recovery without re-injury.</p><h3>Phase 1 (Weeks 1–4): Protect and Reduce Inflammation</h3><p>The priority in the first phase is reducing pain and inflammation while protecting the injured tissue. Ice, relative rest, and gentle range-of-motion exercises are the foundation of early treatment.</p><h3>Phase 2 (Weeks 4–10): Rebuild Strength</h3><p>Once acute pain is controlled, we progressively reload the shoulder with resistance exercises targeting the rotator cuff and scapular stabilizers. Manual therapy and shockwave may be introduced at this stage.</p><h3>Phase 3 (Weeks 10–16): Return to Full Activity</h3><p>Functional training, sport-specific drills, and gradual return to full workload. Our physiotherapists closely monitor progress and adjust the program based on your response to loading.</p>',
  '/images/blog/navigating-shoulder-muscle-strain-recovery.jpg',
  'Christian Krohn',
  'Shoulder',
  '["Shoulder Pain","Muscle Strain","Rehabilitation","Recovery"]'::jsonb,
  '2026-05-21T09:00:00Z',
  '5 min read',
  '["neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision-calgary-north","neck-upper-back-posture-jaw-function-tmj-discomfort"]'::jsonb,
  '{"title":"Shoulder Muscle Strain Recovery | Nose Creek Physiotherapy Calgary","description":"Shoulder strain recovery typically runs 12–16 weeks. Learn what to expect at each stage and how physiotherapy accelerates healing.","ogTitle":"Navigating Shoulder Muscle Strain Recovery | Nose Creek","ogDescription":"Understand the 3 phases of shoulder strain recovery and how our Calgary physiotherapy team guides you through each one.","ogImage":"/images/blog/navigating-shoulder-muscle-strain-recovery.jpg"}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content;
INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image, author, category, tags, published_at, reading_time, related_posts, seo, is_published)
VALUES (
  'post-2',
  'neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision-calgary-north',
  'How Neck Whiplash & Headaches Affect Focus After a Collision',
  'Whiplash tension can trigger lasting headaches and cloud concentration and memory. How physiotherapy targets the root cause and restores mental clarity.',
  '<p>A motor vehicle collision can cause whiplash — a rapid flexion-extension of the neck that strains muscles, ligaments, and cervical joints. What many patients don''t realize is that these neck injuries often produce persistent tension headaches and cognitive difficulties that linger long after the initial pain subsides.</p><h3>The Whiplash-Headache Connection</h3><p>Cervical joint irritation refers pain to the head via the trigemino-cervical nucleus. This means that neck stiffness and restricted mobility can directly cause headaches, visual disturbances, and difficulty concentrating — a cluster of symptoms sometimes called post-concussive syndrome even without head impact.</p><h3>How Physiotherapy Helps</h3><p>Our Calgary physiotherapists use cervical manual therapy, dry needling, and progressive neck stabilization exercises to reduce joint irritation and break the headache cycle. Most patients report significant improvement in focus and headache frequency within 4–8 weeks of targeted treatment.</p>',
  '/images/blog/neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg',
  'Christian Krohn',
  'Neck & Head',
  '["Whiplash","Headaches","Motor Vehicle Accident","Neck Pain","Physiotherapy"]'::jsonb,
  '2026-05-15T09:00:00Z',
  '4 min read',
  '["navigating-shoulder-muscle-strain-recovery-calgary-north","neck-upper-back-posture-jaw-function-tmj-discomfort"]'::jsonb,
  '{"title":"Whiplash & Headaches After Collision | Nose Creek Physiotherapy","description":"Whiplash can cause persistent headaches and brain fog. Learn how physiotherapy targets the cervical root cause for lasting relief.","ogTitle":"Whiplash Headaches & Focus Issues After MVA | Nose Creek","ogDescription":"Neck whiplash can cloud your thinking. Discover how our Calgary physio team targets the root cause.","ogImage":"/images/blog/neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg"}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content;
INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image, author, category, tags, published_at, reading_time, related_posts, seo, is_published)
VALUES (
  'post-3',
  'neck-upper-back-posture-jaw-function-tmj-discomfort',
  'How Posture Impacts Jaw Function and TMJ Discomfort',
  'Forward head posture and rounded shoulders alter jaw mechanics and fuel TMJ pain. A whole-chain physiotherapy approach for lasting relief.',
  '<p>The temporomandibular joint (TMJ) connects your jawbone to your skull and is involved in every bite, yawn, and spoken word. What many people don''t realize is that the health of this joint is closely linked to the position of the head and neck. Poor posture — particularly forward head posture and rounded shoulders — changes the resting position of the jaw and increases stress on the TMJ disc and muscles.</p><h3>The Posture-TMJ Link</h3><p>When the head shifts forward, the lower jaw drops back relative to the upper jaw. This repositions the condyle within the joint socket and places chronic compressive loads on the TMJ disc. Over time, this leads to clicking, locking, pain with chewing, and even referred ear pain or tinnitus.</p><h3>Physiotherapy for TMJ</h3><p>At Nose Creek, our approach to TMJ discomfort includes cervical manual therapy to restore neck mobility, postural retraining exercises, and jaw-specific mobilization techniques. Combined, these interventions address both the local joint dysfunction and the upstream postural drivers that perpetuate it.</p>',
  '/images/blog/neck-upper-back-posture-jaw-function-tmj-discomfort.jpg',
  'Blair Schachterle',
  'Neck & Head',
  '["TMJ","Posture","Neck Pain","Jaw Pain","Physiotherapy"]'::jsonb,
  '2026-05-07T09:00:00Z',
  '4 min read',
  '["navigating-shoulder-muscle-strain-recovery-calgary-north","neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision-calgary-north"]'::jsonb,
  '{"title":"Posture & TMJ Pain | Nose Creek Physiotherapy Calgary","description":"Forward head posture can directly cause TMJ discomfort. Learn how physiotherapy addresses both posture and jaw dysfunction for lasting relief.","ogTitle":"How Posture Causes TMJ Pain | Nose Creek Physiotherapy","ogDescription":"Poor posture and rounded shoulders alter jaw mechanics and fuel TMJ pain. Discover a whole-chain physio approach.","ogImage":"/images/blog/neck-upper-back-posture-jaw-function-tmj-discomfort.jpg"}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content;
INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image, author, category, tags, published_at, reading_time, related_posts, seo, is_published)
VALUES (
  'post-4',
  'how-custom-orthotics-relieve-foot-knee-back-pain',
  'How Custom Orthotics Relieve Foot, Knee & Lower Back Pain',
  'Foot misalignment ripples upward into the knees, hips, and lower back. Discover how custom orthotics restore full-body alignment naturally.',
  '<p>Your feet are the foundation of your entire kinetic chain. When arches collapse or excessive pronation occurs, the inward rotation cascades directly into your shins, knees, and pelvis. This misalignment is one of the most underdiagnosed causes of chronic lower back and hip discomfort in Calgary adults.</p><h3>Why Generic Insoles Fall Short</h3><p>Over-the-counter insoles provide cushioning, but they cannot correct asymmetrical biomechanical deficits. Custom orthotics are molded to your exact foot structure following a dynamic gait assessment, providing targeted support where your feet need it most.</p><h3>Benefits for Active Lifestyles</h3><p>Whether you''re running on Calgary pathways, standing for long shifts, or recovering from plantar fasciitis, custom orthotics redistribute pressure and reduce repetitive impact forces across your joints.</p>',
  '/images/clinic/reception-three.jpg',
  'Blair Schachterle',
  'Orthotics & Foot Care',
  '["Custom Orthotics","Foot Pain","Knee Pain","Back Pain","Biomechanics"]'::jsonb,
  '2026-04-28T09:00:00Z',
  '4 min read',
  '["navigating-shoulder-muscle-strain-recovery-calgary-north","neck-upper-back-posture-jaw-function-tmj-discomfort"]'::jsonb,
  '{"title":"Custom Orthotics for Pain Relief | Nose Creek Physiotherapy Calgary","description":"Discover how custom orthotics correct foot alignment and alleviate knee, hip, and lower back pain naturally.","ogTitle":"Custom Orthotics for Pain Relief | Nose Creek Physiotherapy","ogDescription":"Learn how custom orthotics support your kinetic chain and relieve chronic joint pain.","ogImage":"/images/clinic/reception-three.jpg"}'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content;

-- 7. Testimonials
INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  'review-1',
  'David Miller',
  'Blair and the entire team at Nose Creek Physiotherapy are absolute miracle workers. After months of debilitating lower back and sciatica pain, Blair identified the root cause in minutes. Within 4 sessions of manual therapy and IMS, I was completely pain-free and back to jogging.',
  5,
  'Google',
  '1 week ago',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  'review-2',
  'Christine Lewis',
  'I have been seeing Rizelle for orthopaedic and neck physiotherapy. She is compassionate, extraordinarily knowledgeable, and explains every exercise clearly. The front desk staff at the Beddington clinic are always welcoming and direct billing is completely seamless.',
  5,
  'Google',
  '2 weeks ago',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  'review-3',
  'Robert Kowalski',
  'Hands down the best physiotherapy clinic in Calgary! Samuel and Blair helped me recover from a severe rotator cuff tear without needing surgery. Their hands-on joint mobilization and active strengthening plan gave me full shoulder range back.',
  5,
  'Google',
  '3 weeks ago',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  'review-4',
  'Priya Sharma',
  'I came to Nose Creek after a motor vehicle accident with severe whiplash and upper back pain. They handled all my MVA auto insurance claims directly so I could just focus on healing. Exceptional, attentive care from day one.',
  5,
  'Google',
  '1 month ago',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  'review-5',
  'Michael Brennan',
  'Janvi and the team are fantastic! Friendly reception, very clean facility in the Beddington Co-op mall, and they are always on time for appointments. My chronic knee stiffness improved dramatically after just 3 visits.',
  5,
  'Google',
  '1 month ago',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  'review-6',
  'Angela Tremblay',
  'Dr. Alex and Blair provided top-tier care for my chronic sciatic pain. I had tried several other clinics with little relief, but Nose Creek''s combination of dry needling, chiropractic adjustments, and core retraining actually solved the problem.',
  5,
  'Google',
  '2 months ago',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
