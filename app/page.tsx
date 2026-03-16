"use client";

import { useState } from "react";
import { BehavioralDemo } from "@/components/BehavioralDemo";
import { FingerprintDemo } from "@/components/FingerprintDemo";
import { DetectionDemo } from "@/components/DetectionDemo";
import { RegisterDemo } from "@/components/RegisterDemo";
import { LoginDemo } from "@/components/LoginDemo";

type Tab = "behavioral" | "fingerprint" | "detection" | "register" | "login";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("login");

  const tabs: Tab[] = ["behavioral", "fingerprint", "detection", "register", "login"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold">Sokratech SDK Implementation</h1>
          <p className="text-zinc-500 mt-2">PoC for Behavioral, Fingerprint, and Bot Detection</p>
        </header>

        <nav className="flex justify-center gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main>
          {activeTab === "behavioral" && <BehavioralDemo />}
          {activeTab === "fingerprint" && <FingerprintDemo />}
          {activeTab === "detection" && <DetectionDemo />}
          {activeTab === "register" && <RegisterDemo />}
          {activeTab === "login" && <LoginDemo />}
        </main>
      </div>
    </div>
  );
}
