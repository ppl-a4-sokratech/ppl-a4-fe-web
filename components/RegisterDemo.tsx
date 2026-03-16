"use client";

import { useState, useEffect } from "react";
import { useBehavioral, useSDKFingerprint, useDetection } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";
import { AuthDebugModal, type AuthDebugPayload } from "@/components/AuthDebugModal";

export function RegisterDemo() {
  const { drain } = useBehavioral();
  const { collect } = useSDKFingerprint();
  const { detect } = useDetection();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);
  const [debugPayload, setDebugPayload] = useState<AuthDebugPayload | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);

  useEffect(() => {
    drain();
    console.log("Behavioral events drained on Register mount");
  }, [drain]);

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

    try {
      const behavioralData = drain();
      const fingerprintData = await collect();
      const detectionData = detect();

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          botProtection: {
            behavioral: behavioralData,
            fingerprint: fingerprintData,
            detection: detectionData,
          },
        }),
      });

      const result = await response.json();

      if (result.isBot) {
        setResultMessage({ type: "error", text: "Registration Blocked: Bot Detected 🤖" });
      } else if (result.success) {
        setResultMessage({ type: "success", text: "Registration Successful! Human Verified 👨‍💻" });
        setDebugPayload({
          behavioral: behavioralData,
          fingerprint: fingerprintData,
          detection: detectionData,
        });
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
        
        <button
          type="submit"
          disabled={loading}
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

          {resultMessage.type === "success" && debugPayload && (
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