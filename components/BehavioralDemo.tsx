import { useState } from 'react';
import { useBehavioral } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import type { BehavioralPayload } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import { sanitizeBehavioralPayload, useConfigCheck } from '@/app/providers';

export function BehavioralDemo() {
  return (
    <div className="flex flex-col gap-6">
      <BehavioralPanel />
    </div>
  );
}

function BehavioralPanel() {
  const { drain } = useBehavioral();
  const { sdkRecipes } = useConfigCheck();
  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);

  const handleDrain = () => {
    const data = sanitizeBehavioralPayload(drain(), sdkRecipes);
    setPayload(data);
    setDrainCount((c) => c + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-[#cfdcf2] bg-[#eef3fb] p-6">
        <h2 className="mb-2 text-xl font-bold text-[#1f3f78]">Behavioral Collection</h2>
        <p className="mb-6 text-sm text-[#355a96]">
          Collects behavioral interaction signals from cursor movement, keyboard input, paste activity,
          click actions, and scrolling patterns for bot-risk analysis.
        </p>

        <div className="mb-6 flex min-h-[150px] items-center justify-center rounded-lg border-2 border-dashed border-[#b8ccea] bg-white p-6 text-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-4">
            <p className="text-sm text-zinc-500">
              🖱️ Interact here, then click drain...
            </p>
            <input
              type="text"
              placeholder="Type something here..."
              className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm focus:border-[#1f3f78] focus:outline-none focus:ring-2 focus:ring-[#1f3f78]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
          </div>
        </div>

        <button
          onClick={handleDrain}
          className="w-full rounded-lg bg-[#1f3f78] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#193462] focus:outline-none focus:ring-4 focus:ring-[#1f3f78]/20 sm:w-auto"
        >
          Drain Events
        </button>

        {payload && (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">
              Drain #{drainCount} — Captured at {new Date(payload.capturedAt).toLocaleTimeString()}
            </h3>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Cursor" value={payload.cursorEvents?.length || 0} />
              <Stat label="Keyboard" value={payload.keyEvents?.length || 0} />
              <Stat label="Click" value={payload.clickEvents?.length || 0} />
              <Stat label="Scroll" value={payload.mouseScrollEvents?.length || 0} />
            </div>

            <div className="flex flex-col gap-4">
              <EventDetails title="Cursor Events" events={payload.cursorEvents} />
              <EventDetails title="Keyboard Events" events={payload.keyEvents} />
              <EventDetails title="Click Events" events={payload.clickEvents} />
              <EventDetails title="Scroll Events" events={payload.mouseScrollEvents} />
              
              <details className="group rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <summary className="cursor-pointer p-4 font-semibold text-zinc-900 dark:text-white">
                  Full Payload (JSON)
                </summary>
                <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                  <pre className="max-h-96 overflow-auto rounded bg-zinc-950 p-4 text-xs text-green-400">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      <div className="h-[200vh] w-full rounded-xl border border-zinc-200 bg-zinc-100/50 p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/20">
        <p className="sticky top-8 font-medium">Tall content area to test vertical scrolling (TC9)</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-50 p-4">
      <span className="text-2xl font-bold text-[#1f3f78]">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}

function EventDetails({ title, events }: { title: string; events: unknown[] }) {
  if (!events || events.length === 0) return null;
  return (
    <details className="group rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer p-4 font-semibold text-zinc-900 dark:text-white">
        {title} ({events.length} total, showing first 10)
      </summary>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <pre className="max-h-60 overflow-auto rounded bg-zinc-950 p-4 text-xs text-green-400">
          {JSON.stringify(events.slice(0, 10), null, 2)}
        </pre>
      </div>
    </details>
  );
}
