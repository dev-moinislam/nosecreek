import React from "react";

interface SchemaMarkupProps {
  type: "MedicalBusiness" | "Person" | "Article" | "BreadcrumbList" | "FAQPage";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let schema: any = null;

  switch (type) {
    case "MedicalBusiness":
      const localBusiness = {
        "@type": ["LocalBusiness", "MedicalBusiness", "Physiotherapy"],
        "@id": "https://www.nosecreekphysiotherapy.com/#LocalBusiness",
        "name": data.clinicName || data.name || "Nose Creek Physiotherapy",
        "alternateName": "Nose Creek Physical Therapy",
        "image": "https://www.nosecreekphysiotherapy.com/images/clinic/reception-desktop.jpg",
        "logo": "https://www.nosecreekphysiotherapy.com/images/logo/nose-creek-logo.webp",
        "url": "https://www.nosecreekphysiotherapy.com",
        "telephone": data.contact?.phone || data.telephone || "403-295-8590",
        "faxNumber": "403-295-8598",
        "email": data.contact?.email || data.email || "info@nosecreekphysiotherapy.com",
        "description": "Nose Creek Physiotherapy in Calgary provides expert physiotherapy, massage therapy, acupuncture, shockwave therapy, custom orthotics, and knee bracing.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "8220 Centre St NE #153",
          "addressLocality": "Calgary",
          "addressRegion": "AB",
          "postalCode": "T3K 1J7",
          "addressCountry": "CA"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 51.1264183,
          "longitude": -114.0723116
        },
        "hasMap": "https://www.google.com/maps/place/Nose+Creek+Physiotherapy/@51.126316,-114.0695037,17z/data=!3m1!5s0x537165d72e2e9a4f:0xf87800e6f2762f39!4m8!3m7!1s0x537165d74effbead:0xbe7dc01542416295!8m2!3d51.126316!4d-114.0695037!9m1!1b1!16s%2Fg%2F1tgps902?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
            "opens": "07:00",
            "closes": "20:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Friday",
            "opens": "07:00",
            "closes": "18:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "08:00",
            "closes": "13:00"
          }
        ],
        "sameAs": [
          "https://www.facebook.com/nosecreekphysiotherapy",
          "https://www.instagram.com/nosecreekphysio",
          "https://twitter.com/nosecreekphysio",
          "https://www.linkedin.com/company/nose-creek-physiotherapy",
          "https://www.youtube.com/@nosecreekphysiotherapy"
        ],
        "priceRange": "$$",
        "currenciesAccepted": "CAD",
        "paymentAccepted": "Cash, Credit Card, Direct Insurance Billing",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "545",
          "bestRating": "5",
          "worstRating": "1"
        }
      };

      const product = {
        "@type": "Product",
        "@id": "https://www.nosecreekphysiotherapy.com/#product",
        "name": "Physiotherapy and Rehabilitation Services",
        "description": "Comprehensive physiotherapy, sports injury rehabilitation, massage therapy, and acupuncture services at Nose Creek Physiotherapy in Calgary.",
        "brand": {
          "@type": "Brand",
          "name": "Nose Creek Physiotherapy"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "545",
          "bestRating": "5",
          "worstRating": "1"
        }
      };

      const defaultFaqs = [
        {
          "@type": "Question",
          "name": "What other services do you provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our team provides massage therapy, shockwave therapy, online physiotherapy (tele-health), rehabilitation, foot care and custom orthotics, acute injury management, injury recovery programs and expert advice on pain — all delivered by experienced therapists."
          }
        },
        {
          "@type": "Question",
          "name": "What type of common conditions can physiotherapy services treat?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Physiotherapy can help with a wide range of issues including back and neck pain, knee pain, shoulder and joint problems, sports injuries, motor-vehicle injuries, chronic pain, vertigo and balance issues, frozen shoulder, TMJ/jaw dysfunction, soft-tissue and connective-tissue problems, spinal stenosis, pelvic health concerns and limited range of motion."
          }
        },
        {
          "@type": "Question",
          "name": "Is physiotherapy covered by my insurance policy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Physiotherapy and many of our other services are covered by extended health insurance plans, and we offer direct billing where available. No doctor referral is needed to start."
          }
        }
      ];

      const faqPage = {
        "@type": "FAQPage",
        "@id": "https://www.nosecreekphysiotherapy.com/#faq",
        "mainEntity": defaultFaqs
      };

      schema = {
        "@context": "https://schema.org",
        "@graph": [localBusiness, product, faqPage]
      };
      break;

    case "Person":
      schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": data.name,
        "jobTitle": data.role || data.title || "Physiotherapist",
        "description": data.shortBio || data.fullBio || data.description,
        "image": data.profileImage || data.image,
        "telephone": data.phone || "403-295-8590",
        "email": data.email || "info@nosecreekphysiotherapy.com",
        "worksFor": {
          "@type": "MedicalOrganization",
          "name": "Nose Creek Physiotherapy",
          "url": "https://www.nosecreekphysiotherapy.com"
        },
        "alumniOf": data.education || [],
        "knowsAbout": data.specialties || [],
        "sameAs": Object.values(data.socialLinks || {})
      };
      break;

    case "Article":
      schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.title,
        "description": data.excerpt || data.seo?.description,
        "image": data.featuredImage || data.seo?.ogImage,
        "datePublished": data.publishedAt,
        "dateModified": data.updatedAt || data.publishedAt,
        "author": {
          "@type": "Person",
          "name": data.author || "Nose Creek Physiotherapy Clinical Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Nose Creek Physiotherapy",
          "logo": {
            "@type": "ImageObject",
            "url": "/images/logo/nose-creek-logo.webp"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.nosecreekphysiotherapy.com/blog/${data.slug}`
        }
      };
      break;

    case "BreadcrumbList":
      schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "itemListElement": data.map((item: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name || item.label,
          "item": item.url || item.href
        }))
      };
      break;

    case "FAQPage":
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "mainEntity": data.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      break;

    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
