"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CustomPage, FAQItem, SectionBlockConfig, ServiceCustomSection } from "@/types/content";
import { getCustomPages, getTeamMembers } from "@/lib/api";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SectionBlockCustomizerModal from "@/components/admin/SectionBlockCustomizerModal";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import AdminImageUploader from "@/components/admin/AdminImageUploader";
import CustomPageLiveView, { defaultCustomPageSectionOrder, getDefaultCustomPageOrder } from "@/components/content/CustomPageLiveView";
import {
  GlobeIcon,
  SearchIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  SlidersIcon,
  CheckIcon,
  XIcon,
  ExternalLinkIcon
} from "@/components/admin/AdminIcons";

// Pre-defined Calgary neighborhood presets for quick 1-click creation
const NEIGHBORHOOD_PRESETS = [
  {
    name: "Thorncliffe",
    slug: "thorncliffe-physiotherapy",
    title: "Physiotherapy in Thorncliffe Calgary | Nose Creek Physiotherapy",
    subtitle: "Personalized, Compassionate Physical Rehabilitation Just Minutes From Thorncliffe",
    badge: "Thorncliffe & North Calgary Physiotherapy",
    description: "<p>If you live or work in <strong>Thorncliffe, Calgary</strong> and are suffering from back pain, neck stiffness, sports injuries, or joint discomfort, <strong>Nose Creek Physiotherapy</strong> is your trusted neighborhood rehabilitation clinic.</p><p>Located just moments away at Beddington Towne Centre, our team of licensed physical therapists, chiropractors, and massage therapists provide one-on-one, hands-on treatment designed to resolve the root cause of your pain—not just mask the symptoms.</p>",
    descriptionCol2: "<h3>Why Thorncliffe Residents Choose Nose Creek Physio</h3><ul><li><strong>Fast, Convenient Access:</strong> Only a 4-minute drive from Thorncliffe with abundant free plaza parking.</li><li><strong>Direct Insurance Billing:</strong> We bill directly to over 25 major health insurance providers (Blue Cross, Sun Life, Manulife, Canada Life, and more).</li><li><strong>Experienced Clinicians:</strong> Over 23 years of clinical excellence with FCAMPT advanced manual therapy credentials.</li><li><strong>Evening & Saturday Appointments:</strong> Flexible scheduling before or after your workday.</li></ul>",
    benefits: [
      "Direct Billing to 25+ Major Insurers",
      "Only 4 Minutes North via Centre Street",
      "Free Dedicated Plaza Parking Outside Doors",
      "FCAMPT Certified Manual Therapists",
      "Extended Early Morning & Evening Hours",
      "No Doctor Referral Required for Care"
    ],
    symptoms: [
      "Lower Back Pain & Sciatica",
      "Neck Stiffness & Whiplash Recovery",
      "Shoulder Impingement & Rotator Cuff",
      "Knee Pain & Runner's Knee",
      "Sports Injuries & Ankle Sprains",
      "Post-Surgical Joint Rehabilitation"
    ],
    treatmentApproach: [
      "Comprehensive 60-Minute Assessment: Thorough orthopaedic examination to uncover mechanical root causes.",
      "Hands-On Manual Therapy: Joint mobilization and soft-tissue release for rapid, natural pain relief.",
      "Individualized Active Rehabilitation: Customized strengthening and functional movement roadmap.",
      "Self-Management & Long-Term Prevention: Posture retraining and home exercise guidance for lasting wellness."
    ],
    faqs: [
      {
        question: "How far is Nose Creek Physiotherapy from Thorncliffe?",
        answer: "We are located at Beddington Towne Centre (#22, 8120 Beddington Blvd NW), which is approximately a 4-minute drive north from Thorncliffe via Centre Street N."
      },
      {
        question: "Do I need a doctor's referral for physiotherapy in Thorncliffe?",
        answer: "No. In Alberta, you have direct access to physiotherapy without requiring a physician's referral, though some private health insurance plans may require one for reimbursement."
      },
      {
        question: "Do you offer direct billing for Thorncliffe patients?",
        answer: "Yes, we direct bill to all major extended health insurance providers, as well as Alberta Blue Cross, WCB for workplace injuries, and auto insurance for motor vehicle accidents."
      }
    ]
  },
  {
    name: "Huntington Hills",
    slug: "huntington-hills-physiotherapy",
    title: "Physiotherapy in Huntington Hills Calgary | Nose Creek Physiotherapy",
    subtitle: "Evidence-Based Physiotherapy & Chiropractic Care Serving Huntington Hills Residents",
    badge: "Huntington Hills & North Calgary Care",
    description: "<p>Residents of <strong>Huntington Hills</strong> seeking top-tier physiotherapy, sports injury rehabilitation, or chronic pain relief have relied on <strong>Nose Creek Physiotherapy</strong> since 2001.</p><p>Whether you're recovering from a workplace injury, preparing for surgery, dealing with sciatica, or looking to regain your mobility, our multidisciplinary team provides personalized care tailored to your unique goals.</p>",
    descriptionCol2: "<h3>Comprehensive Care for Huntington Hills Patients</h3><ul><li><strong>Spinal & Joint Care:</strong> Targeted relief for lower back pain, sciatica, neck stiffness, and whiplash.</li><li><strong>Sports Rehabilitation:</strong> Evidence-informed therapy for runners, hockey players, soccer athletes, and weekend warriors.</li><li><strong>No Waitlists:</strong> Same-week and next-day appointment availability so you can start recovering immediately.</li><li><strong>Direct Billing:</strong> Instant claims processing for minimal out-of-pocket hassle.</li></ul>",
    benefits: [
      "Direct Billing for Huntington Hills Families",
      "Steps Away via 4th St NW or Beddington Blvd",
      "Multidisciplinary Team of PTs, DCs & RMTs",
      "Modern Modalities: Shockwave & IMS Dry Needling",
      "Open Early Mornings & Saturdays",
      "One-on-One Personalized Attention"
    ],
    symptoms: [
      "Spinal Disc Herniations & Sciatica",
      "Neck & Upper Back Postural Strain",
      "Tennis & Golfer's Elbow",
      "Hip Impingement & Knee Osteoarthritis",
      "Workplace WCB & Motor Vehicle Injuries",
      "Foot Pain & Plantar Fasciitis"
    ],
    treatmentApproach: [
      "In-Depth Biomechanical & Spinal Assessment: Detailed evaluation of spinal posture, nerve health, and joint mobility.",
      "Targeted Soft Tissue Release & Joint Therapy: Hands-on manual therapy and decompression to relieve localized inflammation.",
      "Neuromuscular Re-education: Active therapeutic exercises to rebuild stabilizer strength and coordination.",
      "Ergonomic & Lifestyle Guidance: Practical workstation and posture adjustments for sustained wellness."
    ],
    faqs: [
      {
        question: "How close is your clinic to Huntington Hills?",
        answer: "We are located right next to Huntington Hills at Beddington Towne Centre, just 2-3 minutes away via 4th Street NW or Beddington Blvd."
      },
      {
        question: "What therapies do you offer for Huntington Hills residents?",
        answer: "Our services include manual therapy, therapeutic exercise prescription, intramuscular stimulation (IMS / dry needling), massage therapy, chiropractic adjustments, custom orthotics, and shockwave therapy."
      }
    ]
  },
  {
    name: "MacEwan",
    slug: "macewan-physiotherapy",
    title: "Physiotherapy in MacEwan Calgary | Nose Creek Physiotherapy",
    subtitle: "Restore Mobility, Relieve Pain & Move Naturally Near MacEwan Glen",
    badge: "MacEwan & Calgary NW Community Care",
    description: "<p>Looking for a caring, results-driven physiotherapy clinic near <strong>MacEwan, Calgary</strong>? At <strong>Nose Creek Physiotherapy</strong>, our mission is to help you overcome acute injuries and chronic limitations so you can get back to doing what you love.</p><p>We take the time to listen, perform thorough biomechanical assessments, and create custom treatment roadmaps that empower lasting wellness.</p>",
    descriptionCol2: "<h3>Clinic Advantages for MacEwan Families</h3><ul><li><strong>5 Minutes Away:</strong> Quick commute via Berkshire Blvd with stress-free free parking outside our clinic doors.</li><li><strong>Multidisciplinary Team:</strong> Access physiotherapists, massage therapists, and chiropractors under one supportive roof.</li><li><strong>Advanced Modalities:</strong> Equipped with Shockwave therapy, IMS dry needling, and gait analysis for custom orthotics.</li></ul>",
    benefits: [
      "Only 5 Minutes East via Berkshire Blvd",
      "Direct Extended Health Billing Available",
      "Over 23 Years of Trusted North Calgary Care",
      "Custom Orthotics & Biomechanical Gait Analysis",
      "Personalized Rehab Without Cookie-Cutter Routines",
      "Free Parking Right Outside the Clinic"
    ],
    symptoms: [
      "Acute & Chronic Lower Back Pain",
      "Rotator Cuff Tears & Frozen Shoulder",
      "Patellofemoral Knee Pain Syndrome",
      "Achilles Tendonitis & Heel Spurs",
      "Headaches & Cervicogenic Tension",
      "Repetitive Strain & Carpal Tunnel"
    ],
    treatmentApproach: [
      "Comprehensive Biomechanical Assessment: 1-on-1 evaluation of movement restrictions, gait, and pain triggers.",
      "Targeted Pain Modulation: Evidence-based manual therapy and advanced modalities like shockwave or IMS.",
      "Progressive Functional Strength Training: Step-by-step exercise routines to restore athletic and everyday agility.",
      "Empowering Lifetime Prevention: Ergonomic education and home maintenance routines to stop recurring flare-ups."
    ],
    faqs: [
      {
        question: "Where is the clinic located relative to MacEwan?",
        answer: "We are situated in Beddington Towne Centre, only 5 minutes from MacEwan. You can take Berkshire Blvd NW to Beddington Blvd NW."
      },
      {
        question: "Can I book appointments online?",
        answer: "Yes, our online booking portal is open 24/7 so you can select your preferred practitioner and time slot conveniently from your phone or computer."
      }
    ]
  },
  {
    name: "Beddington",
    slug: "beddington-physiotherapy",
    title: "Physiotherapy in Beddington Calgary NW | Nose Creek Physiotherapy",
    subtitle: "Your Premier Local Physiotherapy Clinic in the Heart of Beddington Towne Centre",
    badge: "Beddington Towne Centre Clinic",
    description: "<p>Conveniently situated right in <strong>Beddington Towne Centre</strong>, <strong>Nose Creek Physiotherapy</strong> has been the benchmark for clinical excellence in Calgary North for more than two decades.</p><p>From motor vehicle accident recovery to complex spinal rehabilitation, our practitioners combine proven manual techniques with modern therapeutic exercises to restore active living.</p>",
    descriptionCol2: "<h3>Why Beddington Chooses Nose Creek Physio</h3><ul><li><strong>Directly In Your Community:</strong> Located steps from local shopping with plenty of free parking.</li><li><strong>Direct Billing:</strong> Instant electronic billing for most private insurance carriers, WCB, and auto insurers.</li><li><strong>Dedicated One-on-One Sessions:</strong> No rushed assembly-line care; your recovery is our singular priority.</li></ul>",
    benefits: [
      "Located In The Centre of Beddington",
      "Direct Billing to 25+ Health Insurers",
      "Open Early at 6:45 AM & Open Saturdays",
      "540+ Five-Star Patient Reviews",
      "Full Gym & Private Treatment Rooms",
      "Free Plaza Parking Outside"
    ],
    symptoms: [
      "Motor Vehicle Whiplash & Spine Trauma",
      "Degenerative Disc Disease & Spinal Stenosis",
      "Chronic Sciatica & Pinched Nerves",
      "Rotator Cuff & Shoulder Bursitis",
      "Hip, Knee & Ankle Sprains",
      "Workplace Ergonomic & Overuse Injuries"
    ],
    treatmentApproach: [
      "In-Depth Clinical Assessment: Advanced evaluation by credentialed FCAMPT physiotherapists.",
      "Integrated Manual Therapy: Hands-on spinal decompression, joint mobilization, and myofascial release.",
      "Custom Active Rehabilitation: One-on-one guided exercises tailored specifically to your sport or lifestyle.",
      "Ergonomic Advice & Ongoing Performance: Postural correction and long-term joint health maintenance."
    ],
    faqs: [
      {
        question: "Where exactly in Beddington are you located?",
        answer: "We are at #22, 8120 Beddington Blvd NW, Calgary, AB T3K 2A8, inside Beddington Towne Centre near major transit stops."
      },
      {
        question: "What are your clinic hours?",
        answer: "We are open Monday through Thursday 6:45am–7:15pm, Friday 6:45am–6:00pm, and Saturdays 8:00am–1:00pm."
      }
    ]
  }
];

const SECTION_DEFINITIONS: Record<string, { label: string; icon: string; defaultTitle: string; description: string }> = {
  hero: {
    label: "Hero Header & CTAs",
    icon: "🌟",
    defaultTitle: "Hero Banner & CTAs",
    description: "Top introductory banner with badge, H1, CTAs, trust badges, and hero image."
  },
  at_a_glance: {
    label: "At A Glance Highlights",
    icon: "⚡",
    defaultTitle: "Clinic Highlights & Quick Facts",
    description: "4-card quick highlights (Assessment, Direct Billing, No Referral, Free Parking)."
  },
  clinical_overview: {
    label: "Main Narrative & Care Overview",
    icon: "📝",
    defaultTitle: "Understanding Care & Treatment",
    description: "Detailed rich text overview with 1-column or 2-column layout, images, and bullets."
  },
  benefits: {
    label: "Proven Clinical Benefits",
    icon: "✅",
    defaultTitle: "Key Benefits of Physiotherapy Care",
    description: "Checkmarked benefits grid highlighting patient outcomes."
  },
  symptoms: {
    label: "Conditions & Complaints Treated",
    icon: "🩺",
    defaultTitle: "Common Conditions & Complaints We Treat",
    description: "Grid of targeted symptoms and injury complaints."
  },
  treatment_approach: {
    label: "Patient Care Journey / Steps",
    icon: "🔢",
    defaultTitle: "Our Step-by-Step Care Journey",
    description: "Numbered chronological recovery roadmap (Step 1, Step 2, Step 3...)."
  },
  reviews_carousel: {
    label: "Google Reviews Carousel",
    icon: "⭐",
    defaultTitle: "Real 5-Star Reviews From Our Calgary Patients",
    description: "Live interactive review carousel backed by 545+ Google reviews."
  },
  team_carousel: {
    label: "Practitioners & Team Carousel",
    icon: "👥",
    defaultTitle: "Meet Your Dedicated Clinical Team",
    description: "Scrollable team showcase displaying licensed physiotherapists and chiropractors."
  },
  faqs: {
    label: "Frequently Asked Questions",
    icon: "❓",
    defaultTitle: "Frequently Asked Questions",
    description: "Interactive FAQ accordion with automatic Google FAQPage JSON-LD schema."
  },
  location_map: {
    label: "Clinic Locations & Map",
    icon: "📍",
    defaultTitle: "Convenient Clinic Locations with Free Parking",
    description: "Beddington and Thorncliffe clinic details, hours, and direction links."
  },
  bottom_cta: {
    label: "Decision CTA Banner",
    icon: "🚀",
    defaultTitle: "Ready to Get Back to Doing What You Love?",
    description: "High-converting closing banner with Cost & Availability and Free Discovery buttons."
  }
};

export default function AdminPagesManager() {
  const { isAdmin } = useRole();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "neighborhood" | "custom">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Active Editing Page State
  const [activePage, setActivePage] = useState<CustomPage | null>(null);
  const [activeTab, setActiveTab] = useState<"sections" | "narrative" | "faqs" | "seo">("sections");
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Section Customizer Modal State
  const [customizingSection, setCustomizingSection] = useState<{
    key: string;
    defaultTitle: string;
    config?: SectionBlockConfig;
  } | null>(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<CustomPage | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pagesData, teamData] = await Promise.all([
          getCustomPages(),
          getTeamMembers().catch(() => [])
        ]);
        setPages(pagesData);
        setTeamMembers(teamData);
      } catch (err) {
        console.error("Failed to load custom pages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyPreset = (preset: typeof NEIGHBORHOOD_PRESETS[0]) => {
    const newPage: CustomPage = {
      id: `page-${preset.slug}`,
      slug: preset.slug,
      title: preset.title,
      subtitle: preset.subtitle,
      pageType: "neighborhood",
      category: "Neighborhood",
      neighborhoodName: preset.name,
      heroBadge: preset.badge,
      heroTitle: preset.title.split("|")[0].trim(),
      heroSubtitle: preset.subtitle,
      primaryCtaText: "Book Your Appointment Online",
      primaryCtaUrl: "/inquire",
      secondaryCtaText: "Call (403) 295-8590",
      secondaryCtaUrl: "tel:4032958590",
      content: preset.description,
      columnTwoContent: preset.descriptionCol2,
      content_layout: "2-column",
      layout: "two-column",
      benefits: preset.benefits,
      symptoms: preset.symptoms,
      treatmentApproach: preset.treatmentApproach,
      customSections: [],
      sectionsData: {},
      sectionOrder: [...defaultCustomPageSectionOrder],
      hiddenSections: [],
      faqs: preset.faqs,
      isPublished: true,
      is_published: true,
      seoTitle: preset.title,
      seoDescription: preset.subtitle,
      noIndex: false,
      noFollow: false
    };

    setActivePage(newPage);
    setActiveTab("sections");
    setToast({ message: `Loaded ${preset.name} community preset! Customise your sections and save.`, type: "success" });
  };

  const handleCreateNewBlank = () => {
    const blank: CustomPage = {
      id: `page-new-${Date.now()}`,
      slug: "",
      title: "",
      subtitle: "",
      pageType: "custom",
      category: "Landing Page",
      neighborhoodName: "",
      heroBadge: "Specialized Clinical Program",
      heroTitle: "",
      heroSubtitle: "",
      primaryCtaText: "Book an Appointment",
      primaryCtaUrl: "/inquire",
      secondaryCtaText: "Call (403) 295-8590",
      secondaryCtaUrl: "tel:4032958590",
      content: "<h2>Personalized Care in Calgary North</h2><p>Describe your clinical program, therapy approach, or promotional offer here.</p>",
      columnTwoContent: "",
      content_layout: "1-column",
      layout: "one-column",
      benefits: [
        "Direct Insurance Billing to Major Providers",
        "Registered Multidisciplinary Practitioners",
        "Open Evenings and Saturdays",
        "Free Dedicated Parking Outside"
      ],
      symptoms: [
        "Neck & Back Pain",
        "Sports Injuries",
        "Post-Surgical Recovery",
        "Joint & Muscle Stiffness"
      ],
      treatmentApproach: [
        "Detailed One-on-One Assessment: Thorough physical evaluation of mobility, strength, and pain mechanics.",
        "Targeted Manual Therapy: Evidence-based hands-on joint mobilization and soft-tissue release.",
        "Personalized Rehabilitation Plan: Tailored progressive strengthening and stability exercise routines.",
        "Long-Term Prevention Strategy: Posture education and home exercise guidance for lasting recovery."
      ],
      customSections: [],
      sectionsData: {},
      sectionOrder: [...defaultCustomPageSectionOrder],
      hiddenSections: [],
      faqs: [],
      isPublished: true,
      is_published: true,
      noIndex: false,
      noFollow: false
    };

    setActivePage(blank);
    setActiveTab("sections");
  };

  // Section Ordering & Visibility Controls
  const getActiveOrder = (page: CustomPage): string[] => {
    if (page.sectionOrder && page.sectionOrder.length > 0) return page.sectionOrder;
    if (page.section_order && page.section_order.length > 0) return page.section_order;
    return getDefaultCustomPageOrder(page);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!activePage) return;
    const currentOrder = [...getActiveOrder(activePage)];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    setActivePage({
      ...activePage,
      sectionOrder: currentOrder,
      section_order: currentOrder
    });
  };

  const handleToggleHideSection = (key: string) => {
    if (!activePage) return;
    const currentHidden = new Set(activePage.hiddenSections || activePage.hidden_sections || []);
    if (currentHidden.has(key)) {
      currentHidden.delete(key);
    } else {
      currentHidden.add(key);
    }
    const newHidden = Array.from(currentHidden);
    setActivePage({
      ...activePage,
      hiddenSections: newHidden,
      hidden_sections: newHidden
    });
  };

  const handleAddCustomSection = () => {
    if (!activePage) return;
    const customList = [...(activePage.customSections || activePage.custom_sections || [])];
    const newIdx = customList.length;
    const newSec: ServiceCustomSection = {
      id: `custom-sec-${Date.now()}`,
      title: `Custom Section ${newIdx + 1}`,
      eyebrow: "Spotlight Feature",
      eyebrowColor: "#1c9fd8",
      subtitle: "Highlighting our specialized approach or neighborhood story",
      content: "<p>Write your detailed narrative here with rich formatting, lists, or links.</p>",
      contentLayout: "1-column",
      background: "white",
      imagePosition: "right"
    };

    customList.push(newSec);
    const order = [...getActiveOrder(activePage)];
    const customKey = `custom-${newIdx}`;
    if (!order.includes(customKey)) {
      // Insert after clinical_overview or hero
      const insertAt = order.indexOf("clinical_overview") !== -1 ? order.indexOf("clinical_overview") + 1 : 2;
      order.splice(insertAt, 0, customKey);
    }

    setActivePage({
      ...activePage,
      customSections: customList,
      custom_sections: customList,
      sectionOrder: order,
      section_order: order
    });

    setToast({ message: "Added custom story section! Click 'Customize' to edit it.", type: "success" });
  };

  const handleDeleteCustomSection = (idx: number) => {
    if (!activePage) return;
    const customList = [...(activePage.customSections || activePage.custom_sections || [])];
    customList.splice(idx, 1);
    const customKey = `custom-${idx}`;
    const order = getActiveOrder(activePage).filter((k) => k !== customKey);

    setActivePage({
      ...activePage,
      customSections: customList,
      custom_sections: customList,
      sectionOrder: order,
      section_order: order
    });
  };

  // Section Customizer Save Handler
  const handleSaveSectionConfig = (key: string, updatedConfig: SectionBlockConfig) => {
    if (!activePage) return;
    const currentSectionsData = { ...(activePage.sectionsData || activePage.sections_data || {}) };
    currentSectionsData[key] = updatedConfig;

    let updatedCustomSections = activePage.customSections || activePage.custom_sections || [];
    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      const customList = [...updatedCustomSections];
      if (customList[idx]) {
        customList[idx] = {
          ...customList[idx],
          ...updatedConfig,
          title: updatedConfig.title || customList[idx].title
        };
        updatedCustomSections = customList;
      }
    }

    // If clinical_overview was edited, sync content & contentCol2
    let updatedContent = activePage.content;
    let updatedCol2 = activePage.columnTwoContent;
    let updatedLayout = activePage.layout;
    if (key === "clinical_overview") {
      if (updatedConfig.content !== undefined) updatedContent = updatedConfig.content;
      if (updatedConfig.contentCol2 !== undefined) updatedCol2 = updatedConfig.contentCol2;
      if (updatedConfig.contentLayout) {
        updatedLayout = updatedConfig.contentLayout === "2-column" ? "two-column" : "one-column";
      }
    }

    setActivePage({
      ...activePage,
      content: updatedContent,
      columnTwoContent: updatedCol2,
      content_col2: updatedCol2,
      layout: updatedLayout,
      content_layout: updatedLayout === "two-column" ? "2-column" : "1-column",
      sectionsData: currentSectionsData,
      sections_data: currentSectionsData,
      customSections: updatedCustomSections,
      custom_sections: updatedCustomSections
    });

    setCustomizingSection(null);
    setToast({ message: "Section customization updated!", type: "success" });
  };

  // Save Page to Database & Local
  const handleSavePage = async () => {
    if (!activePage) return;

    const slugClean = activePage.slug.trim().toLowerCase().replace(/^\/+/, "").replace(/[^a-z0-9-]/g, "-");
    if (!slugClean) {
      setToast({ message: "Please provide a valid URL slug (e.g. thorncliffe-physiotherapy)", type: "error" });
      return;
    }

    if (!activePage.title.trim()) {
      setToast({ message: "Please enter a page title.", type: "error" });
      return;
    }

    setSaving(true);

    const pageToSave: CustomPage = {
      ...activePage,
      id: activePage.id || `page-${slugClean}`,
      slug: slugClean,
      title: activePage.title.trim(),
      heroTitle: activePage.heroTitle?.trim() || activePage.title.trim(),
      heroSubtitle: activePage.heroSubtitle?.trim() || activePage.subtitle?.trim() || "",
      subtitle: activePage.subtitle?.trim() || activePage.heroSubtitle?.trim() || "",
      content: activePage.content || "",
      columnTwoContent: activePage.columnTwoContent || "",
      content_col2: activePage.columnTwoContent || "",
      layout: activePage.layout || "one-column",
      content_layout: activePage.layout === "two-column" ? "2-column" : "1-column",
      sectionOrder: getActiveOrder(activePage),
      section_order: getActiveOrder(activePage),
      hiddenSections: activePage.hiddenSections || [],
      hidden_sections: activePage.hiddenSections || [],
      benefits: activePage.benefits || [],
      symptoms: activePage.symptoms || [],
      treatmentApproach: activePage.treatmentApproach || [],
      customSections: activePage.customSections || [],
      custom_sections: activePage.customSections || [],
      sectionsData: activePage.sectionsData || {},
      sections_data: activePage.sectionsData || {},
      seo: {
        title: activePage.seoTitle || activePage.title,
        description: activePage.seoDescription || activePage.heroSubtitle || activePage.subtitle || "",
        noIndex: activePage.noIndex,
        noFollow: activePage.noFollow
      },
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update state pages list
    const updatedPages = [...pages.filter((p) => p.slug !== activePage.slug && p.id !== activePage.id), pageToSave];

    // 1. Save locally for instant reaction
    if (typeof window !== "undefined") {
      localStorage.setItem("adm_custom_pages", JSON.stringify(updatedPages));
      window.dispatchEvent(new Event("customPagesUpdated"));
    }

    // 2. Persist to API route
    try {
      const res = await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_pages",
          data: updatedPages
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save to backend API");
      }

      setPages(updatedPages);
      setActivePage(pageToSave);
      setToast({ message: `Page /${slugClean} saved successfully!`, type: "success" });
    } catch (err: any) {
      console.warn("API save error:", err);
      setToast({ message: "Saved locally, but server update had a warning.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async () => {
    if (!deleteTarget) return;
    const targetSlug = deleteTarget.slug;
    const updated = pages.filter((p) => p.slug !== targetSlug && p.id !== deleteTarget.id);

    if (typeof window !== "undefined") {
      localStorage.setItem("adm_custom_pages", JSON.stringify(updated));
      window.dispatchEvent(new Event("customPagesUpdated"));
    }

    try {
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_pages",
          data: updated,
          deletedSlug: targetSlug
        })
      });
    } catch (e) {
      console.warn("Delete sync warning:", e);
    }

    setPages(updated);
    if (activePage?.slug === targetSlug) {
      setActivePage(null);
    }
    setDeleteTarget(null);
    setToast({ message: `Page /${targetSlug} removed.`, type: "success" });
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.neighborhoodName && p.neighborhoodName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =
      categoryFilter === "all"
        ? true
        : categoryFilter === "neighborhood"
        ? p.pageType === "neighborhood" || p.category === "Neighborhood"
        : p.pageType !== "neighborhood" && p.category !== "Neighborhood";

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? p.isPublished !== false && p.is_published !== false
        : p.isPublished === false || p.is_published === false;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 80 }}>
      {toast && (
        <AdminToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🗺️</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#1e293b", fontFamily: "var(--adm-font-display)" }}>
              Pages &amp; Neighborhood Landing Pages
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: 13.5, color: "#64748b" }}>
            Create dynamic, multi-section landing pages (Beddington, Thorncliffe, promotional campaigns) with full rich text, carousels, and SEO controls.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={handleCreateNewBlank}
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <PlusIcon size={16} />
            <span>Create Custom Page</span>
          </button>
        </div>
      </div>

      {/* 1-Click Calgary Community Presets Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%)",
          color: "#ffffff",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 30,
          boxShadow: "0 10px 25px -5px rgba(10, 37, 64, 0.25)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ⚡ 1-Click Fast Starters
            </div>
            <h3 style={{ margin: "6px 0 0 0", fontSize: 17, fontWeight: 700, color: "#ffffff" }}>
              Pre-built Calgary Neighborhood Landing Pages
            </h3>
          </div>
          <span style={{ fontSize: 13, color: "#93c5fd" }}>
            Click any community to instantly generate a complete, ready-to-publish local page:
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {NEIGHBORHOOD_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: 8,
                color: "#ffffff",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
              }}
            >
              <span>📍 {preset.name}</span>
              <span style={{ fontSize: 11.5, color: "#93c5fd" }}>({preset.name} Community)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Left List / Right Active Editor */}
      <div style={{ display: "grid", gridTemplateColumns: activePage ? "340px 1fr" : "1fr", gap: 24, alignItems: "start" }}>
        
        {/* Pages Directory List */}
        <div className="adm-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
              All Pages ({filteredPages.length})
            </h3>
            {activePage && (
              <button
                type="button"
                onClick={() => setActivePage(null)}
                style={{ fontSize: 12.5, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Close Editor
              </button>
            )}
          </div>

          {/* Search & Filter */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13,
                  outline: "none"
                }}
              />
              <span style={{ position: "absolute", left: 10, top: 9, color: "#94a3b8" }}>
                <SearchIcon size={15} />
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                background: categoryFilter === "all" ? "#0284c7" : "#f1f5f9",
                color: categoryFilter === "all" ? "#fff" : "#475569",
                cursor: "pointer"
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("neighborhood")}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                background: categoryFilter === "neighborhood" ? "#0284c7" : "#f1f5f9",
                color: categoryFilter === "neighborhood" ? "#fff" : "#475569",
                cursor: "pointer"
              }}
            >
              Neighborhoods
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("custom")}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                background: categoryFilter === "custom" ? "#0284c7" : "#f1f5f9",
                color: categoryFilter === "custom" ? "#fff" : "#475569",
                cursor: "pointer"
              }}
            >
              Custom
            </button>
          </div>

          {/* List items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
            {filteredPages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "#94a3b8", fontSize: 13 }}>
                No pages match your filter.
              </div>
            ) : (
              filteredPages.map((p) => {
                const isSelected = activePage?.slug === p.slug;
                const isNoIndex = Boolean(p.noIndex || p.seo?.noIndex);

                return (
                  <div
                    key={p.slug || p.id}
                    onClick={() => {
                      setActivePage(p);
                      setActiveTab("sections");
                    }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: isSelected ? "2px solid #0284c7" : "1px solid #e2e8f0",
                      background: isSelected ? "#f0f9ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b", lineHeight: 1.3 }}>
                        {p.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#0284c7", marginBottom: 6 }}>
                      <span>/{p.slug}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: p.pageType === "neighborhood" ? "#dcfce7" : "#e0f2fe", color: p.pageType === "neighborhood" ? "#15803d" : "#0369a1" }}>
                        {p.pageType === "neighborhood" ? "Neighborhood" : "Custom Page"}
                      </span>

                      {isNoIndex && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#fef3c7", color: "#b45309" }}>
                          NO-INDEX
                        </span>
                      )}

                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                        {(p.sectionOrder?.length || 10)} sections
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Editor / Builder */}
        {activePage && (
          <div className="adm-card" style={{ padding: 26 }}>
            {/* Header with Title and Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, paddingBottom: 18, borderBottom: "1px solid #e2e8f0", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0284c7", background: "#e0f2fe", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                    {activePage.pageType === "neighborhood" ? "Neighborhood Page" : "Landing Page"}
                  </span>
                  <a
                    href={`/${activePage.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12.5, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                  >
                    <span>/{activePage.slug}</span>
                    <ExternalLinkIcon size={13} />
                  </a>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#1e293b" }}>
                  {activePage.title || "Untitled Page"}
                </h2>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: showLivePreview ? "#0f172a" : "#ffffff",
                    color: showLivePreview ? "#ffffff" : "#334155",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <EyeIcon size={15} />
                  <span>{showLivePreview ? "Hide Preview" : "Live Preview"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(activePage)}
                  className="adm-btn adm-btn-danger"
                  style={{ padding: "8px 12px" }}
                  title="Delete page"
                >
                  <TrashIcon size={15} />
                </button>

                <button
                  type="button"
                  onClick={handleSavePage}
                  disabled={saving}
                  className="adm-btn adm-btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px" }}
                >
                  <CheckIcon size={16} />
                  <span>{saving ? "Saving..." : "Save & Publish"}</span>
                </button>
              </div>
            </div>

            {/* Live Preview Toggle Window */}
            {showLivePreview && (
              <div style={{ marginBottom: 28, border: "2px solid #0284c7", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                <div style={{ background: "#0f172a", color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span>👁️ Real-Time Component Live Preview</span>
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(false)}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ maxHeight: 600, overflowY: "auto", background: "#ffffff" }}>
                  <CustomPageLiveView initialPage={activePage} allTeam={teamMembers} />
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #e2e8f0", marginBottom: 22 }}>
              <button
                type="button"
                onClick={() => setActiveTab("sections")}
                style={{
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  borderBottom: activeTab === "sections" ? "3px solid #0284c7" : "3px solid transparent",
                  background: "none",
                  color: activeTab === "sections" ? "#0284c7" : "#64748b",
                  cursor: "pointer"
                }}
              >
                🧩 Modular Sections ({getActiveOrder(activePage).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("narrative")}
                style={{
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  borderBottom: activeTab === "narrative" ? "3px solid #0284c7" : "3px solid transparent",
                  background: "none",
                  color: activeTab === "narrative" ? "#0284c7" : "#64748b",
                  cursor: "pointer"
                }}
              >
                📝 Narrative &amp; 2-Column Content
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("faqs")}
                style={{
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  borderBottom: activeTab === "faqs" ? "3px solid #0284c7" : "3px solid transparent",
                  background: "none",
                  color: activeTab === "faqs" ? "#0284c7" : "#64748b",
                  cursor: "pointer"
                }}
              >
                ❓ FAQs ({activePage.faqs?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                style={{
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  borderBottom: activeTab === "seo" ? "3px solid #0284c7" : "3px solid transparent",
                  background: "none",
                  color: activeTab === "seo" ? "#0284c7" : "#64748b",
                  cursor: "pointer"
                }}
              >
                🌐 SEO &amp; Robots Directives
              </button>
            </div>

            {/* TAB 1: MODULAR SECTIONS BUILDER */}
            {activeTab === "sections" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                      Page Section Blocks
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>
                      Reorder sections, toggle visibility, and click Customize to alter styling, text, images, or backgrounds.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomSection}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <PlusIcon size={14} />
                    <span>+ Add Custom Story Section</span>
                  </button>
                </div>

                {/* Section List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {getActiveOrder(activePage).map((key, index) => {
                    const isHidden = (activePage.hiddenSections || activePage.hidden_sections || []).includes(key);
                    const isCustom = key.startsWith("custom-");
                    const customIdx = isCustom ? parseInt(key.replace("custom-", ""), 10) : -1;
                    const customList = activePage.customSections || activePage.custom_sections || [];
                    const customSec = isCustom ? customList[customIdx] : null;

                    const def = isCustom
                      ? {
                          label: customSec?.title || `Custom Story Section ${customIdx + 1}`,
                          icon: "📖",
                          defaultTitle: customSec?.title || "Custom Story Section",
                          description: "Custom storytelling section with 1-col/2-col narrative, image position & background."
                        }
                      : SECTION_DEFINITIONS[key] || {
                          label: key,
                          icon: "📌",
                          defaultTitle: key,
                          description: "Modular content block."
                        };

                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: isHidden ? "1px dashed #cbd5e1" : "1px solid #e2e8f0",
                          background: isHidden ? "#f8fafc" : "#ffffff",
                          opacity: isHidden ? 0.65 : 1,
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <span style={{ fontSize: 22 }}>{def.icon}</span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 14.5, color: isHidden ? "#64748b" : "#1e293b" }}>
                                {def.label}
                              </span>
                              {isHidden && (
                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#e2e8f0", color: "#64748b" }}>
                                  HIDDEN
                                </span>
                              )}
                              {isCustom && (
                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#dbeafe", color: "#1d4ed8" }}>
                                  CUSTOM STORY
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                              {def.description}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveSection(index, "up")}
                            disabled={index === 0}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              opacity: index === 0 ? 0.4 : 1
                            }}
                            title="Move section up"
                          >
                            <ArrowUpIcon size={14} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveSection(index, "down")}
                            disabled={index === getActiveOrder(activePage).length - 1}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              cursor: index === getActiveOrder(activePage).length - 1 ? "not-allowed" : "pointer",
                              opacity: index === getActiveOrder(activePage).length - 1 ? 0.4 : 1
                            }}
                            title="Move section down"
                          >
                            <ArrowDownIcon size={14} />
                          </button>

                          {/* Hide / Show */}
                          <button
                            type="button"
                            onClick={() => handleToggleHideSection(key)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: isHidden ? "#f1f5f9" : "#ffffff",
                              color: isHidden ? "#64748b" : "#0284c7",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12.5,
                              fontWeight: 600
                            }}
                            title={isHidden ? "Show section on site" : "Hide section on site"}
                          >
                            {isHidden ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                            <span>{isHidden ? "Hidden" : "Visible"}</span>
                          </button>

                          {/* Customize Section */}
                          <button
                            type="button"
                            onClick={() => {
                              const sData = activePage.sectionsData || activePage.sections_data || {};
                              setCustomizingSection({
                                key,
                                defaultTitle: def.defaultTitle,
                                config: sData[key] || (isCustom ? customSec || undefined : undefined)
                              });
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            <SlidersIcon size={14} />
                            <span>Customize</span>
                          </button>

                          {/* Delete if custom story */}
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomSection(customIdx)}
                              style={{
                                padding: "6px 8px",
                                borderRadius: 6,
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#dc2626",
                                cursor: "pointer"
                              }}
                              title="Delete custom section"
                            >
                              <TrashIcon size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: NARRATIVE & 2-COLUMN CONTENT */}
            {activeTab === "narrative" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={activePage.title}
                      onChange={(e) => setActivePage({ ...activePage, title: e.target.value })}
                      placeholder="e.g. Physiotherapy in Thorncliffe Calgary"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      URL Slug
                    </label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ padding: "10px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 13.5, color: "#64748b" }}>
                        /
                      </span>
                      <input
                        type="text"
                        value={activePage.slug}
                        onChange={(e) => setActivePage({ ...activePage, slug: e.target.value })}
                        placeholder="thorncliffe-physiotherapy"
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "0 8px 8px 0", border: "1px solid #cbd5e1", fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Page Category
                    </label>
                    <select
                      value={activePage.pageType || "neighborhood"}
                      onChange={(e) => setActivePage({ ...activePage, pageType: e.target.value as any, category: e.target.value === "neighborhood" ? "Neighborhood" : "Landing Page" })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff" }}
                    >
                      <option value="neighborhood">Neighborhood Landing Page</option>
                      <option value="custom">General Custom Page / Promotion</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Neighborhood Name (if applicable)
                    </label>
                    <input
                      type="text"
                      value={activePage.neighborhoodName || ""}
                      onChange={(e) => setActivePage({ ...activePage, neighborhoodName: e.target.value })}
                      placeholder="e.g. Thorncliffe, Huntington Hills"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                    />
                  </div>
                </div>

                {/* Layout Mode Switcher */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                    Narrative Layout Mode
                  </label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setActivePage({ ...activePage, layout: "one-column", content_layout: "1-column" })}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: activePage.layout !== "two-column" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        background: activePage.layout !== "two-column" ? "#f0f9ff" : "#ffffff",
                        color: activePage.layout !== "two-column" ? "#0284c7" : "#475569",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer"
                      }}
                    >
                      Single Column (Standard Centered)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage({ ...activePage, layout: "two-column", content_layout: "2-column" })}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: activePage.layout === "two-column" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                        background: activePage.layout === "two-column" ? "#f0f9ff" : "#ffffff",
                        color: activePage.layout === "two-column" ? "#0284c7" : "#475569",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer"
                      }}
                    >
                      Dual Column (Side by Side)
                    </button>
                  </div>
                </div>

                {/* Column 1 Editor */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    {activePage.layout === "two-column" ? "Column 1 Narrative" : "Main Narrative Content"}
                  </label>
                  <RichTextEditor
                    value={activePage.content || ""}
                    onChange={(html) => setActivePage({ ...activePage, content: html })}
                    placeholder="Write detailed clinical overview, headings, lists, or links..."
                  />
                </div>

                {/* Column 2 Editor if two-column */}
                {activePage.layout === "two-column" && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Column 2 Narrative (Why Choose Us, Highlights, Fast Access)
                    </label>
                    <RichTextEditor
                      value={activePage.columnTwoContent || activePage.content_col2 || ""}
                      onChange={(html) => setActivePage({ ...activePage, columnTwoContent: html, content_col2: html })}
                      placeholder="Write secondary column highlights, bullet points, or clinic awards..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FAQS MANAGER */}
            {activeTab === "faqs" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                      Frequently Asked Questions
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>
                      Add neighborhood-specific FAQs. Automatically generates Google FAQPage JSON-LD schema!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(activePage.faqs || [])];
                      list.push({ question: "", answer: "" });
                      setActivePage({ ...activePage, faqs: list });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <PlusIcon size={14} />
                    <span>+ Add FAQ Item</span>
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {(!activePage.faqs || activePage.faqs.length === 0) ? (
                    <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 10, color: "#64748b", fontSize: 13 }}>
                      No FAQs added yet. Click "+ Add FAQ Item" to add questions.
                    </div>
                  ) : (
                    activePage.faqs.map((faq, index) => (
                      <div key={index} style={{ padding: 18, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0284c7" }}>
                            Question #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(activePage.faqs || [])];
                              list.splice(index, 1);
                              setActivePage({ ...activePage, faqs: list });
                            }}
                            style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="e.g. Do I need a doctor's referral for physiotherapy?"
                          value={faq.question}
                          onChange={(e) => {
                            const list = [...(activePage.faqs || [])];
                            list[index].question = e.target.value;
                            setActivePage({ ...activePage, faqs: list });
                          }}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, marginBottom: 10 }}
                        />

                        <textarea
                          placeholder="Write the clear, helpful clinical answer here..."
                          rows={3}
                          value={faq.answer}
                          onChange={(e) => {
                            const list = [...(activePage.faqs || [])];
                            list[index].answer = e.target.value;
                            setActivePage({ ...activePage, faqs: list });
                          }}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, resize: "vertical" }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SEO & ROBOTS DIRECTIVES */}
            {activeTab === "seo" && (
              <div>
                <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  Search Engine Optimization &amp; Robots Directives
                </h3>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Custom SEO Title Tag
                  </label>
                  <input
                    type="text"
                    value={activePage.seoTitle || ""}
                    onChange={(e) => setActivePage({ ...activePage, seoTitle: e.target.value })}
                    placeholder={activePage.title || "Physiotherapy in Calgary North | Nose Creek Physiotherapy"}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5 }}
                  />
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Recommended 50–60 characters. Leave blank to default to page title.
                  </span>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Custom Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={activePage.seoDescription || ""}
                    onChange={(e) => setActivePage({ ...activePage, seoDescription: e.target.value })}
                    placeholder="Enter an enticing 140–160 character description summarizing this page for Google search results..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, resize: "vertical" }}
                  />
                </div>

                {/* Robots Directives Card */}
                <div style={{ padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: 14.5, fontWeight: 700, color: "#1e293b" }}>
                    Robots Indexing Directives
                  </h4>
                  <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
                    Control how search engine crawlers index this page and whether it appears in the XML sitemaps.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(activePage.noIndex)}
                        onChange={(e) => setActivePage({ ...activePage, noIndex: e.target.checked })}
                        style={{ marginTop: 3, width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
                          Exclude from Search Engines (noindex)
                        </div>
                        <div style={{ fontSize: 12.5, color: "#64748b" }}>
                          Adds <code>&lt;meta name="robots" content="noindex"&gt;</code> and automatically removes this page from <code>/sitemap.xml</code>.
                        </div>
                      </div>
                    </label>

                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(activePage.noFollow)}
                        onChange={(e) => setActivePage({ ...activePage, noFollow: e.target.checked })}
                        style={{ marginTop: 3, width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
                          Don&apos;t Follow Links on This Page (nofollow)
                        </div>
                        <div style={{ fontSize: 12.5, color: "#64748b" }}>
                          Tells search engines not to crawl or endorse links on this page.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ padding: 18, background: "#f1f5f9", borderRadius: 10, fontSize: 13, color: "#475569" }}>
                  💡 <strong>Tip:</strong> Any page saved here automatically appears in <strong>SEO &amp; Meta Info</strong> tab for advanced override if desired.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Block Customizer Modal */}
      {customizingSection && (
        <SectionBlockCustomizerModal
          isOpen={Boolean(customizingSection)}
          onClose={() => setCustomizingSection(null)}
          sectionKey={customizingSection.key}
          sectionDefaultTitle={customizingSection.defaultTitle}
          config={customizingSection.config}
          onSave={(updatedConfig) => handleSaveSectionConfig(customizingSection.key, updatedConfig)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={Boolean(deleteTarget)}
          title={`Delete /${deleteTarget.slug}?`}
          itemName={`/${deleteTarget.slug} (${deleteTarget.title})`}
          itemType="Custom Page"
          onConfirm={handleDeletePage}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
