import { useState } from 'react';
import { useBehavioral, useSokratech, SokratechProvider } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import type { BehavioralPayload } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';

export function BehavioralDemo() {
  const [toggles, setToggles] = useState({
    cursor: true,
    keyboard: false,
    click: true,
    mouseScroll: true,
  });

  const config = {
    apiKey: 'demo-api-key-12345',
    apiDomain: 'https://api.sokratech.example',
    recipes: {
      behavioral: {
        enabled: true,
        ...toggles,
      },
    },
    profiling: {
      enabled: true,
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-xl font-bold">Behavioral Toggles</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(toggles).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setToggles((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <span className="text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">
                {key}
              </span>
            </label>
          ))}
        </div>
      </div>

      <SokratechProvider key={JSON.stringify(toggles)} config={config}>
        <BehavioralPanel />
      </SokratechProvider>
    </div>
  );
}

function BehavioralPanel() {
  const { drain } = useBehavioral();
  const { sdk } = useSokratech();
  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);
  const [isDestroyed, setIsDestroyed] = useState(false);

  const handleDrain = () => {
    const data = drain();
    setPayload(data);
    setDrainCount((c) => c + 1);
  };

  const handleDestroy = () => {
    sdk.destroy();
    setIsDestroyed(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
        <h2 className="mb-2 text-xl font-bold text-blue-900 dark:text-blue-100">Behavioral Tracking Panel</h2>
        <p className="mb-6 text-sm text-blue-700 dark:text-blue-300">
          The SDK is capturing configured events in real time. Move your mouse around,
          type on the keyboard, click around, or scroll the page.
        </p>

        <div className="mb-6 flex min-h-[150px] items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-white p-6 text-center dark:border-blue-800/50 dark:bg-zinc-950">
          <div className="flex w-full max-w-sm flex-col items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              🖱️ Interact here, then click drain...
            </p>
            <input
              type="text"
              placeholder="Type something here..."
              className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDrain}
            disabled={isDestroyed}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Drain Events
          </button>
          <button
            onClick={handleDestroy}
            disabled={isDestroyed}
            className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isDestroyed ? 'Destroyed' : 'Destroy'}
          </button>
        </div>

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
    <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
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
