import { useState } from 'react';
import { useDetection } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import type { DetectionResult } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';

export function DetectionDemo() {
  const { detect } = useDetection();
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleDetect = () => {
    const data = detect();
    setResult(data);
  };

  return (
    <div>
      <h2 style={styles.heading}>Bot / Automation Detection</h2>
      <p style={styles.desc}>
        Runs heuristics to determine whether the current browser is a headless environment (e.g. Puppeteer,
        Playwright) or is being controlled by WebDriver (Selenium).
      </p>

      <button onClick={handleDetect} style={styles.button}>
        Run Detection
      </button>

      {result && (
        <div style={styles.results}>
          <h3 style={styles.subheading}>
            Detection at {new Date(result.timestamp).toLocaleTimeString()}
          </h3>

          <div style={styles.row}>
            <DetectionCard
              title="Headless Browser"
              detected={result.headless}
              descTrue="This looks like a headless browser (e.g. Puppeteer --headless)."
              descFalse="No headless indicators detected — appears to be a normal browser."
            />
            <DetectionCard
              title="WebDriver"
              detected={result.webdriver}
              descTrue="navigator.webdriver is true — likely controlled by Selenium or similar."
              descFalse="No WebDriver automation detected."
            />
          </div>

          <details style={styles.details}>
            <summary>Full Result (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function DetectionCard({
  title,
  detected,
  descTrue,
  descFalse,
}: {
  title: string;
  detected?: boolean;
  descTrue: string;
  descFalse: string;
}) {
  const isDetected = detected === true;
  return (
    <div style={{ ...styles.card, borderColor: isDetected ? '#e53935' : '#43a047' }}>
      <div style={styles.cardHeader}>
        <span style={{ fontSize: '1.4rem' }}>{isDetected ? '🚨' : '✅'}</span>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>{title}</h4>
      </div>
      <p style={styles.cardDesc}>{isDetected ? descTrue : descFalse}</p>
      <span
        style={{
          ...styles.badge,
          backgroundColor: isDetected ? '#ffebee' : '#e8f5e9',
          color: isDetected ? '#c62828' : '#2e7d32',
        }}
      >
        {detected === undefined ? 'N/A' : isDetected ? 'DETECTED' : 'CLEAN'}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '1.3rem', marginBottom: '0.5rem' },
  desc: { color: '#555', lineHeight: 1.6 },
  button: {
    padding: '0.6rem 1.4rem',
    fontSize: '0.95rem',
    backgroundColor: '#4361ee',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  results: { marginTop: '1.5rem' },
  subheading: { fontSize: '1rem', marginBottom: '0.75rem' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' },
  card: {
    flex: '1 1 260px',
    background: '#fafafa',
    borderRadius: 8,
    padding: '1.25rem',
    border: '2px solid',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  cardDesc: { fontSize: '0.85rem', color: '#555', lineHeight: 1.5, margin: '0 0 0.75rem' },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
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
