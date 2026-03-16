"use client";

import { useMemo } from "react";

export type AuthDebugPayload = {
  behavioral: unknown;
  fingerprint: unknown;
  detection: unknown;
};

type AuthDebugModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  payload: AuthDebugPayload | null;
};

const MAX_BLOCK_CHARS = 12000;

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return JSON.stringify({ error: "Failed to stringify debug data" }, null, 2);
  }
}

function truncateJson(value: unknown, maxChars = MAX_BLOCK_CHARS) {
  const raw = safeStringify(value);
  if (raw.length <= maxChars) {
    return { text: raw, truncated: false, omittedChars: 0 };
  }

  return {
    text: `${raw.slice(0, maxChars)}\n... <truncated ${raw.length - maxChars} chars>`,
    truncated: true,
    omittedChars: raw.length - maxChars,
  };
}

function getEventsBlock(behavioral: unknown) {
  const emptyEvents = {
    mouseEvents: [],
    keyEvents: [],
    pasteEvents: [],
  };

  if (!behavioral || typeof behavioral !== "object") {
    return emptyEvents;
  }

  const source = behavioral as Record<string, unknown>;

  return {
    mouseEvents: Array.isArray(source.mouseEvents) ? source.mouseEvents : [],
    keyEvents: Array.isArray(source.keyEvents) ? source.keyEvents : [],
    pasteEvents: Array.isArray(source.pasteEvents) ? source.pasteEvents : [],
    capturedAt: source.capturedAt ?? null,
  };
}

export function AuthDebugModal({ isOpen, onClose, title, payload }: AuthDebugModalProps) {
  const eventsJson = useMemo(() => truncateJson(getEventsBlock(payload?.behavioral)), [payload]);
  const fingerprintJson = useMemo(() => truncateJson(payload?.fingerprint ?? null), [payload]);
  const detectionJson = useMemo(() => truncateJson(payload?.detection ?? null), [payload]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} debug details`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Debug Data</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {title} debug payload grouped into 3 JSON blocks for easier demo walkthrough.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <DebugSection
            title="Events"
            subtitle="mouse events, key events, paste events"
            jsonText={eventsJson.text}
            isTruncated={eventsJson.truncated}
            omittedChars={eventsJson.omittedChars}
          />
          <DebugSection
            title="Fingerprint"
            subtitle="full fingerprint data captured from SDK"
            jsonText={fingerprintJson.text}
            isTruncated={fingerprintJson.truncated}
            omittedChars={fingerprintJson.omittedChars}
          />
          <DebugSection
            title="Detection Result"
            subtitle="analysis and detection summary"
            jsonText={detectionJson.text}
            isTruncated={detectionJson.truncated}
            omittedChars={detectionJson.omittedChars}
          />
        </div>
      </div>
    </div>
  );
}

type DebugSectionProps = {
  title: string;
  subtitle: string;
  jsonText: string;
  isTruncated: boolean;
  omittedChars: number;
};

function DebugSection({ title, subtitle, jsonText, isTruncated, omittedChars }: DebugSectionProps) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h4 className="text-base font-semibold">{title}</h4>
        {isTruncated && (
          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
            Truncated ({omittedChars} chars omitted)
          </span>
        )}
      </div>
      <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      <pre className="max-h-72 overflow-auto rounded-md bg-zinc-950 p-3 text-xs text-zinc-100">
        <code>{jsonText}</code>
      </pre>
    </section>
  );
}
