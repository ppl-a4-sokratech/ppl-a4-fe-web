import { useMemo } from 'react';
import { useProfileMetrics } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';

type FingerprintCollectMetric = {
  duration: number;
  cached: boolean;
};

type ChartPoint = {
  x: number;
  y: number;
  cached: boolean;
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 240;
const PADDING = { top: 16, right: 20, bottom: 26, left: 44 };

export function MonitoringDemo() {
  const { metrics, refresh, clear } = useProfileMetrics();

  const fingerprintMetrics = useMemo<FingerprintCollectMetric[]>(
    () =>
      metrics
        .filter((metric) => metric.operation === 'fingerprint.collect')
        .map((metric) => ({
          duration: metric.duration,
          cached: metric.metadata?.cached === true,
        })),
    [metrics]
  );

  const durations = useMemo(() => fingerprintMetrics.map((metric) => metric.duration), [fingerprintMetrics]);
  const count = durations.length;
  const avgDuration = count > 0 ? durations.reduce((sum, value) => sum + value, 0) / count : null;
  const p95Duration = calculateP95(durations);
  const cachedCount = fingerprintMetrics.filter((metric) => metric.cached).length;
  const freshCount = count - cachedCount;

  const chart = useMemo(() => {
    if (count === 0) {
      return null;
    }

    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const maxDuration = Math.max(...durations, 1);

    const points: ChartPoint[] = fingerprintMetrics.map((metric, index) => {
      const normalizedX = count === 1 ? 0.5 : index / (count - 1);
      const normalizedY = metric.duration / maxDuration;
      return {
        x: PADDING.left + normalizedX * plotWidth,
        y: PADDING.top + (1 - normalizedY) * plotHeight,
        cached: metric.cached,
      };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    const p95Y =
      p95Duration === null
        ? null
        : PADDING.top + (1 - Math.min(p95Duration / maxDuration, 1)) * plotHeight;

    return {
      points,
      linePath,
      maxDuration,
      p95Y,
      xStart: PADDING.left,
      xEnd: CHART_WIDTH - PADDING.right,
      yBottom: CHART_HEIGHT - PADDING.bottom,
    };
  }, [count, durations, fingerprintMetrics, p95Duration]);

  return (
    <div>
      <h2 style={styles.heading}>Fingerprint Monitoring</h2>
      <p style={styles.desc}>
        Aggregated runtime monitoring derived from profiling logs for <code>fingerprint.collect</code>.
      </p>

      <div style={styles.toolbar}>
        <button onClick={refresh} style={styles.btnPrimary}>
          Refresh
        </button>
        <button onClick={clear} style={styles.btnSecondary}>
          Clear
        </button>
        <span style={styles.count}>
          {count} sample{count !== 1 ? 's' : ''}
        </span>
      </div>

      {count === 0 ? (
        <div style={styles.empty}>
          <p>No fingerprint collect metrics recorded yet.</p>
          <p style={styles.emptyHint}>
            Trigger fingerprint collection from the Fingerprint tab, then click Refresh.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.summaryGrid}>
            <MetricCard label="Average Runtime" value={formatDuration(avgDuration)} />
            <MetricCard label="P95 Latency" value={formatDuration(p95Duration)} />
            <MetricCard label="Cached Samples" value={String(cachedCount)} />
            <MetricCard label="Fresh Samples" value={String(freshCount)} />
          </div>

          {chart && (
            <div style={styles.chartWrapper}>
              <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} style={styles.chart}>
                <line
                  x1={chart.xStart}
                  y1={chart.yBottom}
                  x2={chart.xEnd}
                  y2={chart.yBottom}
                  stroke="#cfdcf2"
                  strokeWidth={1}
                />
                <line
                  x1={chart.xStart}
                  y1={PADDING.top}
                  x2={chart.xStart}
                  y2={chart.yBottom}
                  stroke="#cfdcf2"
                  strokeWidth={1}
                />

                {chart.p95Y !== null && (
                  <line
                    x1={chart.xStart}
                    y1={chart.p95Y}
                    x2={chart.xEnd}
                    y2={chart.p95Y}
                    stroke="#f97316"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                )}

                <path d={chart.linePath} fill="none" stroke="#1f3f78" strokeWidth={2.25} />

                {chart.points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill={point.cached ? '#f97316' : '#2563eb'}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}

                <text x={chart.xStart} y={12} style={styles.maxLabel}>
                  max {chart.maxDuration.toFixed(2)} ms
                </text>

                {p95Duration !== null && chart.p95Y !== null && (
                  <text x={chart.xEnd - 4} y={Math.max(chart.p95Y - 6, 12)} textAnchor="end" style={styles.p95Label}>
                    p95 {p95Duration.toFixed(2)} ms
                  </text>
                )}
              </svg>
              <div style={styles.legend}>
                <span style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: '#2563eb' }} /> Fresh
                </span>
                <span style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: '#f97316' }} /> Cached
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

function calculateP95(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * 0.95) - 1));
  return sorted[index];
}

function formatDuration(value: number | null): string {
  return value === null ? 'N/A' : `${value.toFixed(2)} ms`;
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
    backgroundColor: '#1f3f78',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnSecondary: {
    padding: '0.5rem 1.2rem',
    fontSize: '0.9rem',
    color: '#1f3f78',
    border: '1px solid #cfdcf2',
    backgroundColor: '#eef3fb',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  count: { fontSize: '0.85rem', color: '#888' },
  summaryGrid: {
    display: 'grid',
    gap: '0.75rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    marginBottom: '1rem',
  },
  card: {
    border: '1px solid #d7e1f1',
    background: '#f8fbff',
    borderRadius: 8,
    padding: '0.75rem 0.9rem',
  },
  cardLabel: {
    margin: 0,
    fontSize: '0.76rem',
    textTransform: 'uppercase',
    color: '#61708a',
    letterSpacing: '0.04em',
    fontWeight: 600,
  },
  cardValue: {
    margin: '0.3rem 0 0',
    fontSize: '1.15rem',
    color: '#1f3f78',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  chartWrapper: {
    border: '1px solid #d7e1f1',
    borderRadius: 8,
    padding: '0.75rem',
    background: '#fff',
  },
  chart: { width: '100%', height: 260, display: 'block' },
  legend: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '0.35rem',
    fontSize: '0.8rem',
    color: '#555',
  },
  legendItem: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    display: 'inline-block',
  },
  maxLabel: {
    fontSize: '10px',
    fill: '#64748b',
    fontFamily: 'monospace',
  },
  p95Label: {
    fontSize: '10px',
    fill: '#c2410c',
    fontFamily: 'monospace',
    fontWeight: 700,
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    background: '#fafafa',
    borderRadius: 8,
    border: '1px dashed #ccc',
    color: '#666',
  },
  emptyHint: { fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' },
};
