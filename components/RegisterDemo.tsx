"use client";

import { useState, useEffect } from "react";
import { useBehavioral, useSDKFingerprint, useDetection, useBehavioralAnalysis } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";
import { AuthDebugModal, type AuthDebugPayload } from "@/components/AuthDebugModal";

interface TimingResult {
  analyzeMs: number;
  fingerprintMs: number;
  detectMs: number;
  fetchMs: number;
  cached: boolean;
}

function TimingBreakdown({ t }: { t: TimingResult }) {
  const sdkMs = t.analyzeMs + t.fingerprintMs + t.detectMs;
  const totalMs = sdkMs + t.fetchMs;
  const overheadPct = t.fetchMs > 0 ? ((sdkMs / t.fetchMs) * 100).toFixed(0) : "—";

  const row = (label: string, ms: number, muted = false) => (
    <tr key={label} className={muted ? "text-zinc-400" : ""}>
      <td className="py-1 pr-4 text-sm">{label}</td>
      <td className="py-1 text-right font-mono text-sm font-semibold">{ms.toFixed(2)} ms</td>
    </tr>
  );

  return (
    <div className="mt-3 rounded border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Timing Breakdown
      </p>
      <table className="w-full">
        <tbody>
          {row("Behavioral Analysis", t.analyzeMs, true)}
          {row("Fingerprint Collection", t.fingerprintMs, true)}
          {row("Bot Detection", t.detectMs, true)}
          <tr><td colSpan={2}><hr className="my-1 border-zinc-200 dark:border-zinc-700" /></td></tr>
          {row("SDK Data Collection (subtotal)", sdkMs)}
          {row("API Request (fetch only)", t.fetchMs)}
          <tr><td colSpan={2}><hr className="my-1 border-zinc-200 dark:border-zinc-700" /></td></tr>
          <tr className="font-bold">
            <td className="py-1 pr-4 text-sm">Total with SDK</td>
            <td className="py-1 text-right font-mono text-sm">{totalMs.toFixed(2)} ms</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-500">
        SDK added <span className="font-semibold text-amber-600">{sdkMs.toFixed(2)} ms</span> overhead
        ({overheadPct}% of fetch time) — without SDK the request would take ~
        <span className="font-semibold">{t.fetchMs.toFixed(2)} ms</span>.
      </p>
      <p className="mt-1 text-xs">
        Fingerprint mode:{" "}
        <span className={`font-semibold ${t.cached ? "text-green-600" : "text-blue-600"}`}>
          {t.cached ? "Cache hit (pre-warmed)" : "Fresh collection (no cache)"}
        </span>
      </p>
    </div>
  );
}

export function RegisterDemo() {
  const { drain } = useBehavioral();
  const { collect } = useSDKFingerprint();
  const { detect } = useDetection();
  const { analyze } = useBehavioralAnalysis();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);
  const [debugPayload, setDebugPayload] = useState<AuthDebugPayload | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [timing, setTiming] = useState<TimingResult | null>(null);
  const [useCache, setUseCache] = useState(false);
  const [cacheWarmed, setCacheWarmed] = useState(false);
  const [warming, setWarming] = useState(false);

  useEffect(() => {
    drain();
    console.log("Behavioral events drained on Register mount");
  }, [drain]);

  const handleCacheToggle = async (enabled: boolean) => {
    setUseCache(enabled);
    setCacheWarmed(false);
    if (enabled) {
      setWarming(true);
      await collect();
      setCacheWarmed(true);
      setWarming(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setResultMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setLoading(true);
    setResultMessage(null);
    setDebugPayload(null);
    setIsDebugModalOpen(false);
    setTiming(null);

    try {
      const t0Analyze = performance.now();
      const analysisData = analyze();
      const analyzeMs = performance.now() - t0Analyze;

      const t0Fingerprint = performance.now();
      const fingerprintData = await collect(useCache ? undefined : true);
      const fingerprintMs = performance.now() - t0Fingerprint;

      const t0Detect = performance.now();
      const detectionData = detect();
      const detectMs = performance.now() - t0Detect;

      const t0Fetch = performance.now();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          botProtection: {
            behavioral: analysisData?.payload ?? null,
            fingerprint: fingerprintData,
            detection: detectionData,
            analysis: analysisData,
          },
        }),
      });

      const fetchMs = performance.now() - t0Fetch;
      const result = await response.json();

      setTiming({ analyzeMs, fingerprintMs, detectMs, fetchMs, cached: useCache });
      setDebugPayload({
        behavioral: analysisData?.payload ?? null,
        fingerprint: fingerprintData,
        detection: detectionData,
        analysis: analysisData,
      });

      if (result.isBot) {
        setResultMessage({ type: "error", text: "Registration Blocked: Bot Detected 🤖" });
      } else if (result.success) {
        setResultMessage({ type: "success", text: "Registration Successful! Human Verified 👨‍💻" });
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setResultMessage({ type: "error", text: result.error || "Registration failed." });
      }
    } catch {
      setResultMessage({ type: "error", text: "An error occurred during registration." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-xl font-bold sm:text-2xl">Register</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border p-2 text-sm sm:text-base dark:border-zinc-700 dark:bg-zinc-800"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2 text-sm sm:text-base dark:border-zinc-700 dark:bg-zinc-800"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2 text-sm sm:text-base dark:border-zinc-700 dark:bg-zinc-800"
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border p-2 text-sm sm:text-base dark:border-zinc-700 dark:bg-zinc-800"
          required
          minLength={6}
        />
        
        <div className="flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          <div>
            <p className="text-sm font-medium">Use cached fingerprint</p>
            <p className="text-xs text-zinc-500">
              {warming ? "Warming cache..." : useCache && cacheWarmed ? "Cache ready" : "Pre-warms on toggle"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCacheToggle(!useCache)}
            disabled={warming}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
              useCache ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                useCache ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading || warming}
          className="mt-2 w-full rounded bg-green-600 p-2 text-sm text-white transition hover:bg-green-700 disabled:opacity-50 sm:text-base"
        >
          {loading ? "Verifying & Registering..." : "Create Account"}
        </button>
      </form>

      {resultMessage && (
        <div className="mt-4 space-y-3">
          <div className={`p-3 rounded text-center font-medium ${
            resultMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {resultMessage.text}
          </div>

          {timing && <TimingBreakdown t={timing} />}

          {debugPayload && (
            <button
              type="button"
              onClick={() => setIsDebugModalOpen(true)}
              className="w-full rounded bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Debug
            </button>
          )}
        </div>
      )}

      <AuthDebugModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        title="Register"
        payload={debugPayload}
      />
    </div>
  );
}