"use client";

import { useEffect, useState } from "react";
import { BehavioralDemo } from "@/components/BehavioralDemo";
import { FingerprintDemo } from "@/components/FingerprintDemo";
import { DetectionDemo } from "@/components/DetectionDemo";
import { LoginDemo } from "@/components/LoginDemo";
import { ProfilingDemo } from "@/components/ProfilingDemo";
import { SetupCheckModal } from "@/components/SetupCheckModal";
import { useConfigCheck } from "./providers";

type Tab = "behavioral" | "fingerprint" | "detection" | "login" | "profiling";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    const saved = window.localStorage.getItem("demo.sidebar.collapsed");
    return saved === null ? true : saved === "true";
  });
  const { workflowId, profileId, setIdentifiers, status } = useConfigCheck();
  const [workflowDraft, setWorkflowDraft] = useState(workflowId);
  const [profileDraft, setProfileDraft] = useState(profileId);

  const tabs: Tab[] = ["behavioral", "fingerprint", "detection", "login", "profiling"];
  const activeTabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  useEffect(() => {
    window.localStorage.setItem("demo.sidebar.collapsed", String(isPanelCollapsed));
  }, [isPanelCollapsed]);

  return (
    <div className="min-h-screen bg-[#f6f5f3] text-zinc-900 dark:bg-[#0f172a] dark:text-zinc-100">
      <div className="mx-auto max-w-[1600px] p-3">
        <div className="overflow-hidden rounded-2xl border border-[#d9d3ca] bg-[#f9f7f4] shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <header className="flex items-center justify-between bg-[#1f3f78] px-6 py-3 text-white">
            <h1 className="flex items-baseline gap-2 leading-none">
              <span className="text-3xl font-semibold">Sokratech</span>
              <span className="text-3xl font-light text-blue-100">SDK Web Demo</span>
            </h1>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              {status === "loading" ? "Loading config..." : "Config loaded"}
            </span>
          </header>

          <div className="flex items-center justify-between border-b border-[#e6ddd2] bg-[#fbf9f6] px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="text-2xl font-semibold text-[#1f3f78] dark:text-blue-300">Demo Playground</h2>
            <div />
          </div>

          <div className="grid min-h-[74vh] grid-cols-1 lg:grid-cols-[auto_1fr]">
            <aside
              className={`overflow-hidden border-r border-[#e6ddd2] bg-[#f8f4ef] transition-[width] duration-300 ease-in-out dark:border-zinc-700 dark:bg-zinc-900 ${
                isPanelCollapsed ? "w-[64px]" : "w-[340px]"
              }`}
            >
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed((prev) => !prev)}
                  className="flex w-full items-center justify-center rounded-lg border border-[#dfd2c4] bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  aria-label={isPanelCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isPanelCollapsed ? "»" : "«"}
                </button>
              </div>

              <div className={`px-3 pb-4 transition-opacity duration-200 ${isPanelCollapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                <div className="rounded-xl border border-[#e6ddd2] bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">Config Route Overrides</p>
                <div className="mt-2 grid gap-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Workflow ID
                    <input
                      type="text"
                      value={workflowDraft}
                      onChange={(e) => setWorkflowDraft(e.target.value)}
                      placeholder="workflowId"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </label>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Identity Profile
                    <input
                      type="text"
                      value={profileDraft}
                      onChange={(e) => setProfileDraft(e.target.value)}
                      placeholder="profileId"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIdentifiers({ workflowId: workflowDraft, profileId: profileDraft })}
                    className="rounded-md bg-[#df9f86] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d89176]"
                  >
                    Apply + Re-init
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSetupModalOpen(true)}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Open Config Check
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflowDraft(workflowId);
                      setProfileDraft(profileId);
                    }}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                  >
                    Reset
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Runtime: {workflowId} / {profileId} ({status})</p>
              </div>
              </div>
            </aside>

            <section className="bg-[radial-gradient(circle,#e5ded4_1px,transparent_1.5px)] [background-size:28px_28px] p-5 dark:bg-[radial-gradient(circle,#334155_1px,transparent_1.5px)]">
              <nav className="mb-4 rounded-xl border border-[#e6ddd2] bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                        activeTab === tab
                          ? "bg-[#1f3f78] text-white shadow-sm"
                          : "bg-[#f3f6fb] text-[#2c4f8e] hover:bg-[#e6eefb] hover:text-[#1f3f78] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </nav>

              <main className="rounded-2xl border border-[#e7dbce] bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-700">
                  <h2 className="text-lg font-semibold text-[#1f3f78] dark:text-blue-300">{activeTabLabel} Demo</h2>
                  <span className="rounded-full bg-[#e8eef9] px-3 py-1 text-xs font-medium text-[#1f3f78] dark:bg-zinc-800 dark:text-zinc-200">Demo Mode</span>
                </div>
                {activeTab === "behavioral" && <BehavioralDemo />}
                {activeTab === "fingerprint" && <FingerprintDemo />}
                {activeTab === "detection" && <DetectionDemo />}
                {activeTab === "login" && <LoginDemo />}
                {activeTab === "profiling" && <ProfilingDemo />}
              </main>
            </section>
          </div>

          <SetupCheckModal
            isOpen={isSetupModalOpen}
            onClose={() => setIsSetupModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
