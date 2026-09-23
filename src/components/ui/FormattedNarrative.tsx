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
 * Checks if a string contains HTML tags
 */
function isHtmlContent(str: string): boolean {
  if (!str) return false;
  return /<([a-z][a-z0-9]*)\b[^>]*>/i.test(str);
}

/**
 * Enhanced FormattedNarrative:
 * Supports rich HTML (Headings H2-H6, Bullet & Numbered lists, Alignments, Bold, Links, Quotes)
 * while preserving 100% backward compatibility for legacy markdown links [text](url) and paragraphs.
 */
export default function FormattedNarrative({
  content,
  className,
  style,
  paragraphStyle,
  isDark = false
}: FormattedNarrativeProps) {
  if (!content) return null;

  const linkColor = isDark ? "#67e8f9" : "#0284c7";
  const descColor = isDark ? "#cbdbe4" : "#48535c";
  const headingColor = isDark ? "#ffffff" : "#1d2b34";

  // CASE 1: RICH HTML CONTENT
  if (isHtmlContent(content)) {
    // Process markdown links [text](url) that may exist inside HTML
    const processedHtml = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
      const isInternal = href.startsWith("/") || href.startsWith("#") || href.includes("nosecreekphysiotherapy.com");
      const cleanHref = href.replace(/^https?:\/\/(www\.)?nosecreekphysiotherapy\.com/, "");
      const targetAttr = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${cleanHref || "/"}"${targetAttr} style="color: ${linkColor}; text-decoration: underline; text-underline-offset: 3px; font-weight: 600;">${text}</a>`;
    });

    return (
      <div
        className={`formatted-narrative-prose ${className || ""}`}
        style={{
          color: descColor,
          lineHeight: 1.75,
          fontSize: "clamp(15px, 1.1vw, 16.5px)",
          ...style
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .formatted-narrative-prose h2 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: clamp(22px, 2.6vw, 30px);
            line-height: 1.25;
            color: ${headingColor};
            margin: 24px 0 12px 0;
          }
          .formatted-narrative-prose h3 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: clamp(19px, 2.2vw, 24px);
            line-height: 1.3;
            color: ${headingColor};
            margin: 20px 0 10px 0;
          }
          .formatted-narrative-prose h4 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: clamp(17px, 1.8vw, 20px);
            line-height: 1.35;
            color: ${headingColor};
            margin: 16px 0 8px 0;
          }
          .formatted-narrative-prose h5 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 16px;
            color: ${headingColor};
            margin: 14px 0 6px 0;
          }
          .formatted-narrative-prose h6 {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 13.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: ${isDark ? "#94a3b8" : "#64748b"};
            margin: 12px 0 6px 0;
          }
          .formatted-narrative-prose p {
            margin: 0 0 14px 0;
            line-height: 1.75;
          }
          .formatted-narrative-prose p:last-child {
            margin-bottom: 0;
          }
          .formatted-narrative-prose ul {
            list-style-type: disc;
            margin: 12px 0 16px 24px;
            padding: 0;
          }
          .formatted-narrative-prose ol {
            list-style-type: decimal;
            margin: 12px 0 16px 24px;
            padding: 0;
          }
          .formatted-narrative-prose li {
            margin-bottom: 6px;
            line-height: 1.65;
            color: ${isDark ? "#e2e8f0" : "#334155"};
          }
          .formatted-narrative-prose a {
            color: ${linkColor};
            text-decoration: underline;
            text-underline-offset: 3px;
            font-weight: 600;
            transition: color 0.15s ease;
          }
          .formatted-narrative-prose a:hover {
            color: ${isDark ? "#a5f3fc" : "#0369a1"};
          }
          .formatted-narrative-prose blockquote {
            border-left: 4px solid #1c9fd8;
            margin: 16px 0;
            padding: 12px 18px;
            background: ${isDark ? "rgba(28,159,216,0.12)" : "#f0f9ff"};
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: ${isDark ? "#e0f2fe" : "#0c4a6e"};
          }
          .formatted-narrative-prose hr {
            border: 0;
            border-top: 1px solid ${isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0"};
            margin: 24px 0;
          }
        `}} />
        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
      </div>
    );
  }

  // CASE 2: LEGACY PLAIN TEXT OR MARKDOWN LINKS
  const paragraphs = content.split("\n\n").filter(Boolean);
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parseParagraph = (text: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = linkRegex.lastIndex;

      if (matchStart > lastIndex) {
        elements.push(text.substring(lastIndex, matchStart));
      }

      const linkText = match[1];
      const rawHref = match[2].trim();
      const isNofollowInMarkdown = rawHref.toLowerCase().includes("nofollow");
      const cleanLinkHref = rawHref.replace(/["'].*["']/, "").trim();
      const isInternal =
        cleanLinkHref.startsWith("/") ||
        cleanLinkHref.startsWith("#") ||
        cleanLinkHref.includes("nosecreekphysiotherapy.com");

      if (isInternal) {
        const cleanHref = cleanLinkHref.replace(/^https?:\/\/(www\.)?nosecreekphysiotherapy\.com/, "");
        elements.push(
          <Link
            key={`link-${matchStart}`}
            href={cleanHref || "/"}
            title={linkText}
            rel={isNofollowInMarkdown ? "nofollow" : undefined}
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
        const relVal = isNofollowInMarkdown ? "noopener noreferrer nofollow" : "noopener noreferrer";
        elements.push(
          <a
            key={`link-${matchStart}`}
            href={cleanLinkHref}
            target="_blank"
            rel={relVal}
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

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className={className} style={{ color: descColor, ...style }}>
      {paragraphs.map((para, idx) => (
        <p key={idx} style={{ marginBottom: 14, lineHeight: 1.75, ...paragraphStyle }}>
          {parseParagraph(para)}
        </p>
      ))}
    </div>
  );
}
