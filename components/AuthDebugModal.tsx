"use client";

import { useMemo } from "react";

export type AuthDebugPayload = {
  behavioral: unknown;
  fingerprint: unknown;
  detection: unknown;
  analysis: unknown;
  ingestRequest?: unknown;
  ingestResponse?: unknown;
};

type AuthDebugModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  payload: AuthDebugPayload | null;
};

const MAX_VALUE_CHARS = 500;

type TruncationStats = {
  truncatedValues: number;
  omittedChars: number;
};

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return JSON.stringify({ error: "Failed to stringify debug data" }, null, 2);
  }
}

function truncateValueByLength(value: unknown, stats: TruncationStats, seen: WeakSet<object>): unknown {
  if (typeof value === "string") {
    if (value.length <= MAX_VALUE_CHARS) {
      return value;
    }

    const omitted = value.length - MAX_VALUE_CHARS;
    stats.truncatedValues += 1;
    stats.omittedChars += omitted;
    return `${value.slice(0, MAX_VALUE_CHARS)}... <truncated ${omitted} chars>`;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => truncateValueByLength(item, stats, seen));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(source)) {
    result[key] = truncateValueByLength(nestedValue, stats, seen);
  }

  seen.delete(value);

  return result;
}

function truncateJson(value: unknown) {
  const stats: TruncationStats = { truncatedValues: 0, omittedChars: 0 };
  const sanitized = truncateValueByLength(value, stats, new WeakSet<object>());

  return {
    text: safeStringify(sanitized),
    truncated: stats.truncatedValues > 0,
    omittedChars: stats.omittedChars,
    truncatedValues: stats.truncatedValues,
  };
}

export function AuthDebugModal({ isOpen, onClose, title, payload }: AuthDebugModalProps) {
  const eventsJson = useMemo(() => truncateJson(payload?.behavioral ?? null), [payload]);
  const fingerprintJson = useMemo(() => truncateJson(payload?.fingerprint ?? null), [payload]);
  const detectionJson = useMemo(() => truncateJson(payload?.detection ?? null), [payload]);
  const ingestRequestJson = useMemo(() => truncateJson(payload?.ingestRequest ?? null), [payload]);
  const ingestResponseJson = useMemo(() => truncateJson(payload?.ingestResponse ?? null), [payload]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 pt-6 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} debug details`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl sm:p-5 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div>
            <h3 className="text-lg font-semibold sm:text-xl">Debug Data</h3>
            <p className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
              {title} debug payload grouped into 4 JSON blocks for easier demo walkthrough.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-zinc-300 px-3 py-1 text-sm font-medium hover:bg-zinc-100 sm:w-auto dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <DebugSection
            title="Events"
            subtitle="behavioral payload sent to ingest"
            jsonText={eventsJson.text}
            isTruncated={eventsJson.truncated}
            omittedChars={eventsJson.omittedChars}
            truncatedValues={eventsJson.truncatedValues}
          />
          <DebugSection
            title="Fingerprint"
            subtitle="fingerprint payload sent to ingest"
            jsonText={fingerprintJson.text}
            isTruncated={fingerprintJson.truncated}
            omittedChars={fingerprintJson.omittedChars}
            truncatedValues={fingerprintJson.truncatedValues}
          />
          <DebugSection
            title="Detection Result"
            subtitle="detection payload sent to ingest"
            jsonText={detectionJson.text}
            isTruncated={detectionJson.truncated}
            omittedChars={detectionJson.omittedChars}
            truncatedValues={detectionJson.truncatedValues}
          />
          <DebugSection
            title="Ingest Request"
            subtitle="payload sent to POST /ingest"
            jsonText={ingestRequestJson.text}
            isTruncated={ingestRequestJson.truncated}
            omittedChars={ingestRequestJson.omittedChars}
            truncatedValues={ingestRequestJson.truncatedValues}
          />
          <DebugSection
            title="Ingest Response"
            subtitle="response returned from ingest endpoint or mock"
            jsonText={ingestResponseJson.text}
            isTruncated={ingestResponseJson.truncated}
            omittedChars={ingestResponseJson.omittedChars}
            truncatedValues={ingestResponseJson.truncatedValues}
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
  truncatedValues: number;
};

function DebugSection({
  title,
  subtitle,
  jsonText,
  isTruncated,
  omittedChars,
  truncatedValues,
}: DebugSectionProps) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold sm:text-base">{title}</h4>
        {isTruncated && (
          <span className="rounded bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800 sm:text-xs">
            Truncated ({truncatedValues} value(s), {omittedChars} chars omitted)
          </span>
        )}
      </div>
      <p className="mb-2 text-[11px] text-zinc-600 sm:text-xs dark:text-zinc-400">{subtitle}</p>
      <pre className="max-h-56 overflow-auto rounded-md bg-zinc-950 p-3 text-[11px] text-zinc-100 sm:max-h-72 sm:text-xs">
        <code>{jsonText}</code>
      </pre>
    </section>
  );
}
