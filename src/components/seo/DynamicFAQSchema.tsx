"use client";

import React from "react";
import SchemaMarkup from "./SchemaMarkup";

interface DynamicFAQSchemaProps {
  faqs?: Array<{
    question?: string;
    answer?: string;
    q?: string;
    a?: string;
    [key: string]: any;
  }> | null;
}

/**
 * Dynamically outputs Google FAQPage JSON-LD schema for any page
 * that has FAQ items (Homepage, Service pages, Condition pages, etc.).
 * If no FAQs exist on the page, nothing is rendered.
 */
export default function DynamicFAQSchema({ faqs }: DynamicFAQSchemaProps) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  const validItems = faqs
    .map((item) => ({
      question: (item.question || item.q || "").trim(),
      answer: (item.answer || item.a || "").trim()
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0);

  if (validItems.length === 0) {
    return null;
  }

  return <SchemaMarkup type="FAQPage" data={validItems} />;
}
