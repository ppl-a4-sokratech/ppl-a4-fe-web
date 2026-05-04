import { useState } from 'react';
import { useBehavioralAnalysis } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import type { BehavioralAnalysisResult } from '@ppl-sokratech-sdk/ppl-a4-sdk-web';
import { sanitizeAnalysisResult, useConfigCheck } from '@/app/providers';

export function AnalyzerDemo() {
  const { analyze, isRuleBasedEnabled } = useBehavioralAnalysis();
  const { sdkRecipes } = useConfigCheck();
  const ruleBasedActive = Boolean(sdkRecipes.behavioral?.ruleBased && isRuleBasedEnabled);
  const [result, setResult] = useState<BehavioralAnalysisResult | null>(null);
  const [analyzeCount, setAnalyzeCount] = useState(0);

  const handleAnalyze = () => {
    const analysisResult = sanitizeAnalysisResult(analyze(), sdkRecipes);
    setResult(analysisResult);
    setAnalyzeCount((c) => c + 1);
  };

  const countFlags = (flags: BehavioralAnalysisResult['flags']) => {
    if (!flags) return 0;
    return Object.values(flags).filter(Boolean).length;
  };

  return (
    <div>
      <h2 style={styles.heading}>Behavioral Analyzer</h2>
      <p style={styles.desc}>
        The Analyzer processes behavioral data (mouse, keyboard, clicks, scroll) and runs rule-based bot detection.
        Interact with the page, then click <strong>Analyze Behavior</strong> to see raw events and bot detection flags.
      </p>

      <div style={styles.statusBadge}>
        <span style={{
          ...styles.badge,
          backgroundColor: ruleBasedActive ? '#dcfce7' : '#fee2e2',
          color: ruleBasedActive ? '#166534' : '#991b1b',
        }}>
          Rule-Based Analysis: {ruleBasedActive ? '✓ Enabled' : '✗ Disabled'}
        </span>
      </div>

      <div style={styles.interactionArea}>
        <p style={{ margin: 0, color: '#888' }}>
          🖱️ Move your mouse, scroll, click, and type to generate behavioral data…
        </p>
        <input
          type="text"
          placeholder="Type something here…"
          style={styles.input}
        />
      </div>

      <button onClick={handleAnalyze} style={styles.button}>
        Analyze Behavior
      </button>

      {result && (
        <div style={styles.results}>
          <h3 style={styles.subheading}>
            Analysis #{analyzeCount} — {new Date().toLocaleTimeString()}
          </h3>

          {/* Bot Detection Flags */}
          {result.flags && (
            <div style={styles.flagsSection}>
              <h4 style={styles.flagsHeading}>
                🛡️ Bot Detection Flags ({countFlags(result.flags)}/10 triggered)
              </h4>
              <div style={styles.flagsGrid}>
                {Object.entries(result.flags).map(([key, value]) => (
                  <FlagItem key={key} name={key} triggered={value as boolean} />
                ))}
              </div>
            </div>
          )}

          {!result.flags && (
            <div style={styles.noFlagsSection}>
              <p style={{ margin: 0, color: '#666' }}>
                ⚠️ Rule-based analysis is disabled. Enable <code>ruleBased: true</code> in SDK config to see bot detection flags.
              </p>
            </div>
          )}

          {/* Payload Stats */}
          <div style={styles.payloadSection}>
            <h4 style={styles.payloadHeading}>📊 Raw Payload Stats</h4>
            <div style={styles.statRow}>
              <Stat label="Cursor Events" value={result.payload.cursorEvents?.length ?? 0} />
              <Stat label="Key Events" value={result.payload.keyEvents?.length ?? 0} />
              <Stat label="Click Events" value={result.payload.clickEvents?.length ?? 0} />
              <Stat label="Scroll Events" value={result.payload.mouseScrollEvents?.length ?? 0} />
            </div>
          </div>

          {/* Full Result JSON */}
          <details style={styles.details}>
            <summary>Full Analysis Result (JSON)</summary>
            <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

function FlagItem({ name, triggered }: { name: string; triggered: boolean }) {
  const formatName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div style={{
      ...styles.flagItem,
      backgroundColor: triggered ? '#fef2f2' : '#f0fdf4',
      borderColor: triggered ? '#fecaca' : '#bbf7d0',
    }}>
      <span style={{
        ...styles.flagIcon,
        color: triggered ? '#dc2626' : '#16a34a',
      }}>
        {triggered ? '⚠️' : '✓'}
      </span>
      <span style={styles.flagName}>{formatName(name)}</span>
      <span style={{
        ...styles.flagStatus,
        color: triggered ? '#dc2626' : '#16a34a',
      }}>
        {triggered ? 'Triggered' : 'OK'}
      </span>
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
  statusBadge: { marginBottom: '1rem' },
  badge: {
    display: 'inline-block',
    padding: '0.35rem 0.75rem',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: 600,
  },
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
    backgroundColor: '#7c3aed',
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
  flagsSection: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: '1rem',
    marginBottom: '1rem',
  },
  noFlagsSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: '1rem',
    marginBottom: '1rem',
    border: '1px solid #fde68a',
  },
  flagsHeading: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: '#333',
  },
  flagsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.5rem',
  },
  flagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 6,
    border: '1px solid',
  },
  flagIcon: { fontSize: '0.9rem' },
  flagName: { flex: 1, fontSize: '0.8rem', color: '#333' },
  flagStatus: { fontSize: '0.75rem', fontWeight: 600 },
  payloadSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: '1rem',
    marginBottom: '1rem',
  },
  payloadHeading: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: '#0369a1',
  },
  statRow: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    flex: '1 1 100px',
    border: '1px solid #e0f2fe',
  },
  statValue: { fontSize: '1.5rem', fontWeight: 700, color: '#0284c7' },
  statLabel: { fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', textAlign: 'center' },
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
