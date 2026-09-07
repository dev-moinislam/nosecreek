const fs = require("fs");
const path = require("path");

const servicesPath = path.join(__dirname, "../src/data/services.json");
const existingServices = JSON.parse(fs.readFileSync(servicesPath, "utf8"));

// Keep pelvic-health from existing
const pelvicHealth = existingServices.find(s => s.id === "pelvic-health");

const updatedServices = [
  {
    id: "physiotherapy",
    slug: "physiotherapy",
    title: "Physiotherapy",
    shortDescription: "Expert hands-on registered physiotherapy to restore mobility, correct muscle imbalances, and get you moving faster — pain free.",
    description: "At Nose Creek Physiotherapy in Calgary North, we provide premium, one-to-one physiotherapy care. Whether you are dealing with chronic spinal soreness, recovering from a sports injury, motor vehicle collision (MVC), or workplace injury (WCB), our licensed physical therapists reveal the root cause and design a customized rehabilitation and prevention plan.",
    heroImage: "/images/clinic/reception-desktop.jpg",
    sideImage: "/images/clinic/reception-four.jpg",
    iconType: "heart-pulse",
    iconBg: "#e9f5fb",
    iconColor: "#1c9fd8",
    ctaText: "Book Your Physio Appointment →",
    ctaMuted: false,
    benefits: [
      "Targeted joint mobilization & manipulation to restore restricted spinal and peripheral movement",
      "Corrects muscle imbalances through specialized strengthening and lengthening exercise protocols",
      "Neural mobilization techniques to restore mobility and function to impinged or sensitized nerves",
      "Muscle Stimulation Current (NMES) to reduce atrophy and reboot inhibited nerves after injury",
      "Direct billing available for Private Extended Health, MVC, WCB, and Alberta Health Services (AHS)",
      "Individualized home and workplace prevention strategies to protect against re-injury"
    ],
    symptoms: [
      "Lower back pain, sciatica, spinal stenosis, and postural strain",
      "Neck pain, whiplash, and persistent cervicogenic headaches",
      "Shoulder impingement, rotator cuff tears, and frozen shoulder",
      "Knee pain, meniscus tears, hip stiffness, and arthritis",
      "Sports injuries, ligament sprains, tendonitis, and joint dysfunction",
      "Post-fracture rehabilitation and post-surgical mobility challenges"
    ],
    treatmentApproach: [
      "Thorough orthopaedic assessment and biomechanical movement analysis",
      "Hands-on joint mobilization, spinal manipulation, and soft tissue release",
      "Intramuscular Stimulation (IMS / Dry Needling) and neural glide therapy",
      "Targeted progressive exercise rehabilitation and functional movement retraining"
    ],
    customSections: [
      {
        id: "clinical-assessment-and-nerve-treatment",
        eyebrow: "Evidence-Based Rehabilitation",
        eyebrowColor: "#6faf1c",
        title: "Targeted Joint Mobilization & Neural Glide Treatment",
        subtitle: "Restoring nerve mobility, joint mechanics, and muscle balance from the spine to your extremities.",
        content: "When you meet with your Nose Creek Physiotherapist, we begin by identifying reduced mobility or stiffness in your joints, followed by gentle manual mobilization or manipulation. For pinched or sensitized nerves, we measure nerve mobility from your spinal cord to your muscles and apply specialized neural mobilization techniques to eliminate radiating symptoms and restore normal function.",
        bullets: [
          "Precise joint mobilization and manipulation to unlock restricted motion",
          "Nerve glide mobilization for pinched, trapped, or sensitized nerve pathways",
          "Correction of muscle imbalances with targeted strengthening and lengthening",
          "Muscle Stimulation Current to reboot inhibited muscles after acute trauma"
        ],
        image: "/images/clinic/reception-four.jpg",
        imageAlt: "Physiotherapist performing manual joint mobilization",
        imagePosition: "right",
        background: "white",
        ctaText: "Book Your Physio Assessment Online →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      },
      {
        id: "four-patient-pathways",
        eyebrow: "Seamless Care & Direct Billing",
        eyebrowColor: "#1c9fd8",
        title: "Physiotherapy Coverage Tailored to 4 Patient Pathways",
        subtitle: "Direct billing to private insurance, motor vehicle accident claims, and public health.",
        content: "Receiving treatment should never feel like a hassle. You only need to make one call to get your therapy started. Say goodbye to corresponding back and forth among separate practices. We coordinate directly with your insurers so you can focus entirely on healing.",
        bullets: [
          "Private Extended Health Benefits (Direct billing to Sun Life, Canada Life, Manulife, Blue Cross, etc.)",
          "Motor Vehicle Collision (MVC) claims (Auto insurance covered care from day one)",
          "Alberta Health Services (AHS publicly funded care for fractures, post-surgery, and low income)",
          "Workers' Compensation Board (WCB fast-tracked workplace injury rehabilitation)"
        ],
        image: "/images/clinic/clinic-mobile.jpg",
        imageAlt: "Nose Creek Physiotherapy Clinic North Calgary",
        imagePosition: "left",
        background: "light",
        ctaText: "Check Your Coverage & Availability →",
        ctaHref: "/contact"
      }
    ],
    faqs: [
      {
        question: "What can I expect during my first physiotherapy treatment session?",
        answer: "Your initial session includes a comprehensive orthopaedic evaluation where your physiotherapist assesses joint mobility, nerve function, muscle balance, and biomechanics. You will receive hands-on treatment on day one, followed by a personalized rehabilitation roadmap and home exercises."
      },
      {
        question: "How long does each physiotherapy visit last?",
        answer: "Initial assessments typically last 45 to 60 minutes. Subsequent treatment sessions generally range from 30 to 45 minutes, depending on the modalities and active exercises prescribed in your plan."
      },
      {
        question: "Do I need a doctor's referral to see a physiotherapist?",
        answer: "No. In Alberta, you do not need a physician's referral to see a licensed physiotherapist. You can book an appointment directly with our clinic. (Some private extended health insurance policies may request a referral for reimbursement)."
      },
      {
        question: "Can my extended health insurance cover physiotherapy treatments?",
        answer: "Yes! Physiotherapy is covered by almost all extended healthcare insurance plans, WCB workplace claims, and auto insurance policies. We offer direct billing to make your care seamless and stress-free."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["massage-therapy", "shockwave-therapy", "acupuncture", "chiropractic"],
    relatedConditions: ["back-pain", "knee-pain", "neck-shoulder-pain"],
    teamMembers: ["blair-schachterle", "rizelle-manzano", "madelyne-agius"],
    locations: ["nose-creek-clinic"],
    testimonials: ["review-1"],
    seo: {
      title: "Physiotherapy Calgary North | Nose Creek Physiotherapy",
      ogTitle: "Registered Physiotherapy Services | Calgary North",
      description: "Expert hands-on physiotherapy in Calgary North. Joint mobilization, nerve glide therapy, and muscle stimulation with direct billing.",
      ogDescription: "Restore mobility, strength, and balance naturally with our certified Calgary physiotherapists."
    }
  },
  {
    id: "massage-therapy",
    slug: "massage-therapy",
    title: "Massage Therapy",
    shortDescription: "Experience a new kind of 'Happy Hour' — melt away knots, unlock stubborn muscle tension, and restore energy with 2200-hour Registered Massage Therapists.",
    description: "Our busy chaotic lives leave most of us feeling stressed out, tense, and longing for a good night's sleep. At Nose Creek Physiotherapy in Calgary North, our 2200-hour Registered Massage Therapists (RMTs) deliver therapeutic, deep tissue, and relaxation massage that literally 'squeezes out' every last ounce of stress and tension from your body.",
    heroImage: "/images/clinic/reception-four.jpg",
    sideImage: "/images/clinic/reception-three.jpg",
    iconType: "sparkles",
    iconBg: "#eef6e4",
    iconColor: "#6faf1c",
    ctaText: "Book Your Massage Online →",
    ctaMuted: false,
    benefits: [
      "Deep hands-on soft tissue release to melt knots and chronic muscular adhesions",
      "Stimulates blood circulation, lymphatic drainage, and cellular recovery",
      "Reduces physical stress hormones, eases anxiety, and restores restful sleep",
      "Relieves persistent tension headaches, TMJD jaw discomfort, and neck tightness",
      "Graduates of accredited 2200-hour Alberta massage therapy programs",
      "Direct billing to all major extended health insurance plans"
    ],
    symptoms: [
      "Tight and tense muscles preventing true relaxation and deep sleep",
      "Chronic stress, irritability, and nagging mental/physical fatigue",
      "Frequent tension headaches and neck/upper shoulder stiffness",
      "Repetitive strain injuries (RSI) from desk work and computer ergonomics",
      "Sports and athletic overuse injuries, hamstring tightness, and calf cramps",
      "Pregnancy-related lower back, hip, and pelvic girdle discomfort"
    ],
    treatmentApproach: [
      "Targeted physical consultation to identify muscle spasms and fascial restrictions",
      "Customized blend of deep tissue therapy, trigger point release, and Swedish techniques",
      "Specialized modalities including Cupping Therapy, Hot Stone, and Sports Massage",
      "Self-care guidance on hydration, stretching, and postural maintenance"
    ],
    customSections: [
      {
        id: "therapeutic-modalities",
        eyebrow: "Comprehensive Clinical Massage",
        eyebrowColor: "#6faf1c",
        title: "Diverse Techniques Tailored to Your Recovery",
        subtitle: "From Deep Tissue and Cupping to Sports and Pre/Post Natal therapy.",
        content: "Massage therapy is not just a luxury; it is a time-tested clinical pathway to optimal health. In Alberta, all our therapists have graduated from 2200-hour accredited programs. Because massage works best as part of an integrated recovery plan, our RMTs collaborate with our physiotherapists and chiropractors to address the root mechanical cause of your stiffness.",
        bullets: [
          "Relaxation Massage: Gentle techniques to soothe senses and alleviate daily stress",
          "Deep Tissue Massage: Targets inner muscle layers and tendons to relieve chronic pain",
          "Cupping Therapy: Ancient suction therapy to stimulate circulation and fascial glide",
          "Sports Massage: Specialized pre/post event techniques to enhance athletic performance",
          "Pre & Post Natal Massage: Gentle, safe care supporting mothers through pregnancy",
          "Hot Stone & Indian Head Massage: Deep thermal and cranial tension relief"
        ],
        image: "/images/clinic/reception-three.jpg",
        imageAlt: "Registered Massage Therapy treatment room at Nose Creek",
        imagePosition: "right",
        background: "white",
        ctaText: "Book A Massage Treatment Online →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "What is Therapeutic Massage?",
        answer: "Therapeutic massage consists of evidence-based hands-on manipulation of the body's soft tissues—muscles, tendons, ligaments, and fascia. It increases circulation, relieves chronic muscle spasms, improves mobility, and eases the nervous system."
      },
      {
        question: "How is Therapeutic Massage different from a Relaxation Massage?",
        answer: "While relaxation massage focuses on gentle stress relief, therapeutic massage specifically targets musculoskeletal dysfunction, chronic knots, trigger points, and postural strain to correct the underlying cause of pain."
      },
      {
        question: "Who can benefit from Therapeutic Massage?",
        answer: "Anyone suffering from chronic stress, tight/achy muscles, tension headaches, sports injuries, pregnancy discomfort, or repetitive strain from desk jobs. It is also ideal for proactive injury prevention."
      },
      {
        question: "How often should I get a massage?",
        answer: "For acute pain or injury recovery, weekly or bi-weekly sessions are common. Once acute symptoms subside, many clients maintain a monthly session as a wellness plan to prevent stiffness from returning."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "chiropractic", "acupuncture"],
    relatedConditions: ["neck-shoulder-pain", "back-pain"],
    teamMembers: ["katie-luu", "shawn-gille", "amalia", "smita-nagpal", "jihan-shayya"],
    locations: ["nose-creek-clinic"],
    testimonials: ["review-2"],
    seo: {
      title: "Massage Therapy Calgary North | Nose Creek Physiotherapy",
      ogTitle: "Registered Massage Therapy | Calgary NE & NW",
      description: "Relieve tension, melt knots, and reduce stress with 2200-hour Registered Massage Therapists in Calgary North. Direct billing available.",
      ogDescription: "Soothe muscle tension and speed injury recovery with our licensed RMTs in Calgary."
    }
  },
  {
    id: "acupuncture",
    slug: "acupuncture",
    title: "Acupuncture & TCM",
    shortDescription: "Ancient Traditional Chinese Medicine combined with modern anatomy by Dr. Eileen Wei to regulate Qi, relieve chronic pain, and restore balance.",
    description: "Acupuncture is an ancient holistic therapy based on Traditional Chinese Medicine (TCM) meridian theory and modern western medical science. Using hair-thin disposable sterile needles inserted into specific acupoints, our licensed TCM practitioner Dr. Eileen Wei removes blockages in the flow of Qi, regulates chaotic energy, and provides profound relief from chronic pain, stress, and systemic conditions.",
    heroImage: "/images/clinic/clinic-mobile.jpg",
    sideImage: null,
    iconType: "needle",
    iconBg: "#eef6e4",
    iconColor: "#6faf1c",
    ctaText: "Book Acupuncture Session →",
    ctaMuted: false,
    benefits: [
      "Stimulates endorphin release and activates natural neurochemical pain relief",
      "Restores free, smooth flow of vital energy (Qi) through body meridians",
      "Relieves acute and chronic migraines, tension headaches, and neck stiffness",
      "Alleviates digestive disorders including acid reflux, IBS, and bowel irregularities",
      "Supports mental and emotional equilibrium, easing anxiety, depression, and insomnia",
      "Assists in managing women's health concerns, menstrual cramps, and menopausal symptoms"
    ],
    symptoms: [
      "Chronic musculoskeletal pain in back, neck, hips, knees, and joints",
      "Frequent migraines, tension headaches, and facial neuralgia",
      "Sleep disorders, restless leg syndrome, and waking up unrefreshed",
      "High stress, anxiety, emotional burnout, and panic sensations",
      "Allergic reactions, sinus congestion, and systemic inflammation",
      "Digestive bloating, constipation, acid reflux, and metabolic imbalances"
    ],
    treatmentApproach: [
      "Holistic pulse, tongue, and meridian assessment by Dr. Eileen Wei",
      "Insertion of ultra-fine, single-use sterile micro-needles into targeted acupoints",
      "Optional electro-acupuncture or moxibustion to amplify cellular circulation",
      "Relaxing 20–30 minute therapeutic rest in a calm, private room"
    ],
    customSections: [
      {
        id: "channel-theory-explained",
        eyebrow: "Traditional Chinese Medicine",
        eyebrowColor: "#1c9fd8",
        title: "Understanding Qi & Meridian Channel Theory",
        subtitle: "Restoring the free flow of vital life force throughout your body's network.",
        content: "If our body is like a city, then the meridian channels are like roads and pipelines. The flow of energy inside these channels is Qi ('Chee'), the vital life force. Just like a traffic jam causes disturbance across a whole city, a blockage in your channels disrupts the free flow of Qi, manifesting as pain, fatigue, and illness. By placing hair-thin needles at precise acupoints, Dr. Eileen Wei clears these blockages and restores harmony.",
        bullets: [
          "Hair-thin, virtually painless sterile micro-needles",
          "Regulates chaotic Qi caused by physical trauma, emotional stress, or poor diet",
          "Proven clinical support for fibromyalgia, sciatica, and chronic inflammation",
          "Comprehensive whole-body healing addressing both symptoms and root causes"
        ],
        image: "/images/clinic/reception-desktop.jpg",
        imageAlt: "Acupuncture treatment at Nose Creek Physiotherapy",
        imagePosition: "left",
        background: "white",
        ctaText: "Schedule with Dr. Eileen Wei →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "Does Acupuncture Hurt?",
        answer: "Acupuncture needles are hair-thin, so insertion causes little to no discomfort. Most people describe a sensation of mild pressure, warmth, heaviness, or gentle tingling rather than pain. Many patients find the treatment so relaxing that they fall asleep."
      },
      {
        question: "How Often Should I Go For Acupuncture Treatment?",
        answer: "A typical course of acupuncture ranges from 6 to 12 sessions, depending on whether the condition is acute or chronic. Many patients notice significant improvements within their first 3 to 4 visits."
      },
      {
        question: "Is acupuncture covered by extended health insurance in Alberta?",
        answer: "Yes! Acupuncture provided by our licensed Traditional Chinese Medicine practitioner is covered by almost all extended health benefits plans, and we offer direct billing."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "massage-therapy", "chiropractic"],
    relatedConditions: ["neck-shoulder-pain", "back-pain"],
    teamMembers: ["dr-eileen-wei", "blair-schachterle"],
    locations: ["nose-creek-clinic"],
    testimonials: [],
    seo: {
      title: "Acupuncture Calgary North | Nose Creek Physiotherapy",
      ogTitle: "TCM Acupuncture & Pain Relief | Calgary NE & NW",
      description: "Traditional Chinese Medicine acupuncture by Dr. Eileen Wei in Calgary North. Effective relief for chronic pain, migraines, insomnia, and stress.",
      ogDescription: "Ease chronic pain, headaches, and muscle tension with licensed acupuncture care in Calgary."
    }
  },
  {
    id: "chiropractic",
    slug: "chiropractic",
    title: "Chiropractic Care",
    shortDescription: "Non-invasive, drug-free spinal adjustments and extremity care by Dr. Alex Toutant to restore spinal alignment, optimize nervous system function, and relieve pain.",
    description: "At Nose Creek Physiotherapy in Calgary North, our chiropractic care focuses on the vital relationship between your spine, nervous system, and musculoskeletal health. Dr. Alex Toutant combines gentle spinal manipulations, soft tissue mobilization, cupping, and active rehabilitation to help you move faster, reduce joint stiffness, and live an active, medication-free life.",
    heroImage: "/images/clinic/reception-desktop.jpg",
    sideImage: "/images/clinic/reception-three.jpg",
    iconType: "shield",
    iconBg: "#e9f5fb",
    iconColor: "#1c9fd8",
    ctaText: "Book Chiropractic Session →",
    ctaMuted: false,
    benefits: [
      "Precision spinal adjustments to restore proper vertebral alignment and nerve conduction",
      "Accelerates recovery from sports injuries, motor vehicle accidents, and chronic desk strain",
      "Improves range of motion, flexibility, and overall functional mobility",
      "Combines adjustments with active release therapy, cupping, and acupuncture",
      "Proactive wellness care and routine checkups to prevent future injury recurrence",
      "Complete initial clinical exam: medical history, orthopaedic testing, and referral review"
    ],
    symptoms: [
      "Lower back pain, sciatica, and sacroiliac (SI) joint dysfunction",
      "Neck pain, upper back tension, and postural forward head carriage",
      "Extremity joint stiffness in shoulders, hips, and knees",
      "Tension headaches and cervicogenic migraines originating in the neck",
      "Chronic muscle tightness resistant to conventional stretching",
      "Desk posture strain, computer slouch, and repetitive occupational aches"
    ],
    treatmentApproach: [
      "Comprehensive orthopaedic, neurological, and physical assessment",
      "Targeted spinal and extremity manipulations and mobilizations",
      "Myofascial cupping, soft tissue therapies, and active release",
      "Postural coaching, ergonomic advice, and functional movement exercises"
    ],
    customSections: [
      {
        id: "proactive-wellness-care",
        eyebrow: "Proactive vs. Reactive Care",
        eyebrowColor: "#6faf1c",
        title: "Stay Active: Don't Sit on the Sidelines of Life",
        subtitle: "Routine clinical tune-ups to keep you functioning at your absolute best.",
        content: "We believe in proactive care to keep you functioning optimally rather than treating issues only after they flare up. Once you achieve your higher level of function, routine check-ups throughout the year maintain that quality of life. You worked hard to get pain-free—we want you to stay active, play with your grandchildren, and participate fully with your friends.",
        bullets: [
          "Spinal manipulations & mobilizations to ensure fluid biomechanics",
          "Cupping therapy & targeted soft tissue release to decongest fascia",
          "Integrative modalities combining chiro with physiotherapy and massage",
          "Doctors of Chiropractic with 7+ years of accredited clinical education"
        ],
        image: "/images/clinic/reception-three.jpg",
        imageAlt: "Chiropractor Dr. Alex Toutant at Nose Creek Physiotherapy",
        imagePosition: "right",
        background: "white",
        ctaText: "Book Your Chiropractic Assessment →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "What is Chiropractic Care?",
        answer: "Chiropractic care is a non-invasive, drug-free treatment option focusing on the spine, musculoskeletal system, and nervous system. Chiropractors use precise adjustments and soft tissue techniques to restore mobility, reduce pain, and improve overall body function."
      },
      {
        question: "Can Chiropractic Care Prevent Future Injuries?",
        answer: "Yes! By restoring proper joint alignment, correcting muscle imbalances, and optimizing nervous system communication, chiropractic care reduces abnormal mechanical strain and prevents minor compensations from turning into chronic injuries."
      },
      {
        question: "How Often Should I See a Chiropractor?",
        answer: "During active injury rehab, visits may be scheduled 1 to 2 times per week. Once your symptoms resolve, many patients transition to proactive wellness visits every 4 to 6 weeks to keep their spine and joints in optimal condition."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "massage-therapy", "acupuncture"],
    relatedConditions: ["back-pain", "neck-shoulder-pain"],
    teamMembers: ["dr-alex-toutant", "blair-schachterle"],
    locations: ["nose-creek-clinic"],
    testimonials: [],
    seo: {
      title: "Chiropractor Calgary North | Nose Creek Physiotherapy",
      ogTitle: "Chiropractic Care Calgary North | Dr. Alex Toutant",
      description: "Expert chiropractic care by Dr. Alex Toutant in Calgary North. Gentle spinal adjustments, cupping, and active rehabilitation. Direct billing available.",
      ogDescription: "Rediscover your mobility and reduce pain with chiropractic care at Nose Creek."
    }
  },
  {
    id: "shockwave-therapy",
    slug: "shockwave-therapy",
    title: "Shockwave Therapy",
    shortDescription: "State-of-the-art acoustic soundwaves that dissolve calcified tendons, eliminate chronic scar tissue, and kickstart natural cellular healing.",
    description: "Extracorporeal Shockwave Therapy (ESWT) is an aggressive, highly effective non-invasive treatment for chronic musculoskeletal conditions that have persisted for 12 weeks or longer. Delivering high-energy acoustic pulses directly into injured bone, tendon, and muscle tissues, it breaks down calcifications, increases collagen production, and stimulates new micro-capillary blood vessel formation.",
    heroImage: "/images/clinic/reception-three.jpg",
    sideImage: "/images/clinic/reception-desktop.jpg",
    iconType: "zap",
    iconBg: "#e9f5fb",
    iconColor: "#1c9fd8",
    ctaText: "Book Shockwave Session →",
    ctaMuted: false,
    benefits: [
      "Non-surgical, non-invasive alternative to cortisone injections and surgery",
      "Breaks down stubborn calcified fibroblasts and chronic scar tissue build-up",
      "Stimulates neovascularization (new blood vessel growth) and tissue oxygenation",
      "Proven high clinical success for chronic plantar fasciitis and Achilles tendinopathy",
      "No extra fee! Included in our regular private physiotherapy treatment rates",
      "Typically requires only 3 to 6 weekly sessions of 10–15 minutes"
    ],
    symptoms: [
      "Chronic plantar fasciitis and severe morning heel pain",
      "Achilles tendinopathy and patellar tendonitis (jumper's knee)",
      "Calcific tendonitis of the shoulder rotator cuff",
      "Tennis elbow (lateral epicondylitis) and golfer's elbow",
      "Iliotibial Band (ITB) Friction Syndrome and chronic knee aching",
      "Chronic traumatic muscle tears with scar tissue and restricted range of motion"
    ],
    treatmentApproach: [
      "Precise anatomical localization of the chronic injured tendon fibers",
      "Application of acoustic shockwave pulses tailored to your comfort level",
      "Immediate post-treatment manual mobilization and injury-specific stretches",
      "Weekly progression over an average of 6 sessions to trigger tissue remodeling"
    ],
    customSections: [
      {
        id: "how-shockwave-heals",
        eyebrow: "Cellular Regeneration",
        eyebrowColor: "#1c9fd8",
        title: "Hyperaemia, Collagen Synthesis & Neovascularization",
        subtitle: "How acoustic pulses dissolve calcified fibroblasts and trigger tissue repair.",
        content: "Shockwave therapy works by transmitting acoustic pressure pulses via ultrasound gel into stubborn injured tissues. This induces hyperaemia (increased blood flow), stimulates fibroblasts to synthesize fresh collagen, and creates capillary microruptures that spark neovascularization. Over the following days, the body decalcifies chronic deposits and replaces scarred fibers with strong, pliable tissue.",
        bullets: [
          "Eliminates pain by decreasing muscle spasms and pathological actin-myosin binding",
          "Dissolves calcified fibroblasts in chronic rotator cuff and plantar fascia tissues",
          "Accelerates removal of nociceptive metabolites, histamine, and lactic acid",
          "Targets 3 key layers: bone-tendon junctions, small muscles, and deep large muscle groups"
        ],
        image: "/images/clinic/reception-desktop.jpg",
        imageAlt: "Acoustic Radial Shockwave Therapy at Nose Creek",
        imagePosition: "left",
        background: "white",
        ctaText: "Book A Shockwave Consultation →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "What is the cost of Shockwave Therapy at Nose Creek?",
        answer: "We do NOT charge extra for shockwave therapy! It is included as part of our regular private physiotherapy treatment fee. Most of our clients have extended health benefits that we direct bill."
      },
      {
        question: "Is shockwave therapy painful?",
        answer: "You will experience an ache or tapping sensation during treatment, but your physiotherapist works with you to adjust the intensity to your comfort level. It is an active therapy that works between sessions—relief typically develops days later as tissue remodels."
      },
      {
        question: "How many shockwave sessions will I need?",
        answer: "Shockwave is performed once per week. The duration depends on the chronicity of the injury, but the average number of treatments is approximately 6 sessions."
      },
      {
        question: "Who should NOT receive Shockwave Therapy?",
        answer: "Shockwave is not performed on acute injuries under 12 weeks old, pregnant patients, individuals on blood thinners, or those with active thrombosis, tumors, or local corticosteroid injections in the treatment area."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "custom-orthotics", "knee-bracing"],
    relatedConditions: ["foot-pain", "knee-pain", "sports-injury"],
    teamMembers: ["blair-schachterle", "rizelle-manzano"],
    locations: ["nose-creek-clinic"],
    testimonials: [],
    seo: {
      title: "Shockwave Therapy Calgary North | Nose Creek Physiotherapy",
      ogTitle: "Radial Shockwave Therapy Calgary | ESWT",
      description: "Non-invasive shockwave therapy in Calgary North to dissolve calcified tendons and heal plantar fasciitis and tennis elbow. Included in regular physio rates.",
      ogDescription: "Heal stubborn tendon pain and calcifications with acoustic shockwave treatments."
    }
  },
  {
    id: "custom-orthotics",
    slug: "custom-orthotics",
    title: "Custom Orthotics",
    shortDescription: "The Orthotics Group precision-crafted medical shoe inserts to correct foot biomechanics, align your kinetic chain, and relieve heel, knee, and back pain.",
    description: "At Nose Creek Physiotherapy in Calgary North, we carry The Orthotics Group custom orthotics. Your feet are the wheels to your mobility — if you have 'flat tires' or collapsed arches, it causes compensations all the way up through your ankles, knees, hips, and spine. Our computerized gait scanning and 3D digital foot imaging create a perfect custom fit that slips into your everyday footwear.",
    heroImage: "/images/clinic/reception-desktop.jpg",
    sideImage: null,
    iconType: "footprints",
    iconBg: "#e9f5fb",
    iconColor: "#1c9fd8",
    ctaText: "Book Orthotics Appointment →",
    ctaMuted: false,
    benefits: [
      "Proven 34.5% reduction in chronic lower back pain by establishing a symmetrical foundation",
      "Innovative materials absorb heel-strike shock and alleviate plantar fasciitis",
      "Computerized GaitScan and 3D digital foot mapping for a 100% custom anatomical fit",
      "Supports balance from heel to toe, reducing athletic foot fatigue and injury risk",
      "Improves alignment of ankles, knees, hips, and lower back kinetic chain",
      "Guaranteed comfort and durable fit in dress shoes, runners, and work boots"
    ],
    symptoms: [
      "Stabbing heel pain, morning arch tenderness, and plantar fasciitis",
      "Flat feet (fallen arches) or excessive foot pronation/supination",
      "Knee pain, patellofemoral tracking syndrome, and compensatory hip pain",
      "Foot and ankle fatigue after prolonged standing or walking at work",
      "Shin splints, achilles tendonitis, and recurring ankle sprains",
      "Uneven shoe tread wear and lower back ache caused by gait imbalances"
    ],
    treatmentApproach: [
      "Orthopaedic clinical physiotherapy assessment and joint mobility testing",
      "Computerized dynamic GaitScan pressure analysis and 3D foot scan",
      "Custom fabrication by The Orthotics Group specialized laboratories",
      "Complimentary pick-up fitting, footwear review, and stretching education"
    ],
    customSections: [
      {
        id: "the-orthotics-group-advantage",
        eyebrow: "The Orthotics Group",
        eyebrowColor: "#6faf1c",
        title: "Balance, Alignment & Pressure Distribution",
        subtitle: "Repositioning all 26 bones of your feet into optimal alignment with every step.",
        content: "We here at Nose Creek Physiotherapy believe strongly in the health of your feet. Your feet are the wheels to your mobility. Our custom orthotics support the length of your foot from heel to toe, improving your balance, athletic performance, and reducing foot fatigue. By correcting alignment, we alleviate strain on your ankles, knees, hips, and lower back.",
        bullets: [
          "Balance: Supports heel to toe to stabilize normal athletic and daily activity",
          "Alignment: Improves posture and reduces compensatory joint pain in knees and spine",
          "Pressure Distribution: Evenly spreads body weight, eliminating painful pressure hot-spots",
          "Proven Conservative Care: Research shows orthotics reduce lower back pain by 34.5%"
        ],
        image: "/images/clinic/reception-four.jpg",
        imageAlt: "Custom Orthotics GaitScan at Nose Creek Physiotherapy",
        imagePosition: "right",
        background: "white",
        ctaText: "Book Your 3D Foot Scan Online →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "What is included in a custom orthotics assessment?",
        answer: "Your appointment includes a comprehensive orthopaedic clinical exam, computerized GaitScan 3D pressure mapping, digital foot photography, footwear prescription advice, and a complimentary second fitting session."
      },
      {
        question: "Will my extended health insurance cover custom orthotics?",
        answer: "Most extended health benefit plans cover custom orthotics when prescribed by a doctor or qualified practitioner. We provide all official lab documentation, gait scan printouts, and diagnostic paperwork for direct submission."
      },
      {
        question: "How long do custom orthotics last?",
        answer: "High-quality medical orthotics from The Orthotics Group typically last 2 to 4 years, depending on your daily step count, footwear, and activity level."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "shockwave-therapy", "knee-bracing"],
    relatedConditions: ["foot-pain", "knee-pain", "back-pain"],
    teamMembers: ["blair-schachterle"],
    locations: ["nose-creek-clinic"],
    testimonials: [],
    seo: {
      title: "Custom Foot Orthotics Calgary North | Nose Creek Physiotherapy",
      ogTitle: "Custom Foot Orthotics Calgary | The Orthotics Group",
      description: "Computerized 3D foot scanning and custom orthotics in Calgary North. Alleviate heel pain, flat feet, and back pain. Insurance covered.",
      ogDescription: "Restore proper gait and foot alignment with custom-made medical orthotics."
    }
  },
  {
    id: "concussion-clinic",
    slug: "concussion-clinic",
    title: "Concussion Clinic",
    shortDescription: "Shift Concussion certified clinical care in Calgary North — providing clarity, structured assessment, and safe return-to-activity progression.",
    description: "A concussion can leave you feeling uncertain, frustrated, and unsure where to turn next. At Nose Creek Physiotherapy, our Concussion Clinic in Calgary is certified under the Shift Concussion framework. We provide comprehensive multidisciplinary evaluation of neck movement, balance, visual-vestibular function, and cognitive load to guide you safely back to work, school, and sports.",
    heroImage: "/images/clinic/reception-desktop.jpg",
    sideImage: null,
    iconType: "shield",
    iconBg: "#eef6e4",
    iconColor: "#6faf1c",
    ctaText: "Book Concussion Assessment →",
    ctaMuted: false,
    benefits: [
      "Shift Concussion certified evidence-based clinical protocols",
      "Comprehensive evaluation of cervical spine, vestibular-ocular, and balance systems",
      "Structured Return-to-Learn, Return-to-Work, and Return-to-Sport roadmaps",
      "Cervical spine manual therapy to treat whiplash-induced tension headaches",
      "Calm, one-on-one, unrushed appointments with clear reassurance and education",
      "Assistance navigating auto insurance (MVC), WCB, and school accommodation forms"
    ],
    symptoms: [
      "Persistent headaches, neck tension, and dizziness following head or body impact",
      "Difficulty focusing, reading, or tolerating phone, tablet, and computer screens",
      "Brain fog, fatigue, and feeling overwhelmed in noisy or bright environments",
      "Balance instability, nausea, and lightheadedness with rapid head movement",
      "Irritability, mood swings, and sleep disruption following a concussion",
      "Prolonged symptoms lasting weeks or months after a sport injury or car accident"
    ],
    treatmentApproach: [
      "Detailed injury history and daily symptom behavior analysis",
      "Cervical spine movement, joint mobility, and suboccipital tension testing",
      "Vestibular-Ocular screening (visual tracking, gaze stability, and saccades)",
      "Individualized symptom-guided active rehabilitation and pacing routines"
    ],
    customSections: [
      {
        id: "shift-concussion-approach",
        eyebrow: "Shift Concussion Certified",
        eyebrowColor: "#1c9fd8",
        title: "Clarity, Structure & Active Recovery",
        subtitle: "Why rest alone is not enough — safe, structured progression tailored to you.",
        content: "A concussion is a mild traumatic brain injury caused by a force to the head or body that disrupts how brain systems function. Without guidance, many people fall into one of two traps: pushing too hard and flaring symptoms, or avoiding activity altogether out of fear. Both prolong recovery. At our Calgary clinic, we evaluate your vision, balance, neck movement, and activity tolerance to establish a safe, progressive recovery plan.",
        bullets: [
          "Certified Shift Concussion management framework",
          "One-on-one appointments focused on explanation, education, and reassurance",
          "Targeted exercises for neck stiffness and dizziness triggers",
          "Evidence-based strategies for gradual screen and reading tolerance"
        ],
        image: "/images/clinic/clinic-mobile.jpg",
        imageAlt: "Concussion rehabilitation at Nose Creek Physiotherapy Calgary",
        imagePosition: "left",
        background: "white",
        ctaText: "Book A Concussion Assessment Online →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "How long do concussion symptoms usually last?",
        answer: "While many concussions resolve within 2 to 4 weeks with proper management, some individuals experience symptoms that last for months. Early structured assessment helps avoid chronic symptom cycles and speeds your safe return to life."
      },
      {
        question: "Can I exercise if I still have concussion symptoms?",
        answer: "Complete dark-room rest is no longer recommended. Sub-symptom threshold exercise—such as light walking or stationary cycling—promotes healthy blood flow and speeds brain recovery, provided it is guided by a certified concussion clinician."
      },
      {
        question: "Is it normal for concussion symptoms to change day to day?",
        answer: "Yes, concussion recovery is rarely a straight line. Environmental stimulation, cognitive load, screen exposure, and fatigue can cause temporary symptom spikes. Our clinicians teach you pacing strategies to manage these fluctuations."
      },
      {
        question: "What if my concussion happened months ago?",
        answer: "You do not need to have been recently injured to benefit from care. If you are experiencing lingering post-concussion headaches, neck tightness, or brain fog months after an injury, a structured assessment can identify which physical systems need rehabilitation."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "chiropractic", "massage-therapy"],
    relatedConditions: ["neck-shoulder-pain"],
    teamMembers: ["blair-schachterle", "rizelle-manzano"],
    locations: ["nose-creek-clinic"],
    testimonials: [],
    seo: {
      title: "Concussion Clinic Calgary North | Nose Creek Physiotherapy",
      ogTitle: "Shift Concussion Certified Clinic | Calgary NE & NW",
      description: "Evidence-based concussion rehabilitation in Calgary North. Certified Shift Concussion care for sports injuries, whiplash, and lingering post-concussion symptoms.",
      ogDescription: "Clarity, guidance, and structured progression for concussion recovery in Calgary."
    }
  },
  {
    id: "knee-bracing",
    slug: "knee-bracing",
    title: "Custom Knee Bracing",
    shortDescription: "Premier Spring Loaded OA knee brace fittings in Calgary North — patented liquid spring technology that offloads up to 45 lbs of joint pressure for pain-free mobility.",
    description: "At Nose Creek Physiotherapy, we provide custom fittings for the revolutionary Spring Loaded OA Knee Brace. Unlike traditional unloader braces that only address single-compartment arthritis, Spring Loaded technology offloads the entire knee joint — including patellofemoral OA and multicompartmental OA. By absorbing impact during bending and assisting extension, it makes climbing stairs, squatting, and walking pain-free.",
    heroImage: "/images/clinic/reception-four.jpg",
    sideImage: null,
    iconType: "shield",
    iconBg: "#eef6e4",
    iconColor: "#6faf1c",
    ctaText: "Book Knee Brace Fitting →",
    ctaMuted: false,
    benefits: [
      "Patented liquid spring mechanism absorbs joint shock during knee flexion and assists extension",
      "Reduces patellofemoral and tibiofemoral joint contact forces by 30% to 50%",
      "Provides up to 45 lbs of static joint offloading — equivalent to losing 22.5% of body weight",
      "Tackles multicompartmental OA and patellofemoral OA where traditional single-side unloader braces fail",
      "University of Calgary tested: significantly lower quadriceps muscle effort and reduced pain",
      "Adjustable Power Dial allows you to customize the level of assistance anytime on the fly"
    ],
    symptoms: [
      "Severe knee pain and stiffness when climbing or descending stairs",
      "Difficulty rising from a chair (sit-to-stand) or squatting down",
      "Multicompartment osteoarthritis affecting both patellofemoral and tibiofemoral joints",
      "Persistent quadriceps weakness and knee instability after Total Knee Replacement (TKR)",
      "Meniscus tears, ligament instability (ACL, MCL), or post-operative knee recovery",
      "Desire to ski, hike, and stay active without debilitating knee pain"
    ],
    treatmentApproach: [
      "Clinical knee joint evaluation, ligament stability testing, and range-of-motion scan",
      "Precision measurement of leg circumference and biomechanical joint angle calibration",
      "Custom fitting, strap adjustment, and hands-on walking/stair trial in the clinic",
      "Integration with knee-strengthening physiotherapy to rebuild quad and hip stability"
    ],
    customSections: [
      {
        id: "spring-loaded-technology",
        eyebrow: "Patented Biomechanical Innovation",
        eyebrowColor: "#6faf1c",
        title: "Spring Loaded OA: Weight-Loss-Level Knee Offloading",
        subtitle: "Up to 45 lbs of joint contact force reduction for multicompartment and kneecap arthritis.",
        content: "Approximately 68% of knee osteoarthritis cases involve either the patellofemoral joint or multiple compartments, where traditional single-sided unloader braces fail. The Spring Loaded OA brace features patented liquid spring packs mounted on a lightweight carbon-composite frame. As you bend your knee to descend stairs or squat, the springs absorb joint forces by up to 50%; as you straighten, they return that energy to lift your body weight with minimal quad strain.",
        bullets: [
          "Reduces knee joint contact forces comparable to losing 45 pounds of body weight",
          "University of Calgary validated: significantly lower quad effort & lower pain scores",
          "Adjustable Power Dial to dial in extra spring assistance for hiking, stairs, or skiing",
          "Lightweight, low-profile frame that rests on the back of your leg without slipping"
        ],
        image: "/images/clinic/reception-desktop.jpg",
        imageAlt: "Spring Loaded Knee Brace Fitting in Calgary",
        imagePosition: "right",
        background: "white",
        ctaText: "Schedule A Knee Brace Trial →",
        ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
      }
    ],
    faqs: [
      {
        question: "How Does the Spring Loaded OA Knee Brace Work?",
        answer: "Liquid springs within the Spring Pack compress as you bend your knee, absorbing heavy joint contact forces. When you extend your leg, the springs release this stored energy, assisting your quadriceps muscles and propelling you upward with significantly less pain."
      },
      {
        question: "What Makes the Spring Loaded OA Different From Other Knee Braces?",
        answer: "Traditional unloader braces only address isolated medial or lateral compartment osteoarthritis (representing only ~32% of cases). The Spring Loaded brace offloads both patellofemoral and tibiofemoral compartments across the entire joint, making it the only brace capable of tackling multicompartmental OA."
      },
      {
        question: "Is the Spring Loaded OA Knee Brace Customizable?",
        answer: "Yes! Our certified physiotherapists take precise anatomical measurements of your thigh, calf, and joint line to ensure a custom, secure fit that won't slip during skiing, hiking, or daily walking."
      },
      {
        question: "Is custom knee bracing covered by extended health insurance?",
        answer: "Yes, many extended healthcare plans cover custom knee bracing when prescribed by a physician or orthopaedic specialist. We provide all necessary technical documentation and prescription paperwork for insurance reimbursement."
      }
    ],
    hiddenSections: [],
    sectionOrder: [
      "hero",
      "at_a_glance",
      "clinical_overview",
      "custom_sections",
      "benefits",
      "symptoms",
      "treatment_approach",
      "team_carousel",
      "faqs",
      "location_map",
      "decision_ctas",
      "bottom_cta"
    ],
    relatedServices: ["physiotherapy", "custom-orthotics", "shockwave-therapy"],
    relatedConditions: ["knee-pain", "sports-injury"],
    teamMembers: ["blair-schachterle"],
    locations: ["nose-creek-clinic"],
    testimonials: [],
    seo: {
      title: "Custom Knee Bracing Calgary North | Spring Loaded OA",
      ogTitle: "Spring Loaded Knee Bracing | Calgary NE & NW",
      description: "Custom Spring Loaded OA knee brace fittings in Calgary North. Offload up to 45 lbs of knee joint pressure for multicompartment osteoarthritis.",
      ogDescription: "Protect your knees, reduce osteoarthritis pain, and return to sports with custom bracing."
    }
  }
];

if (pelvicHealth) {
  updatedServices.push(pelvicHealth);
}

fs.writeFileSync(servicesPath, JSON.stringify(updatedServices, null, 2), "utf8");
console.log(`Successfully updated services.json with ${updatedServices.length} services!`);
