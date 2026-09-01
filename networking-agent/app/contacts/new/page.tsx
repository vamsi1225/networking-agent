// app/contacts/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewContactPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");
  const [metAt, setMetAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, eventName, metAt }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      router.push(`/record?contactId=${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="content">
        <Link href="/" className="back-link">
          Back
        </Link>

        <h1>Who did you meet?</h1>
        <p className="subheading">
          Just the basics for now. In a minute, you&apos;ll tell the real story, in your own
          words.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="group">
            <div className="row">
              <span className="row-label">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bruce Wayne"
              />
            </div>
            <div className="row">
              <span className="row-label">Event</span>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="AI Founders Meetup"
              />
            </div>
            <div className="row last">
              <span className="row-label">Date met</span>
              <input
                type="date"
                value={metAt}
                onChange={(e) => setMetAt(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <p className="reassurance">
            This takes 10 seconds. The details that actually matter come next.
          </p>

          <button type="submit" className="cta" disabled={submitting}>
            {submitting ? "Creating..." : "Continue to recording"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        :root {
          --page-bg: #f2f2f7;
          --card-bg: #ffffff;
          --fg: #1d1d1f;
          --fg-soft: #6e6e73;
          --line: #d1d1d6;
          --accent: #007aff;
          --record-red: #ff3b30;
          --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        body {
          background: var(--page-bg);
          margin: 0;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 60px 24px;
          font-family: var(--font-system);
          color: var(--fg);
          display: flex;
          justify-content: center;
        }

        .content {
          width: 100%;
          max-width: 420px;
        }

        .back-link {
          display: inline-block;
          font-size: 0.95rem;
          color: var(--accent);
          text-decoration: none;
          margin-bottom: 24px;
        }

        h1 {
          font-weight: 700;
          font-size: 1.9rem;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }

        .subheading {
          color: var(--fg-soft);
          font-size: 0.98rem;
          line-height: 1.5;
          margin: 0 0 28px;
        }

        .group {
          background: var(--card-bg);
          border-radius: 14px;
          padding: 0 16px;
          margin-bottom: 24px;
        }

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          gap: 16px;
        }

        .row.last {
          border-bottom: none;
        }

        .row-label {
          font-size: 0.98rem;
          color: var(--fg);
          flex-shrink: 0;
        }

        input {
          font-family: var(--font-system);
          font-size: 0.98rem;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--fg-soft);
          text-align: right;
          width: 100%;
        }

        input:focus {
          outline: none;
          color: var(--fg);
        }

        input::placeholder {
          color: #c7c7cc;
        }

        .error-text {
          margin: 0 0 16px;
          font-size: 0.9rem;
          color: var(--record-red);
        }

        .reassurance {
          text-align: center;
          font-size: 0.85rem;
          color: var(--fg-soft);
          margin: 0 0 16px;
        }

        .cta {
          display: block;
          width: 100%;
          background: var(--accent);
          color: #ffffff;
          border: none;
          padding: 14px 24px;
          border-radius: 980px;
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-system);
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .cta:hover:not(:disabled) {
          opacity: 0.85;
        }

        .cta:disabled {
          opacity: 0.4;
          cursor: default;
        }
      `}</style>
    </main>
  );
}