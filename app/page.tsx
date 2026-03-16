"use client";

import { useState } from "react";
import { BehavioralAnalyzerDemo } from "@/components/BehavioralAnalyzerDemo";
import { BehavioralDemo } from "@/components/BehavioralDemo";
import { FingerprintDemo } from "@/components/FingerprintDemo";
import { DetectionDemo } from "@/components/DetectionDemo";
import { RegisterDemo } from "@/components/RegisterDemo";
import { LoginDemo } from "@/components/LoginDemo";

type Tab = "behavioral" | "analyzer" | "fingerprint" | "detection" | "register" | "login";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("analyzer");

  const tabs: Tab[] = ["behavioral", "analyzer", "fingerprint", "detection", "register", "login"];

  return (
    <div className="min-h-screen bg-zinc-50 p-4 py-6 text-black dark:bg-black dark:text-white sm:p-6 sm:py-8 lg:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            Sokratech SDK Implementation
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-500 sm:text-base">
            PoC for Behavioral, Fingerprint, and Bot Detection
          </p>
        </header>

        <nav className="mb-6 flex gap-2 overflow-x-auto border-b border-zinc-200 pb-1 sm:mb-8 sm:justify-center dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-3 py-2 text-sm font-medium capitalize transition-colors sm:px-4 sm:text-base ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main className="w-full">
          {activeTab === "behavioral" && <BehavioralDemo />}
          {activeTab === "analyzer" && <BehavioralAnalyzerDemo />}
          {activeTab === "fingerprint" && <FingerprintDemo />}
          {activeTab === "detection" && <DetectionDemo />}
          {activeTab === "register" && <RegisterDemo />}
          {activeTab === "login" && <LoginDemo />}
        </main>
      </div>
    </div>
  );
}
