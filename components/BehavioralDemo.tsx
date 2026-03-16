import { useState } from 'react';
import { useBehavioral } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import type { BehavioralPayload } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';

export function BehavioralDemo() {
  const { drain } = useBehavioral();
  const [payload, setPayload] = useState<BehavioralPayload | null>(null);
  const [drainCount, setDrainCount] = useState(0);

  const handleDrain = () => {
    const data = drain();
    setPayload(data);
    setDrainCount((c) => c + 1);
  };

  return (
    <div>
      <h2 style={styles.heading}>Behavioral Tracking</h2>
      <p style={styles.desc}>
        The SDK is capturing mouse movements, clicks, and keyboard events in real time. Move your mouse around,
        type on the keyboard, then click <strong>Drain Events</strong> to see the collected data.
      </p>

      <div style={styles.interactionArea}>
        <p style={{ margin: 0, color: '#888' }}>
          🖱️ Move your mouse here &amp; press keyboard keys, then drain…
        </p>
        <input
          type="text"
          placeholder="Type something here…"
          style={styles.input}
        />
      </div>

      <button onClick={handleDrain} style={styles.button}>
        Drain Events
      </button>

      {payload && (
        <div style={styles.results}>
          <h3 style={styles.subheading}>
            Drain #{drainCount} — Captured at {new Date(payload.capturedAt).toLocaleTimeString()}
          </h3>

          <div style={styles.statRow}>
            <Stat label="Cursor Events" value={payload.cursorEvents.length} />
            <Stat label="Key Events" value={payload.keyEvents.length} />
            <Stat label="Paste Events" value={payload.pasteEvents.length} />
            <Stat label="Click Events" value={payload.clickEvents.length} />
            <Stat label="Scroll Events" value={payload.mouseScrollEvents.length} />
          </div>

          {payload.cursorEvents.length > 0 && (
            <details style={styles.details}>
              <summary>Cursor Events (first 10)</summary>
              <pre style={styles.pre}>
                {JSON.stringify(payload.cursorEvents.slice(0, 10), null, 2)}
              </pre>
            </details>
          )}

          {payload.keyEvents.length > 0 && (
            <details style={styles.details}>
              <summary>Key Events (first 10)</summary>
              <pre style={styles.pre}>
                {JSON.stringify(payload.keyEvents.slice(0, 10), null, 2)}
              </pre>
            </details>
          )}

          {payload.pasteEvents.length > 0 && (
            <details style={styles.details}>
              <summary>Paste Events (first 10)</summary>
              <pre style={styles.pre}>
                {JSON.stringify(payload.pasteEvents.slice(0, 10), null, 2)}
              </pre>
            </details>
          )}

          {payload.clickEvents.length > 0 && (
            <details style={styles.details}>
              <summary>Click Events (first 10)</summary>
              <pre style={styles.pre}>
                {JSON.stringify(payload.clickEvents.slice(0, 10), null, 2)}
              </pre>
            </details>
          )}

          {payload.mouseScrollEvents.length > 0 && (
            <details style={styles.details}>
              <summary>Scroll Events (first 10)</summary>
              <pre style={styles.pre}>
                {JSON.stringify(payload.mouseScrollEvents.slice(0, 10), null, 2)}
              </pre>
            </details>
          )}

          <details style={styles.details}>
            <summary>Full Payload (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(payload, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 'clamp(1.1rem, 2.4vw, 1.3rem)', marginBottom: '0.5rem' },
  desc: { color: '#555', lineHeight: 1.6, fontSize: '0.95rem' },
  interactionArea: {
    border: '2px dashed #ccc',
    borderRadius: 8,
    padding: 'clamp(0.9rem, 3vw, 1.5rem)',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  input: {
    marginTop: '1rem',
    padding: '0.5rem 0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: 4,
    width: '100%',
    maxWidth: 360,
    boxSizing: 'border-box',
  },
  button: {
    padding: '0.6rem 1.4rem',
    fontSize: '0.95rem',
    backgroundColor: '#4361ee',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    width: '100%',
    maxWidth: 220,
  },
  results: { marginTop: '1.5rem' },
  subheading: { fontSize: '1rem', marginBottom: '0.75rem' },
  statRow: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f4f4f8',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    flex: '1 1 140px',
  },
  statValue: { fontSize: '1.5rem', fontWeight: 700, color: '#4361ee' },
  statLabel: { fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' },
  details: { marginTop: '0.75rem' },
  pre: {
    background: '#1a1a2e',
    color: '#a5d6a7',
    padding: '1rem',
    borderRadius: 6,
    fontSize: '0.8rem',
    overflow: 'auto',
    maxHeight: 300,
  },
};
