"use client";

import { useState } from "react";
import { BehavioralDemo } from "@/components/BehavioralDemo";
import { FingerprintDemo } from "@/components/FingerprintDemo";
import { DetectionDemo } from "@/components/DetectionDemo";
import { RegisterDemo } from "@/components/RegisterDemo";
import { LoginDemo } from "@/components/LoginDemo";
import { AnalyzerDemo } from "@/components/AnalyzerDemo";
import { ProfilingDemo } from "@/components/ProfilingDemo";
import { SetupCheckModal } from "@/components/SetupCheckModal";

type Tab = "behavioral" | "fingerprint" | "detection" | "analyzer" | "register" | "login" | "profiling";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const tabs: Tab[] = ["behavioral", "fingerprint", "detection", "analyzer", "register", "login", "profiling"];

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
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:bg-transparent dark:hover:bg-blue-900/20"
          >
            ⚙️ Setup Check
          </button>
        </header>

        <SetupCheckModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
        />

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
          {activeTab === "fingerprint" && <FingerprintDemo />}
          {activeTab === "detection" && <DetectionDemo />}
          {activeTab === "analyzer" && <AnalyzerDemo />}
          {activeTab === "register" && <RegisterDemo />}
          {activeTab === "login" && <LoginDemo />}
          {activeTab === "profiling" && <ProfilingDemo />}
        </main>
      </div>
    </div>
  );
}
