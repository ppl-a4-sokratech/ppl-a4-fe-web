import { useSDKFingerprint } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';

export function FingerprintDemo() {
  const { data, loading, error, collect } = useSDKFingerprint();

  return (
    <div>
      <h2 style={styles.heading}>Fingerprint Collection</h2>
      <p style={styles.desc}>
        Collects a unique device fingerprint from audio context, canvas rendering, WebGL info, installed fonts,
        device specs, browser metadata, and screen properties.
      </p>

      <div style={styles.actions}>
        <button onClick={() => collect()} disabled={loading} style={styles.button}>
          {loading ? 'Collecting…' : 'Collect Fingerprint'}
        </button>
        <button onClick={() => collect(true)} disabled={loading} style={styles.buttonSecondary}>
          Force Re-collect
        </button>
      </div>

      {error && <p style={styles.error}>Error: {error}</p>}

      {data && (
        <div style={styles.results}>
          <h3 style={styles.subheading}>
            Collected at {new Date(data.timestamp).toLocaleTimeString()}
          </h3>

          <div style={styles.grid}>
            <FingerprintCard title="Audio" data={data.audio} />
            <FingerprintCard title="Canvas" data={data.canvas} />
            <FingerprintCard title="WebGL" data={data.webgl} />
            <FingerprintCard title="Device" data={data.device} />
            <FingerprintCard title="Browser" data={data.browser} />
            <FingerprintCard title="Screen" data={data.screen} />
            <FingerprintCard
              title="Fonts"
              data={data.fonts}
              renderCustom={
                data.fonts
                  ? () => (
                      <p style={{ fontSize: '0.85rem', color: '#555' }}>
                        {data.fonts!.length} font(s) detected:{' '}
                        <em>{data.fonts!.slice(0, 8).join(', ')}{data.fonts!.length > 8 ? '…' : ''}</em>
                      </p>
                    )
                  : undefined
              }
            />
          </div>

          <details style={styles.details}>
            <summary>Full Fingerprint (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
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
  heading: { fontSize: '1.3rem', marginBottom: '0.5rem' },
  desc: { color: '#555', lineHeight: 1.6 },
  actions: { display: 'flex', gap: '0.75rem', marginBottom: '1rem' },
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
  buttonSecondary: {
    padding: '0.6rem 1.4rem',
    fontSize: '0.95rem',
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
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
    background: '#f8f8fc',
    borderRadius: 8,
    padding: '1rem',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
  cardTitle: { margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#4361ee' },
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
