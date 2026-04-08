import { useProfileMetrics } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';

export function ProfilingDemo() {
  const { metrics, refresh, clear } = useProfileMetrics();

  return (
    <div>
      <h2 style={styles.heading}>SDK Performance Profiling</h2>
      <p style={styles.desc}>
        Tracks timing metrics for all internal SDK operations — initialization, fingerprint collection,
        behavioral drain, detection, and flush. Trigger actions in other tabs then refresh here to see results.
      </p>

      <div style={styles.toolbar}>
        <button onClick={refresh} style={styles.btnPrimary}>
          ↻ Refresh
        </button>
        <button onClick={clear} style={styles.btnSecondary}>
          ✕ Clear
        </button>
        <span style={styles.count}>
          {metrics.length} metric{metrics.length !== 1 ? 's' : ''}
        </span>
      </div>

      {metrics.length === 0 ? (
        <div style={styles.empty}>
          <p>No metrics recorded yet.</p>
          <p style={styles.emptyHint}>
            Use other tabs to trigger SDK operations (collect fingerprint, run detection, drain
            behavioral events), then click Refresh.
          </p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Operation</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Duration (ms)</th>
                <th style={styles.th}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={{ ...styles.td, ...styles.operation }}>{m.operation}</td>
                  <td style={{ ...styles.td, textAlign: 'right', ...styles.duration }}>
                    {m.duration.toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    {m.metadata && Object.keys(m.metadata).length > 0 ? (
                      <span style={styles.meta}>{JSON.stringify(m.metadata)}</span>
                    ) : (
                      <span style={styles.metaNone}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 'clamp(1.1rem, 2.4vw, 1.3rem)', marginBottom: '0.5rem' },
  desc: { color: '#555', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.25rem' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '0.5rem 1.2rem',
    fontSize: '0.9rem',
    backgroundColor: '#4361ee',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnSecondary: {
    padding: '0.5rem 1.2rem',
    fontSize: '0.9rem',
    backgroundColor: 'transparent',
    color: '#e53935',
    border: '2px solid #e53935',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  count: { fontSize: '0.85rem', color: '#888' },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    background: '#fafafa',
    borderRadius: 8,
    border: '1px dashed #ccc',
    color: '#666',
  },
  emptyHint: { fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' },
  tableWrapper: { overflowX: 'auto', borderRadius: 8, border: '1px solid #e0e0e0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: {
    padding: '0.65rem 1rem',
    background: '#f4f4f5',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#555',
    borderBottom: '1px solid #e0e0e0',
  },
  td: { padding: '0.6rem 1rem', verticalAlign: 'middle', borderBottom: '1px solid #f0f0f0' },
  rowEven: { background: '#fff' },
  rowOdd: { background: '#fafafa' },
  operation: { fontFamily: 'monospace', color: '#2563eb', fontWeight: 500 },
  duration: { fontFamily: 'monospace', fontWeight: 600, color: '#16a34a' },
  meta: { fontFamily: 'monospace', fontSize: '0.78rem', color: '#666', wordBreak: 'break-all' },
  metaNone: { color: '#bbb' },
};
