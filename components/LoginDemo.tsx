"use client";

import { useState, useEffect } from "react";
import { useBehavioral, useSDKFingerprint, useDetection } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";
import { AuthDebugModal, type AuthDebugPayload } from "@/components/AuthDebugModal";

export function LoginDemo() {
  const { drain } = useBehavioral();
  const { collect } = useSDKFingerprint();
  const { detect } = useDetection();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);
  const [debugPayload, setDebugPayload] = useState<AuthDebugPayload | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);

  useEffect(() => {
    drain();
  }, [drain]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);
    setDebugPayload(null);
    setIsDebugModalOpen(false);

    try {
      const behavioralData = drain();
      const fingerprintData = await collect();
      const detectionData = detect();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          botProtection: {
            behavioral: behavioralData,
            fingerprint: fingerprintData,
            detection: detectionData,
          },
        }),
      });

      const result = await response.json();

      setDebugPayload({
        behavioral: behavioralData,
        fingerprint: fingerprintData,
        detection: detectionData,
      });

      if (result.isBot) {
        setResultMessage({ type: "error", text: "Login Failed: Bot Detected 🤖" });
      } else if (result.success) {
        setResultMessage({ type: "success", text: "Login Successful: Human Verified 👨‍💻" });
      } else {
        setResultMessage({ type: "error", text: result.error || "Login failed." });
      }
    } catch {
      setResultMessage({ type: "error", text: "An error occurred during login." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-xl font-bold sm:text-2xl">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded bg-blue-600 p-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-50 sm:text-base"
        >
          {loading ? "Verifying & Logging in..." : "Login"}
        </button>
      </form>

      {resultMessage && (
        <div className="mt-4 space-y-3">
          <div className={`p-3 rounded text-center font-medium ${
            resultMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {resultMessage.text}
          </div>

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
        title="Login"
        payload={debugPayload}
      />
    </div>
  );
}
