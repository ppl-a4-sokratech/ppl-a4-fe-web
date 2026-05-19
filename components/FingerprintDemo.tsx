import { useMemo, useState } from 'react';
import { useSDKFingerprint } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import { sanitizeFingerprintData, useConfigCheck } from '@/app/providers';

const MIN_COLLECT_COUNT = 1;
const MAX_COLLECT_COUNT = 100;

export function FingerprintDemo() {
  const { data, loading, error, collect } = useSDKFingerprint();
  const { sdkRecipes } = useConfigCheck();
  const [collectCountInput, setCollectCountInput] = useState('1');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const safeData = data ? sanitizeFingerprintData(data, sdkRecipes) : null;
  const isBatchRunning = batchProgress !== null;
  const isActionDisabled = loading || isBatchRunning;

  const helperText = useMemo(() => {
    if (!batchProgress) {
      return `Runs per click: ${sanitizeCollectCount(collectCountInput)}`;
    }
    return `Collecting ${batchProgress.current} / ${batchProgress.total}`;
  }, [batchProgress, collectCountInput]);

  const handleCountBlur = () => {
    setCollectCountInput(String(sanitizeCollectCount(collectCountInput)));
  };

  const runCollectBatch = async (force?: boolean) => {
    const total = sanitizeCollectCount(collectCountInput);
    setCollectCountInput(String(total));
    setBatchProgress({ current: 0, total });

    try {
      for (let i = 0; i < total; i += 1) {
        setBatchProgress({ current: i + 1, total });
        await collect(force);
      }
    } finally {
      setBatchProgress(null);
    }
  };

  return (
    <div>
      <h2 style={styles.heading}>Fingerprint Collection</h2>
      <p style={styles.desc}>
        Collects a unique device fingerprint from audio context, canvas rendering, WebGL info, installed fonts,
        device specs, browser metadata, and screen properties.
      </p>

      <div style={styles.batchControl}>
        <label htmlFor="collect-count" style={styles.inputLabel}>
          Collect count per click
        </label>
        <input
          id="collect-count"
          type="number"
          min={MIN_COLLECT_COUNT}
          max={MAX_COLLECT_COUNT}
          step={1}
          value={collectCountInput}
          onChange={(e) => setCollectCountInput(e.target.value)}
          onBlur={handleCountBlur}
          disabled={isActionDisabled}
          style={styles.input}
        />
      </div>

      <div style={styles.actions}>
        <button onClick={() => runCollectBatch()} disabled={isActionDisabled} style={styles.button}>
          {isActionDisabled ? 'Collecting...' : 'Collect Fingerprint'}
        </button>
        <button onClick={() => runCollectBatch(true)} disabled={isActionDisabled} style={styles.buttonSecondary}>
          Force Re-collect
        </button>
        <span style={styles.batchHint}>{helperText}</span>
      </div>

      {error && <p style={styles.error}>Error: {error}</p>}

      {safeData && (
        <div style={styles.results}>
          <h3 style={styles.subheading}>
            Collected at {new Date(safeData.timestamp).toLocaleTimeString()}
          </h3>

          <div style={styles.grid}>
            <FingerprintCard title="Audio" data={safeData.audio} />
            <FingerprintCard title="Canvas" data={safeData.canvas} />
            <FingerprintCard title="WebGL" data={safeData.webgl} />
            <FingerprintCard title="Device" data={safeData.device} />
            <FingerprintCard title="Browser" data={safeData.browser} />
            <FingerprintCard title="Screen" data={safeData.screen} />
            <FingerprintCard
              title="Fonts"
              data={safeData.fonts}
              renderCustom={
                safeData.fonts
                  ? () => (
                      <p style={{ fontSize: '0.85rem', color: '#555' }}>
                        {safeData.fonts!.length} font(s) detected:{' '}
                        <em>{safeData.fonts!.slice(0, 8).join(', ')}{safeData.fonts!.length > 8 ? '…' : ''}</em>
                      </p>
                    )
                  : undefined
              }
            />
          </div>

          <details style={styles.details}>
            <summary>Full Fingerprint (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(safeData, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function FingerprintCard({
  title,
  data,
  renderCustom,
}: {
  title: string;
  data: unknown;
  renderCustom?: () => React.JSX.Element;
}) {
  const available = data !== null && data !== undefined;
  return (
    <div style={{ ...styles.card, opacity: available ? 1 : 0.5 }}>
      <h4 style={styles.cardTitle}>{title}</h4>
      {available ? (
        renderCustom ? (
          renderCustom()
        ) : (
          <pre style={styles.cardPre}>{JSON.stringify(data, null, 2)}</pre>
        )
      ) : (
        <p style={styles.cardNa}>Not available</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 'clamp(1.1rem, 2.4vw, 1.3rem)', marginBottom: '0.5rem' },
  desc: { color: '#555', lineHeight: 1.6, fontSize: '0.95rem' },
  batchControl: {
    marginTop: '1rem',
    display: 'grid',
    gap: '0.4rem',
    maxWidth: 240,
  },
  inputLabel: {
    fontSize: '0.82rem',
    color: '#555',
    fontWeight: 600,
  },
  input: {
    height: 38,
    border: '1px solid #cfdcf2',
    borderRadius: 6,
    padding: '0 0.75rem',
    fontSize: '0.95rem',
    color: '#1f3f78',
    background: '#fff',
  },
  actions: { display: 'flex', gap: '0.75rem', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  button: {
    padding: '0.6rem 1.4rem',
    fontSize: '0.95rem',
    backgroundColor: '#1f3f78',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    width: '100%',
    maxWidth: 240,
  },
  buttonSecondary: {
    padding: '0.6rem 1.4rem',
    fontSize: '0.95rem',
    backgroundColor: '#eef3fb',
    color: '#1f3f78',
    border: '1px solid #cfdcf2',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    width: '100%',
    maxWidth: 240,
  },
  batchHint: { fontSize: '0.85rem', color: '#666', alignSelf: 'center' },
  error: { color: '#e53935', fontWeight: 600 },
  results: { marginTop: '1rem' },
  subheading: { fontSize: '1rem', marginBottom: '0.75rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  card: {
    background: '#f4f7fc',
    borderRadius: 8,
    padding: '1rem',
    border: '1px solid #d7e1f1',
    overflow: 'hidden',
    minWidth: 0,
  },
  cardTitle: { margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#1f3f78' },
  cardPre: {
    background: '#1a1a2e',
    color: '#a5d6a7',
    padding: '0.5rem',
    borderRadius: 4,
    fontSize: '0.72rem',
    overflow: 'auto',
    maxHeight: 150,
    margin: 0,
  },
  cardNa: { color: '#999', fontSize: '0.85rem', margin: 0 },
  details: { marginTop: '0.75rem' },
  pre: {
    background: '#1a1a2e',
    color: '#a5d6a7',
    padding: '1rem',
    borderRadius: 6,
    fontSize: '0.8rem',
    overflow: 'auto',
    maxHeight: 400,
  },
};

function sanitizeCollectCount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return MIN_COLLECT_COUNT;
  }
  return Math.min(MAX_COLLECT_COUNT, Math.max(MIN_COLLECT_COUNT, parsed));
}
