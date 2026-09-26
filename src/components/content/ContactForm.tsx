"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  supportEmail: string;
};

type FormStatus = {
  message: string;
  type: "idle" | "success" | "error";
};

const initialStatus: FormStatus = { message: "", type: "idle" };

export function ContactForm({ supportEmail }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>(initialStatus);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    if (String(formData.get("_honey") ?? "").trim()) {
      form.reset();
      setStatus({ message: "Thank you. Your enquiry has been prepared.", type: "success" });
      return;
    }

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const orderNumber = String(formData.get("orderNumber") ?? "").trim();
    const topic = String(formData.get("topic") ?? "General enquiry").trim();
    const message = String(formData.get("message") ?? "").trim();

    const subject = `${topic} enquiry from ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      orderNumber ? `Order number: ${orderNumber}` : "Order number: Not provided",
      `Topic: ${topic}`,
      "",
      "Message:",
      message,
    ].join("\n");

    setStatus({
      message: `Opening your email app. Please send the prepared message to ${supportEmail}.`,
      type: "success",
    });
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const fieldClassName =
    "rounded-xl border border-border bg-background px-4 py-3 font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor="contact-name">
          Full name
          <input
            className={fieldClassName}
            id="contact-name"
            name="name"
            autoComplete="name"
            maxLength={100}
            required
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor="contact-email">
          Email address
          <input
            className={fieldClassName}
            id="contact-email"
            name="email"
            autoComplete="email"
            maxLength={254}
            required
            type="email"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor="contact-order">
          Order number <span className="font-normal text-muted-foreground">(optional)</span>
          <input
            className={fieldClassName}
            id="contact-order"
            name="orderNumber"
            autoComplete="off"
            maxLength={50}
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor="contact-topic">
          How can we help?
          <select className={fieldClassName} id="contact-topic" name="topic" required defaultValue="">
            <option value="" disabled>
              Select a topic
            </option>
            <option value="Product information">Product information</option>
            <option value="Order support">Order support</option>
            <option value="Delivery question">Delivery question</option>
            <option value="Return or refund">Return or refund</option>
            <option value="Account support">Account support</option>
            <option value="General enquiry">General enquiry</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor="contact-message">
        Message
        <textarea
          className={`${fieldClassName} min-h-40 resize-y`}
          id="contact-message"
          name="message"
          maxLength={2000}
          required
          rows={6}
        />
      </label>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="contact-company">Leave this field empty</label>
        <input id="contact-company" name="_honey" autoComplete="off" tabIndex={-1} type="text" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Prepare email
        </button>
        <p className="text-sm leading-6 text-muted-foreground">
          This opens your email app so you can review the message before sending.
        </p>
      </div>

      <p
        aria-live="polite"
        className={status.type === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        role="status"
      >
        {status.message}
      </p>
    </form>
  );
}
