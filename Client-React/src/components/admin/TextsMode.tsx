import { useState, useEffect } from "react";
import { getSiteTexts, updateSiteText } from "../../api/adminApi";

interface Props {
  token: string;
}

export default function TextsMode({ token }: Props) {
  const [texts, setTexts] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getSiteTexts(token);
      setTexts(data);
      const d: Record<string, string> = {};
      data.forEach((t: any) => {
        d[t.key] = t.value;
      });
      setDrafts(d);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handleSave(key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    setError("");
    try {
      await updateSiteText(token, key, drafts[key] ?? "");
      setSuccess(`Збережено: ${key}`);
      setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving((s) => ({ ...s, [key]: false }));
  }

  if (loading) return <div className="admin-loading">Завантаження…</div>;

  return (
    <div>
      {error && <div className="admin-error">{error}</div>}
      {success && (
        <div
          style={{
            color: "var(--color-accent)",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
        >
          {success}
        </div>
      )}
      <div className="admin-section-header">
        <h2>Тексти сайту</h2>
      </div>
      <div className="admin-inline-edit">
        {texts.length === 0 && (
          <div className="admin-loading">
            Немає текстів. Додайте записи в таблицю site_texts через БД.
          </div>
        )}
        {texts.map((t) => (
          <div key={t.key} className="admin-text-row">
            <div className="admin-text-row__key">{t.key}</div>
            {t.description && (
              <div className="admin-text-row__desc">{t.description}</div>
            )}
            <div className="admin-text-row__editor">
              <textarea
                value={drafts[t.key] ?? t.value}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [t.key]: e.target.value }))
                }
              />
              <button
                className="admin-btn admin-btn--small"
                onClick={() => handleSave(t.key)}
                disabled={saving[t.key] || drafts[t.key] === t.value}
              >
                {saving[t.key] ? "…" : "Зберегти"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
