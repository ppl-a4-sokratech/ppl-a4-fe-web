"use client";

import { useState, useEffect } from "react";
import { useBehavioral, useSDKFingerprint, useDetection } from "@ppl-sokratech-sdk/ppl-a4-sdk-web";

export function LoginDemo() {
  const { drain } = useBehavioral();
  const { collect } = useSDKFingerprint();
  const { detect } = useDetection();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);

  useEffect(() => {
    drain();
  }, [drain]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

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

      if (result.isBot) {
        setResultMessage({ type: "error", text: "Login Failed: Bot Detected 🤖" });
      } else {
        setResultMessage({ type: "success", text: "Login Successful: Human Verified 👨‍💻" });
      }
    } catch (error) {
      setResultMessage({ type: "error", text: "An error occurred during login." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Verifying & Logging in..." : "Login"}
        </button>
      </form>

      {resultMessage && (
        <div className={`mt-4 p-3 rounded text-center font-medium ${
          resultMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {resultMessage.text}
        </div>
      )}
    </div>
  );
}
