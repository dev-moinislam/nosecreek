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
      schema = {
        "@context": "https://schema.org",
        "@type": "Physiotherapy",
        "name": data.name || "Nose Creek Physiotherapy",
        "image": data.image || "/images/logo/nose-creek-logo.webp",
        "@id": "https://www.nosecreekphysiotherapy.com/#clinic",
        "url": "https://www.nosecreekphysiotherapy.com",
        "telephone": data.telephone || "403-295-8590",
        "faxNumber": "403-295-8598",
        "email": data.email || "info@nosecreekphysiotherapy.com",
        "description": "Nose Creek Physiotherapy in Calgary provides expert physiotherapy, massage therapy, acupuncture, shockwave therapy, custom orthotics, and knee bracing.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.address?.street || "8220 Centre St NE #153",
          "addressLocality": data.address?.city || "Calgary",
          "addressRegion": data.address?.province || "AB",
          "postalCode": data.address?.postalCode || "T3K 1J7",
          "addressCountry": "CA"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 51.1278,
          "longitude": -114.0628
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "06:45",
            "closes": "19:15"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "08:00",
            "closes": "14:00"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "545",
          "bestRating": "5",
          "worstRating": "1"
        },
        "priceRange": "$$"
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
