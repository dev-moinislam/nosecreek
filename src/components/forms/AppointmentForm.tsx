"use client";

import React, { useState } from "react";
import styles from "./AppointmentForm.module.css";

interface AppointmentFormProps {
  onSuccessClose?: () => void;
}

export default function AppointmentForm({ onSuccessClose }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    service: ""
  });

  const [status, setStatus] = useState<{
    type: "idle" | "submitting" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "submitting" });

    // Validate inputs
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      setStatus({
        type: "error",
        message: "Please fill in all the required fields."
      });
      return;
    }

    try {
      // Simulate API call to clinical trials or appointments system
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setStatus({
        type: "success",
        message: "Thank you! Your appointment request has been submitted. We will contact you shortly."
      });

      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        service: ""
      });

      // Optionally close the modal after delay
      if (onSuccessClose) {
        setTimeout(() => {
          onSuccessClose();
        }, 3000);
      }
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred. Please try again or call our clinic directly."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 id="pum_popup_title_21613" className={styles.title}>
          Request Appointment
        </h2>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="first_name_input" className={styles.label}>
            First Name *
          </label>
          <input
            type="text"
            id="first_name_input"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className={styles.input}
            required
            disabled={status.type === "submitting"}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="last_name_input" className={styles.label}>
            Last Name *
          </label>
          <input
            type="text"
            id="last_name_input"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className={styles.input}
            required
            disabled={status.type === "submitting"}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="phone_input" className={styles.label}>
            Phone *
          </label>
          <input
            type="tel"
            id="phone_input"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className={styles.input}
            required
            disabled={status.type === "submitting"}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email_input" className={styles.label}>
            Email *
          </label>
          <input
            type="email"
            id="email_input"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={styles.input}
            required
            disabled={status.type === "submitting"}
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label htmlFor="service_select" className={styles.label}>
            Select Service (Optional)
          </label>
          <select
            id="service_select"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className={styles.input}
            disabled={status.type === "submitting"}
          >
            <option value="">-- Choose a Service --</option>
            <option value="physiotherapy">Physiotherapy</option>
            <option value="chiropractic-care">Chiropractic Care</option>
            <option value="sports-rehab">Sports Injury Rehabilitation</option>
            <option value="massage-therapy">Massage Therapy</option>
          </select>
        </div>

        <div className={styles.submitArea}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={status.type === "submitting"}
          >
            {status.type === "submitting" ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>

      {status.type === "success" && (
        <div className={`${styles.message} ${styles.successMessage}`}>
          {status.message}
        </div>
      )}

      {status.type === "error" && (
        <div className={`${styles.message} ${styles.errorMessage}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
