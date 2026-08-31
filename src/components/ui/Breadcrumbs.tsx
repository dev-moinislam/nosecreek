import React from "react";
import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Automatically prepends Home if not already present
  const fullItems = [
    ...(items[0]?.href === "/" ? [] : [{ label: "Home", href: "/" }]),
    ...items
  ];

  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1;

          return (
            <li key={index} className={styles.item}>
              {isLast || !item.href ? (
                <span className={styles.active} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  &rarr;
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
