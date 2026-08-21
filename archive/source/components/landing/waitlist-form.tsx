"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import type { LeadInterest, LeadSource } from "./types";
import { sendTelemetry } from "./telemetry";
import styles from "@/styles/landing.module.css";

type FormState = "idle" | "submitting" | "success" | "error";

interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

interface ApiSuccess {
  created: boolean;
  message: string;
}

interface FieldErrors {
  email?: string;
  consent?: string;
  general?: string;
}

interface WaitlistFormProps {
  source: LeadSource;
  compact?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiError(value: unknown): value is ApiError {
  if (!isRecord(value) || !isRecord(value.error)) return false;
  return typeof value.error.code === "string" && typeof value.error.message === "string";
}

function isApiSuccess(value: unknown): value is ApiSuccess {
  return isRecord(value) && typeof value.created === "boolean" && typeof value.message === "string";
}

export function WaitlistForm({ source, compact = false }: WaitlistFormProps) {
  const emailId = useId();
  const interestId = useId();
  const consentId = useId();
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [cooldown, setCooldown] = useState(0);
  const openedRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function trackFirstFocus() {
    if (openedRef.current) return;
    openedRef.current = true;
    sendTelemetry({ name: "lead_form_open", source });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting" || cooldown > 0) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const interestValue = data.get("interest");
    const interest = typeof interestValue === "string" && interestValue !== ""
      ? interestValue as LeadInterest
      : null;

    setState("submitting");
    setMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          source,
          interest,
          consentGranted: data.get("consent") === "on",
          locale: "vi",
        }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (response.status === 201 && isApiSuccess(payload)) {
        setState("success");
        setMessage(payload.message);
        form.reset();
        sendTelemetry({ name: "lead_submitted", source });
        return;
      }

      if (isApiError(payload)) {
        const nextErrors: FieldErrors = {};
        if (payload.error.field === "email") nextErrors.email = payload.error.message;
        else if (payload.error.field === "consent") nextErrors.consent = payload.error.message;
        else nextErrors.general = payload.error.message;
        setErrors(nextErrors);
        setMessage(payload.error.message);
        setState("error");
        if (payload.error.code === "rate_limited") setCooldown(60);
        return;
      }

      setErrors({ general: "Không thể hoàn tất yêu cầu. Vui lòng thử lại." });
      setMessage("Không thể hoàn tất yêu cầu. Vui lòng thử lại.");
      setState("error");
    } catch {
      setErrors({ general: "Không thể kết nối. Vui lòng thử lại." });
      setMessage("Không thể kết nối. Vui lòng thử lại.");
      setState("error");
    }
  }

  const disabled = state === "submitting" || cooldown > 0;
  const emailErrorId = errors.email ? `${emailId}-error` : undefined;
  const consentErrorId = errors.consent ? `${consentId}-error` : undefined;

  return (
    <form
      className={`${styles.waitlistForm}${compact ? ` ${styles.waitlistCompact}` : ""}`}
      action="/api/leads"
      method="post"
      onFocusCapture={trackFirstFocus}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor={emailId}>Email của bạn</label>
          <input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={320}
            placeholder="tenban@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={emailErrorId}
            required
          />
          {errors.email && <span className={styles.fieldError} id={emailErrorId}>{errors.email}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor={interestId}>Bạn quan tâm đến</label>
          <select id={interestId} name="interest" defaultValue="">
            <option value="">Chọn sau</option>
            <option value="beginner">Học Tarot từ đầu</option>
            <option value="reader">Đọc bài chuyên sâu</option>
            <option value="collector">Sưu tầm</option>
            <option value="gift">Làm quà tặng</option>
          </select>
        </div>

        <button className={styles.submitButton} type="submit" disabled={disabled}>
          {state === "submitting" && <span className={styles.spinner} aria-hidden="true" />}
          {cooldown > 0 ? `Thử lại sau ${cooldown}s` : state === "submitting" ? "Đang gửi" : "Tham gia danh sách chờ"}
        </button>
      </div>

      <div className={styles.consentRow}>
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={consentErrorId}
        />
        <label htmlFor={consentId}>Tôi đồng ý nhận email cập nhật về Hường Đông Tarot.</label>
      </div>
      {errors.consent && <span className={styles.fieldError} id={consentErrorId}>{errors.consent}</span>}

      {message && (
        <p className={state === "success" ? styles.formSuccess : styles.formError} role="status">
          {message}
        </p>
      )}
      <noscript><p className={styles.formError}>Vui lòng bật JavaScript để gửi biểu mẫu theo định dạng bảo mật của hệ thống.</p></noscript>
    </form>
  );
}
