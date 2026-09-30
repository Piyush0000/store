"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Minus, HelpCircle } from "lucide-react";
import "./FaqSection.css";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive?: boolean;
}

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  headingColor?: string;
  faqs?: FaqItem[];
  displayStyle?: "accordion" | "cards" | "grid";
}

export default function FaqSection({
  title = "Frequently Asked Questions",
  subtitle = "Have questions? We're here to help you with everything you need to know.",
  headingColor,
  faqs = [],
  displayStyle = "accordion",
}: FaqSectionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // First item open by default

  const activeFaqs = faqs.filter((faq) => faq.isActive !== false);

  if (!activeFaqs || activeFaqs.length === 0) {
    return null;
  }

  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="faq-section-container" aria-label="Frequently Asked Questions">
      <div className="faq-section-wrapper">
        {/* Header */}
        <div className="faq-section-header">
          <div className="faq-section-badge">
            <HelpCircle size={14} className="faq-badge-icon" />
            <span>Got Questions?</span>
          </div>
          {title && (
            <h2
              className="faq-section-title"
              style={headingColor ? { color: headingColor } : undefined}
            >
              {title}
            </h2>
          )}
          {subtitle && <p className="faq-section-subtitle">{subtitle}</p>}
        </div>

        {/* Accordion List */}
        <div className="faq-accordion-list">
          {activeFaqs.map((faq, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={faq.id || index}
                className={`faq-item-card ${isOpen ? "faq-item-card--open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <span className="faq-toggle-icon-wrap">
                    <ChevronDown
                      size={18}
                      className={`faq-chevron ${isOpen ? "faq-chevron--rotated" : ""}`}
                    />
                  </span>
                </button>
                <div
                  className={`faq-answer-collapse ${isOpen ? "faq-answer-collapse--open" : ""}`}
                >
                  <div className="faq-answer-inner">
                    <p className="faq-answer-text">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
