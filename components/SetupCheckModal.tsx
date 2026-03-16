"use client";

import { sdkConfig } from "../app/providers";

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
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {enabled ? "✓ Enabled" : "✗ Disabled"}
    </span>
  );
}

function ConfigItem({ label, value }: { label: string; value: ConfigValue }) {
  const isBoolean = typeof value === "boolean";

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{label}</span>
      {isBoolean ? (
        <StatusBadge enabled={value} />
      ) : (
        <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
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

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          isEnabled
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            : "bg-zinc-50 dark:bg-zinc-800/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
        </div>
        <StatusBadge enabled={isEnabled} />
      </div>
      <div className="px-4 py-2 bg-white dark:bg-zinc-900">
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
  if (!isOpen) {
    return null;
  }

  const { recipes } = sdkConfig;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 pt-6 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="SDK Setup Check"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-4 shadow-2xl sm:p-5 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold sm:text-xl flex items-center gap-2">
              <span>⚙️</span> SDK Setup Check
            </h3>
            <p className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
              Current configuration from providers.tsx
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

        {/* Recipe Sections */}
        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          <RecipeSection
            title="Behavioral"
            icon="🖱️"
            config={recipes.behavioral as Record<string, ConfigValue>}
          />
          <RecipeSection
            title="Fingerprint"
            icon="🔍"
            config={recipes.fingerprint as Record<string, ConfigValue>}
          />
          <RecipeSection
            title="Detection"
            icon="🛡️"
            config={recipes.detection as Record<string, ConfigValue>}
          />
        </div>

        {/* Summary Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              Total enabled features:{" "}
              <strong className="text-blue-600 dark:text-blue-400">
                {countEnabledFeatures(recipes)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function countEnabledFeatures(recipes: typeof sdkConfig.recipes): number {
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
