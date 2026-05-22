import { useState, useEffect } from "react";
import { getAuditLog } from "../../api/adminApi";
import ErrorToast from "./ErrorToast";

interface Props { token: string; }

export default function HistoryMode({ token }: Props) {
  const [log, setLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getAuditLog(token, 200);
      setLog(data);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("uk-UA");
  }

  function opColor(op: string) {
    if (op === "CREATE") return "var(--color-accent)";
    if (op === "UPDATE") return "var(--color-primary)";
    if (op === "DELETE") return "#ff6b6b";
    return "inherit";
  }

  if (loading) return <div className="admin-loading">Завантаження…</div>;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? log.filter((e) =>
        (e.tableName ?? "").toLowerCase().includes(q) ||
        (e.operation ?? "").toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q)
      )
    : log;

  return (
    <div>
      {error && <ErrorToast message={error} onClose={() => setError("")} />}
      <h2>Історія змін (останні 200)</h2>
      <div className="admin-toolbar">
        <input
          className="admin-toolbar__search"
          type="search"
          placeholder="Пошук за таблицею, операцією або описом…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={load}>Оновити</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Час</th>
              <th>Таблиця</th>
              <th>ID запису</th>
              <th>Операція</th>
              <th>Опис</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Немає записів</td></tr>
            )}
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td style={{ whiteSpace: "nowrap" }}>{fmtDate(entry.changedAt)}</td>
                <td>{entry.tableName}</td>
                <td>{entry.recordId ?? "—"}</td>
                <td><span style={{ color: opColor(entry.operation), fontWeight: 700 }}>{entry.operation}</span></td>
                <td>{entry.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
