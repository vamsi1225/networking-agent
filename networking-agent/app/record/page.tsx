// app/record/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Stage = "idle" | "recording" | "transcribing" | "extracting" | "done";

type CommitmentSignal = {
  category: string;
  quote: string;
  reasoning: string;
};

type Extraction = {
  name: string | null;
  company: string | null;
  narrative: string;
  sparkStrength: number;
  commitmentSignals: CommitmentSignal[];
};

export default function RecordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contactId = searchParams.get("contactId");

  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage === "recording") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  function formatTime(total: number) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = handleStop;

    recorder.start();
    mediaRecorderRef.current = recorder;
    setSeconds(0);
    setExtraction(null);
    setError(null);
    setAudioUrl(null);
    setStage("recording");
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function handleStop() {
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    setAudioUrl(URL.createObjectURL(audioBlob));
    setStage("transcribing");

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    let transcript = "";
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      transcript = data.transcript || "";
    } catch (err) {
      console.error("Transcription failed:", err);
      setError("Something went wrong during transcription.");
      setStage("done");
      return;
    }

    if (!transcript) {
      setError("No speech detected — try recording again.");
      setStage("done");
      return;
    }

    setStage("extracting");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStage("done");
        return;
      }

      setExtraction(data);

      if (contactId) {
        await fetch(`/api/contacts/${contactId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            narrative: data.narrative,
            company: data.company,
            sparkStrength: data.sparkStrength,
            commitmentSignals: data.commitmentSignals,
          }),
        });

        router.push(`/contacts/${contactId}`);
        return;
      }
    } catch (err) {
      console.error("Extraction failed:", err);
      setError("Something went wrong while making sense of the conversation.");
    } finally {
      setStage("done");
    }
  }

  function reset() {
    setStage("idle");
    setSeconds(0);
    setExtraction(null);
    setError(null);
    setAudioUrl(null);
  }

  return (
    <main className="page">
      <div className="content">
        <Link href="/" className="back-link">
          Back
        </Link>

        <h1>Capture this one</h1>
        <p className="sub">
          {stage === "idle" && "Talk through who you just met, like you're texting a friend."}
          {stage === "recording" && "Listening — tap stop when you're done."}
          {stage === "transcribing" && "Writing down what you said."}
          {stage === "extracting" && "Making sense of the conversation."}
          {stage === "done" && "Here's what was captured."}
        </p>

        <div className="stage-area">
          <button
            className={`record-button ${stage}`}
            onClick={stage === "recording" ? stopRecording : startRecording}
            disabled={stage === "transcribing" || stage === "extracting"}
            aria-label={stage === "recording" ? "Stop recording" : "Start recording"}
          >
            {stage === "recording" ? (
              <span className="icon stop-icon" />
            ) : stage === "transcribing" || stage === "extracting" ? (
              <span className="spinner" />
            ) : (
              <span className="icon rest-icon" />
            )}
          </button>

          {stage === "recording" && (
            <div className="recording-meta">
              <div className="waveform" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
              <span className="timer">{formatTime(seconds)}</span>
            </div>
          )}
        </div>

        {stage === "done" && (
          <div className="results">
            {error && <p className="error-text">{error}</p>}

            {audioUrl && (
              <div className="group">
                <div className="row last">
                  <span className="row-label">Playback</span>
                  <audio className="player" controls src={audioUrl} />
                </div>
              </div>
            )}

            {extraction && (
              <div className="group">
                <div className="row">
                  <span className="row-label">Contact</span>
                  <span className="row-value">
                    {extraction.name || "Unnamed"}
                    {extraction.company ? `, ${extraction.company}` : ""}
                  </span>
                </div>

                <div className="row block-row">
                  <span className="row-label">Narrative</span>
                  <p className="narrative-text">{extraction.narrative}</p>
                </div>

                <div className="row">
                  <span className="row-label">Spark strength</span>
                  <span className="row-value">{extraction.sparkStrength} / 10</span>
                </div>

                {extraction.commitmentSignals.length > 0 && (
                  <div className="row block-row last">
                    <span className="row-label">Signals detected</span>
                    {extraction.commitmentSignals.map((signal, i) => (
                      <div key={i} className="signal">
                        <span className="signal-category">{signal.category}</span>
                        <p className="signal-quote">{`\u201c${signal.quote}\u201d`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="secondary" onClick={reset}>
              Record another
            </button>
          </div>
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
          --record-red-dim: rgba(255, 59, 48, 0.18);
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
          max-width: 440px;
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
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .sub {
          color: var(--fg-soft);
          font-size: 0.98rem;
          line-height: 1.5;
          margin: 0 0 40px;
          min-height: 24px;
        }

        .stage-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 8px;
        }

        .record-button {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: var(--record-red);
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .record-button:active:not(:disabled) {
          transform: scale(0.96);
        }

        .record-button:disabled {
          cursor: default;
          opacity: 0.6;
        }

        .record-button.recording {
          animation: record-pulse 1.6s ease-out infinite;
        }

        @keyframes record-pulse {
          0% {
            box-shadow: 0 0 0 0 var(--record-red-dim);
          }
          100% {
            box-shadow: 0 0 0 22px rgba(255, 59, 48, 0);
          }
        }

        .icon.rest-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
        }

        .icon.stop-icon {
          width: 24px;
          height: 24px;
          background: #ffffff;
          border-radius: 5px;
        }

        .spinner {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .recording-meta {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .waveform {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 16px;
        }

        .waveform span {
          width: 3px;
          height: 5px;
          background: var(--record-red);
          border-radius: 2px;
          animation: bar 0.9s ease-in-out infinite;
        }

        @keyframes bar {
          0%,
          100% {
            height: 5px;
          }
          50% {
            height: 16px;
          }
        }

        .timer {
          font-variant-numeric: tabular-nums;
          color: var(--fg-soft);
          font-size: 0.9rem;
        }

        .results {
          margin-top: 40px;
        }

        .group {
          background: var(--card-bg);
          border-radius: 14px;
          padding: 0 16px;
          margin-bottom: 20px;
        }

        .row {
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .row.last {
          border-bottom: none;
        }

        .row.block-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .row-label {
          font-size: 0.85rem;
          color: var(--fg-soft);
          flex-shrink: 0;
        }

        .row.block-row .row-label {
          margin-bottom: 8px;
        }

        .row-value {
          font-size: 0.95rem;
          color: var(--fg);
          text-align: right;
        }

        .player {
          width: 100%;
          height: 36px;
        }

        .narrative-text {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--fg);
        }

        .error-text {
          margin: 0 0 16px;
          font-size: 0.9rem;
          color: var(--record-red);
        }

        .signal {
          border-left: 2px solid var(--accent);
          padding-left: 10px;
          margin-bottom: 10px;
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

        .secondary {
          display: block;
          width: 100%;
          background: var(--card-bg);
          border: none;
          color: var(--accent);
          padding: 14px 24px;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 500;
          font-family: var(--font-system);
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}