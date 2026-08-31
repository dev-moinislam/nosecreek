"use client";

import React, { useState } from "react";
import styles from "@/app/page.module.css";

interface FAQ {
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  {
    q: "Do I need a doctor's referral to see a physiotherapist?",
    a: "No — in Alberta you can self-refer to a physiotherapist, chiropractor, or massage therapist without a physician's note. We can assess and begin treatment on your first visit. Some private insurance plans may still require a referral for reimbursement, so check your plan first.",
  },
  {
    q: "Do you direct-bill my insurance company?",
    a: "Yes! We direct-bill most major Canadian insurance providers including Sun Life, Canada Life, Manulife, Alberta Blue Cross, Green Shield Canada, and more. Simply bring your insurance card to your first appointment and we'll handle the rest.",
  },
  {
    q: "What should I bring and wear to my first appointment?",
    a: "Bring any relevant X-rays, MRI or scan reports, your insurance card, and a photo ID. We recommend wearing comfortable, loose-fitting athletic clothing. For lower-body conditions, shorts are helpful. For shoulder or neck treatment, a tank-top or sleeveless shirt is ideal.",
  },
  {
    q: "How long is each physiotherapy session?",
    a: "Initial assessments are typically 45–60 minutes so we can perform a thorough evaluation. Follow-up treatment sessions are usually 30–45 minutes. Massage therapy appointments can be booked in 30, 45, or 60-minute blocks depending on your needs.",
  },
  {
    q: "Do you offer virtual physiotherapy appointments?",
    a: "Yes! We offer secure video consultations for movement screenings, exercise prescription, and recovery coaching. Virtual care is a great option if you have mobility limitations, travel constraints, or simply prefer the convenience of home-based sessions.",
  },
];

export default function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={styles.faqList}>
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={styles.faqItem}>
            <button
              className={styles.faqQ}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
            >
              <span>{faq.q}</span>
              <svg
                className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              id={`faq-a-${i}`}
              className={styles.faqA}
              style={{ maxHeight: isOpen ? "360px" : "0", opacity: isOpen ? 1 : 0 }}
            >
              <div className={styles.faqAInner}>{faq.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
