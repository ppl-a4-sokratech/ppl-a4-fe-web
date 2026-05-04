"use client";

import { useMemo } from "react";
import { useConfigCheck } from "../app/providers";

type SetupCheckModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ConfigValue = boolean | string | number | Record<string, unknown>;

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        enabled
          ? "bg-[#e7f1ec] text-[#2f6a4a]"
          : "bg-[#ece8e1] text-zinc-700"
      }`}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

function ConfigItem({ label, value }: { label: string; value: ConfigValue }) {
  const isBoolean = typeof value === "boolean";

  return (
    <div className="flex items-center justify-between border-b border-[#efe6db] py-1.5 last:border-0">
      <span className="text-sm capitalize text-zinc-700">{label}</span>
      {isBoolean ? (
        <StatusBadge enabled={value} />
      ) : (
        <span className="text-sm font-mono text-zinc-600">
          {String(value)}
        </span>
      )}
    </div>
  );
}

function RecipeSection({
  title,
  config,
  icon,
}: {
  title: string;
  config: Record<string, ConfigValue>;
  icon: string;
}) {
  const isEnabled = config.enabled === true;
  const activeCount = Object.entries(config).filter(([key, value]) => key !== "enabled" && value === true).length;
  const totalCount = Object.entries(config).filter(([key]) => key !== "enabled").length;

  return (
    <div className="overflow-hidden rounded-lg border border-[#e4d9cc]">
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          isEnabled
            ? "bg-gradient-to-r from-[#edf2fb] to-[#f2f6fc]"
            : "bg-[#f8f5f1]"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h4 className="font-semibold text-zinc-900">{title}</h4>
            <p className="text-[11px] text-zinc-500">{activeCount}/{totalCount} features active</p>
          </div>
        </div>
        <StatusBadge enabled={isEnabled} />
      </div>
      <div className="bg-white px-4 py-2">
        {Object.entries(config)
          .filter(([key]) => key !== "enabled")
          .map(([key, value]) => (
            <ConfigItem key={key} label={key} value={value as ConfigValue} />
          ))}
      </div>
    </div>
  );
}

export function SetupCheckModal({ isOpen, onClose }: SetupCheckModalProps) {
  const configCheck = useConfigCheck();
  const { backendRecipes, status, source, errorMessage, workflowId, profileId } = configCheck;

  const enabledFeaturesCount = useMemo(
    () => countEnabledFeatures(backendRecipes),
    [backendRecipes]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 pt-6 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="SDK Config Check"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#e4d9cc] bg-[#fcfaf7] p-4 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold sm:text-xl flex items-center gap-2">
              <span>⚙️</span> Config Check
            </h3>
            <p className="text-xs text-zinc-600 sm:text-sm">
              Runtime recipe status resolved from backend or mock fallback
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-medium hover:bg-zinc-100 sm:w-auto"
          >
            Close
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-[#ece8e1] px-2 py-1 font-medium text-zinc-700">
            Runtime: {status}
          </span>
          <span className="rounded bg-[#e8eef9] px-2 py-1 font-medium text-[#1f3f78]">
            Source: {source}
          </span>
          <span className="rounded bg-[#ece8e1] px-2 py-1 font-medium text-zinc-700">
            workflowId: {workflowId}
          </span>
          <span className="rounded bg-[#ece8e1] px-2 py-1 font-medium text-zinc-700">
            profileId: {profileId}
          </span>
          {errorMessage && (
            <span className="rounded bg-[#f8ebdf] px-2 py-1 font-medium text-[#92572f]">
              Fallback reason: {errorMessage}
            </span>
          )}
        </div>

        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          <RecipeSection
            title="Behavioral"
            icon="🖱️"
            config={backendRecipes.behavioral as Record<string, ConfigValue>}
          />
          <RecipeSection
            title="Fingerprint"
            icon="🔍"
            config={backendRecipes.fingerprint as Record<string, ConfigValue>}
          />
          <RecipeSection
            title="Detection"
            icon="🛡️"
            config={backendRecipes.detection as Record<string, ConfigValue>}
          />
        </div>

        {/* Summary Footer */}
        <div className="mt-4 border-t border-[#e9dfd3] pt-3">
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <span className="text-zinc-600">
              Total enabled features:{" "}
              <strong className="text-[#1f3f78]">
                {enabledFeaturesCount}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function countEnabledFeatures(recipes: {
  behavioral: Record<string, boolean>;
  fingerprint: Record<string, boolean>;
  detection: Record<string, boolean>;
}): number {
  let count = 0;
  for (const recipe of Object.values(recipes)) {
    for (const [key, value] of Object.entries(recipe)) {
      if (key !== "enabled" && value === true) {
        count++;
      }
    }
  }
  return count;
}
