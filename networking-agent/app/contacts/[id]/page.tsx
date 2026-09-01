// app/contacts/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Contact = {
  id: string;
  name: string;
  event_name: string | null;
  met_at: string | null;
  company: string | null;
  narrative: string | null;
  spark_strength: number | null;
  commitment_signals: { category: string; quote: string; reasoning: string }[];
};

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`/api/contacts/${id}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setContact(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load this contact.");
      } finally {
        setLoading(false);
      }
    }

    fetchContact();
  }, [id]);

  function metaSentence(contact: Contact) {
    if (contact.event_name && contact.met_at) {
      return `Met at ${contact.event_name} on ${new Date(contact.met_at).toLocaleDateString()}.`;
    }
    if (contact.event_name) {
      return `Met at ${contact.event_name}.`;
    }
    if (contact.met_at) {
      return `Met on ${new Date(contact.met_at).toLocaleDateString()}.`;
    }
    return null;
  }

  return (
    <main className="page">
      <div className="content">
        <Link href="/" className="back-link">
          Home
        </Link>

        {loading && <p className="sub">Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {contact && (
          <>
            <h1>{contact.name}</h1>
            <p className="meta-sentence">
              {metaSentence(contact)}
              {contact.company ? ` Works at ${contact.company}.` : ""}
            </p>

            {contact.narrative && (
              <div className="group">
                <div className="row block-row last">
                  <span className="row-label">Narrative</span>
                  <p className="narrative">{contact.narrative}</p>
                </div>
              </div>
            )}

            <div className="cards-grid">
              {contact.spark_strength !== null && (
                <div className="group">
                  <div className="row block-row last">
                    <span className="row-label">Spark strength</span>
                    <div className="spark-bar">
                      <div
                        className="spark-fill"
                        style={{ width: `${(contact.spark_strength / 10) * 100}%` }}
                      />
                    </div>
                    <span className="spark-number">{contact.spark_strength} / 10</span>
                  </div>
                </div>
              )}

              {contact.commitment_signals &&
                contact.commitment_signals.map((signal, i) => (
                  <div key={i} className="group">
                    <div className="row block-row last">
                      <span className="row-label">Signal detected</span>
                      <div className="signal">
                        <span className="signal-category">{signal.category}</span>
                        <p className="signal-quote">{`\u201c${signal.quote}\u201d`}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {!contact.narrative && (
              <p className="sub">No recording captured for this contact yet.</p>
            )}
          </>
        )}
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
          max-width: 760px;
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
          font-size: 2.1rem;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .meta-sentence {
          color: var(--fg-soft);
          font-size: 0.95rem;
          margin: 0 0 28px;
        }

        .group {
          background: var(--card-bg);
          border-radius: 14px;
          padding: 0 16px;
          margin-bottom: 16px;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .cards-grid .group {
          margin-bottom: 0;
        }

        .row {
          padding: 16px 0;
        }

        .row.block-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .row-label {
          display: block;
          font-size: 0.85rem;
          color: var(--fg-soft);
          margin-bottom: 8px;
        }

        .narrative {
          margin: 0;
          font-size: 0.98rem;
          line-height: 1.6;
          color: var(--fg);
        }

        .spark-bar {
          width: 100%;
          height: 8px;
          background: var(--page-bg);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .spark-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 4px;
        }

        .spark-number {
          font-size: 0.9rem;
          color: var(--fg-soft);
          font-variant-numeric: tabular-nums;
        }

        .sub {
          color: var(--fg-soft);
          font-size: 0.95rem;
        }

        .error-text {
          color: var(--record-red);
          font-size: 0.95rem;
        }

        .signal {
          border-left: 2px solid var(--accent);
          padding-left: 12px;
          margin-bottom: 12px;
        }

        .signal:last-child {
          margin-bottom: 0;
        }

        .signal-category {
          display: inline-block;
          font-size: 0.78rem;
          color: var(--accent);
          font-weight: 500;
          margin-bottom: 2px;
        }

        .signal-quote {
          margin: 0;
          font-size: 0.88rem;
          color: var(--fg-soft);
          font-style: italic;
        }
      `}</style>
    </main>
  );
}