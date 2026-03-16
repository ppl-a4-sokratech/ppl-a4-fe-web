"use client";

import { useMemo, useState } from "react";
import {
  BehavioralAnalyzer,
  useBehavioral,
  type BehavioralFlags,
  type BehavioralPayload,
} from "@ppl-sokratech-sdk/ppl-a4-sdk-web";

const FLAG_LABELS: Record<keyof BehavioralFlags, string> = {
  isMouseJump: "Mouse jumps",
  isMouseLinearMovement: "Linear mouse movement",
  isMouseConstantSpeed: "Constant mouse speed",
  isClickTooFast: "Clicks too fast",
  isClickIntervalConstant: "Constant click interval",
  isTypingTooFast: "Typing too fast",
  isTypingConstantSpeed: "Constant typing speed",
  isNoTypingError: "No typing errors",
  isPasteInsteadOfTyping: "Paste instead of typing",
  isKeyboardBurst: "Keyboard burst",
};

export function BehavioralAnalyzerDemo() {
  const { drain } = useBehavioral();
  const analyzer = useMemo(() => new BehavioralAnalyzer(), []);

  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [flags, setFlags] = useState<BehavioralFlags | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleAnalyze = () => {
    const nextPayload = drain();
    if (!nextPayload) {
      setMessage("No behavioral payload is available yet.");
      setPayload(null);
      setFlags(null);
      return;
    }

    const nextFlags = analyzer.analyze(nextPayload);

    setMessage(null);
    setPayload(nextPayload);
    setFlags(nextFlags);
    setAnalysisCount((count) => count + 1);
  };

  const activeFlags = flags
    ? (Object.entries(flags).filter(([, value]) => value) as [keyof BehavioralFlags, boolean][])
    : [];

  return (
    <div>
      <h2 style={styles.heading}>Behavioral Analyzer</h2>
      <p style={styles.desc}>
        This demo uses the React adapter to drain captured behavioral events, then runs the payload through{" "}
        <code>BehavioralAnalyzer</code> to flag automation-like patterns.
      </p>

      <div style={styles.interactionArea}>
        <p style={styles.helperText}>
          Move the mouse, click a few times, type into the fields, then run the analyzer.
        </p>
        <div style={styles.inputGroup}>
          <input type="text" placeholder="Type naturally here" style={styles.input} />
          <textarea placeholder="Or paste text here" rows={4} style={styles.textarea} />
        </div>
      </div>

      <button onClick={handleAnalyze} style={styles.button}>
        Analyze Current Session
      </button>

      {message && <p style={styles.message}>{message}</p>}

      {payload && flags && (
        <div style={styles.results}>
          <h3 style={styles.subheading}>
            Analysis #{analysisCount} at {new Date(payload.capturedAt).toLocaleTimeString()}
          </h3>

          <div style={styles.statRow}>
            <Stat label="Mouse Events" value={payload.mouseEvents.length} />
            <Stat label="Key Events" value={payload.keyEvents.length} />
            <Stat label="Paste Events" value={payload.pasteEvents.length} />
            <Stat label="Flags Raised" value={activeFlags.length} tone={activeFlags.length > 0 ? "alert" : "ok"} />
          </div>

          <div style={styles.flagGrid}>
            {(Object.entries(FLAG_LABELS) as [keyof BehavioralFlags, string][]).map(([key, label]) => {
              const detected = flags[key];
              return (
                <div
                  key={key}
                  style={{
                    ...styles.flagCard,
                    borderColor: detected ? "#e53935" : "#43a047",
                    background: detected ? "#fff5f5" : "#f6fff7",
                  }}
                >
                  <div style={styles.flagHeader}>
                    <span style={{ fontSize: "1.1rem" }}>{detected ? "ALERT" : "OK"}</span>
                    <strong>{label}</strong>
                  </div>
                  <p style={styles.flagKey}>{key}</p>
                </div>
              );
            })}
          </div>

          <details style={styles.details}>
            <summary>Analyzer Flags (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(flags, null, 2)}</pre>
          </details>

          <details style={styles.details}>
            <summary>Behavioral Payload (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(payload, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: number;
  tone?: "primary" | "ok" | "alert";
}) {
  const color =
    tone === "alert" ? "#e53935" : tone === "ok" ? "#43a047" : "#4361ee";

  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: "clamp(1.1rem, 2.4vw, 1.3rem)", marginBottom: "0.5rem" },
  desc: { color: "#555", lineHeight: 1.6, fontSize: "0.95rem" },
  interactionArea: {
    border: "2px dashed #ccc",
    borderRadius: 8,
    padding: "clamp(0.9rem, 3vw, 1.5rem)",
    marginBottom: "1rem",
  },
  helperText: { margin: "0 0 1rem", color: "#666" },
  inputGroup: { display: "grid", gap: "0.75rem" },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
  },
  button: {
    padding: "0.6rem 1.4rem",
    fontSize: "0.95rem",
    backgroundColor: "#4361ee",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    width: "100%",
    maxWidth: 240,
  },
  message: { marginTop: "0.75rem", color: "#b45309", fontSize: "0.9rem" },
  results: { marginTop: "1.5rem" },
  subheading: { fontSize: "1rem", marginBottom: "0.75rem" },
  statRow: { display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#f4f4f8",
    padding: "0.75rem 1rem",
    borderRadius: 8,
    flex: "1 1 140px",
  },
  statValue: { fontSize: "1.5rem", fontWeight: 700 },
  statLabel: { fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" },
  flagGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  flagCard: {
    border: "2px solid",
    borderRadius: 8,
    padding: "0.9rem",
    minWidth: 0,
  },
  flagHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  flagKey: {
    margin: 0,
    color: "#666",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    wordBreak: "break-word",
  },
  details: { marginTop: "0.75rem" },
  pre: {
    background: "#1a1a2e",
    color: "#a5d6a7",
    padding: "1rem",
    borderRadius: 6,
    fontSize: "0.8rem",
    overflow: "auto",
    maxHeight: 320,
  },
};
