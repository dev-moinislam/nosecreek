"use client";

import React, { useEffect, useState } from "react";
import styles from "./ReviewWidget.module.css";
import testimonialsData from "@/data/testimonials.json";
import { Testimonial } from "@/types/content";

export default function ReviewWidget() {
  const [review, setReview] = useState<Testimonial | null>(null);

  useEffect(() => {
    // Load the first review (Falgun Patel's review) from our dataset
    if (testimonialsData && testimonialsData.length > 0) {
      setReview(testimonialsData[0] as Testimonial);
    }
  }, []);

  if (!review) return null;

  // Get initials for the avatar placeholder
  const initials = review.author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.widget} role="complementary" aria-label="Google Review Widget">
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden="true">
          {initials}
        </div>
        <div className={styles.meta}>
          <span className={styles.name}>{review.author}</span>
          <div className={styles.stars} aria-label="5 out of 5 stars">
            {"★".repeat(review.rating)}
          </div>
        </div>
      </div>
      <p className={styles.text}>
        {review.text}
      </p>
      <div className={styles.footer}>
        <span>Posted on Google</span>
        <div className={styles.googleLogo} aria-hidden="true">
          <span className={styles.gBlue}>G</span>
          <span className={styles.gRed}>o</span>
          <span className={styles.gYellow}>o</span>
          <span className={styles.gBlue}>g</span>
          <span className={styles.gGreen}>l</span>
          <span className={styles.gRed}>e</span>
        </div>
      </div>
    </div>
  );
}
