// app/page.tsx

"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <div className="hero">
        <h1>Career Spark</h1>
        <p className="tagline">
          Great professional conversations shouldn&apos;t end at &quot;let&apos;s stay in touch.&quot;
        </p>
        <p className="sub">
          You meet someone at a conference, a meetup, or a networking event. The
          conversation is real, they mention a role opening up, offer to make an intro,
          or you agree to reconnect in a few weeks. Then work gets busy, and that
          opportunity quietly disappears into your contacts list.
        </p>
        <p className="closing">Career Spark makes sure it doesn&apos;t.</p>

        <Link
          href="/contacts/new"
          className="cta"
          style={{
            display: "inline-block",
            background: "#007aff",
            color: "#ffffff",
            textDecoration: "none",
            padding: "14px 28px",
            borderRadius: "980px",
            fontSize: "1rem",
            fontWeight: 600,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
          }}
        >
          Add a new connection
        </Link>
      </div>

      <div className="phases">
        <div className="phase-card">
          <span className="phase-label live">Live now</span>
          <p className="phase-text">
            You can record a conversation right after it happens, and Career Spark
            transcribes it and pulls out the story, who you talked to, what mattered,
            and any commitments made along the way. No forms, no dropdowns. Just talk,
            and it listens for the details that count: a job opening mentioned in
            passing, an offer to make an intro, a specific &quot;let&apos;s check in again in a
            few weeks.&quot;
          </p>
        </div>

        <div className="phase-card">
          <span className="phase-label">Coming next</span>
          <p className="phase-text">
            Relationship warmth that actually reflects reality. Not every connection
            cools at the same rate. A casual &quot;nice meeting you&quot; fades fast, but a
            concrete offer, like someone promising to send over a job posting, should
            hold its value much longer. We&apos;re building a warmth score for every
            contact that starts strong after a great conversation, decays naturally
            over time, and treats real commitments as anchors rather than just a
            temporary boost.
          </p>
        </div>

        <div className="phase-card">
          <span className="phase-label">After that</span>
          <p className="phase-text">
            A follow-up agent that knows when to nudge you. Instead of a generic
            reminder to check in, the agent will look at your relationship history,
            recent warmth score, and even company news, then decide whether, and how,
            you should reach out. It&apos;ll draft the message, but the decision to act is
            informed, not scheduled.
          </p>
        </div>
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
          padding: 80px 24px 40px;
          font-family: var(--font-system);
          color: var(--fg);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero {
          text-align: center;
          max-width: 560px;
          margin-bottom: 40px;
        }

        h1 {
          font-weight: 700;
          font-size: 3.2rem;
          margin: 0 0 12px;
          letter-spacing: -0.03em;
        }

        .tagline {
          font-size: 1.2rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0 0 16px;
          letter-spacing: -0.01em;
        }

        .sub {
          color: var(--fg-soft);
          font-size: 1.05rem;
          line-height: 1.6;
          margin: 0 auto 20px;
          max-width: 480px;
        }

        .closing {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--fg);
          margin: 0 0 32px;
          letter-spacing: -0.01em;
        }

        .cta {
          display: inline-block;
          background: var(--accent);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 980px;
          font-size: 1rem;
          font-weight: 600;
          transition: opacity 0.15s ease;
        }

        .cta:hover {
          opacity: 0.85;
        }

        .phases {
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 760px) {
          .phases {
            grid-template-columns: 1fr;
          }
        }

        .phase-card {
          background: var(--card-bg);
          border-radius: 18px;
          padding: 22px 24px;
          text-align: left;
          display: flex;
          flex-direction: column;
        }

        .phase-label {
          display: inline-block;
          flex-shrink: 0;
          font-size: 0.78rem;
          font-weight: 600;
          text-align: center;
          color: var(--fg-soft);
          background: var(--page-bg);
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 12px;
        }

        .phase-label.live {
          color: #ffffff;
          background: var(--accent);
        }

        .phase-text {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--fg-soft);
        }
      `}</style>
    </main>
  );
}