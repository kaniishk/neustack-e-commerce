import { useEffect, useState } from 'react';
import { generateDiscount, getDiscounts } from '../../lib/api';

type GeneratedCode = {
  code: string;
  percent: number;
  createdAt: string;
  used?: boolean;
};

function DiscountGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<GeneratedCode[]>([]);
  const [percentInput, setPercentInput] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const existing = await getDiscounts();
        setCodes(existing);
      } catch (err) {
        // Non-fatal; keep UI usable even if list fails
        console.error(err);
      }
    };
    void load();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = percentInput.trim();
      const overridePercent =
        raw.length > 0 ? Number.parseInt(raw, 10) : undefined;
      const result = await generateDiscount(overridePercent);
      setCodes((prev) => [result, ...prev]);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate discount code.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="stack">
      <div className="stack-sm">
        <div className="section-title">Discount codes</div>
        <p className="muted">
          You can generate one code after each multiple of the configured order
          threshold (for example, every 5th order). Optionally override the default
          percentage for an individual code.
        </p>
        <div className="input-row">
          <input
            className="input"
            type="number"
            min={5}
            max={75}
            step={5}
            placeholder="Percent 5–75, step 5 (optional)"
            value={percentInput}
            onChange={(e) => setPercentInput(e.target.value)}
          />
        <button
          type="button"
          className="button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Generate discount code'}
        </button>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>

      {codes.length > 0 && (
        <div className="stack-sm">
          <div className="section-title">All discount codes</div>
          <div className="chip-row">
            {codes.map((code) => (
              <span key={code.code} className="chip">
                {code.code} – {code.percent}% off
                {code.used ? ' (used)' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default DiscountGenerator;

