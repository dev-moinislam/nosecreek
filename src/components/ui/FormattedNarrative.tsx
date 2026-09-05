import React from "react";
import Link from "next/link";

interface FormattedNarrativeProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  paragraphStyle?: React.CSSProperties;
  isDark?: boolean;
}

/**
 * Parses markdown links [Anchor Text](/target-url) and raw URLs into crawlable,
 * SEO-optimized Next.js <Link> or <a> tags.
 */
export default function FormattedNarrative({
  content,
  className,
  style,
  paragraphStyle,
  isDark = false
}: FormattedNarrativeProps) {
  if (!content) return null;

  const paragraphs = content.split("\n\n").filter(Boolean);

  const linkColor = isDark ? "#67e8f9" : "#0284c7";
  const linkHoverColor = isDark ? "#a5f3fc" : "#0369a1";

  // Regex to match [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parseParagraph = (text: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = linkRegex.lastIndex;

      // Text before the link
      if (matchStart > lastIndex) {
        elements.push(text.substring(lastIndex, matchStart));
      }

      const linkText = match[1];
      const linkHref = match[2].trim();
      const isInternal = linkHref.startsWith("/") || linkHref.startsWith("#") || linkHref.includes("nosecreekphysiotherapy.com");

      if (isInternal) {
        const cleanHref = linkHref.replace(/^https?:\/\/(www\.)?nosecreekphysiotherapy\.com/, "");
        elements.push(
          <Link
            key={`link-${matchStart}`}
            href={cleanHref || "/"}
            title={linkText}
            style={{
              color: linkColor,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              fontWeight: 600,
              transition: "color 0.15s ease"
            }}
          >
            {linkText}
          </Link>
        );
      } else {
        elements.push(
          <a
            key={`link-${matchStart}`}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            title={linkText}
            style={{
              color: linkColor,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              fontWeight: 600
            }}
          >
            {linkText}
          </a>
        );
      }

      lastIndex = matchEnd;
    }

    // Remaining text after last link
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className={className} style={style}>
      {paragraphs.map((para, idx) => (
        <p key={idx} style={{ marginBottom: 14, ...paragraphStyle }}>
          {parseParagraph(para)}
        </p>
      ))}
    </div>
  );
}
