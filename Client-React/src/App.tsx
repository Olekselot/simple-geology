import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type GeologicalObject = {
  id: number;
  name: string;
  type: string;
  depthMeters: number;
  description: string;
};

const API_URL =
  import.meta.env.VITE_API_BASE ??
  "http://localhost:5033/api/geologicalobjects";

const getErrorText = async (response: Response, fallback: string) => {
  try {
    const payload = await response.json();

    if (typeof payload?.error === "string") {
      return payload.error;
    }

    if (typeof payload?.title === "string") {
      return payload.title;
    }
  } catch {
    // Ignore invalid JSON body and use fallback message.
  }

  return fallback;
};

function App() {
  const [items, setItems] = useState<GeologicalObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [depthMeters, setDepthMeters] = useState(0);
  const [description, setDescription] = useState("");

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.depthMeters - b.depthMeters),
    [items],
  );

  const loadItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const message = await getErrorText(
          response,
          "Не вдалося завантажити дані з API",
        );
        throw new Error(message);
      }

      const data: GeologicalObject[] = await response.json();
      setItems(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Невідома помилка",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          depthMeters,
          description,
        }),
      });

      if (!response.ok) {
        const message = await getErrorText(
          response,
          "Не вдалося створити геологічний обʼєкт",
        );
        throw new Error(message);
      }

      setName("");
      setType("");
      setDepthMeters(0);
      setDescription("");
      await loadItems();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Невідома помилка",
      );
    }
  };

  return (
    <main className="page">
      <header className="header">
        <h1>Simple Geology</h1>
        <p>Курсова: приклад 3-шарової архітектури (React + API + BLL + DAL)</p>
      </header>

      <section className="card">
        <h2>Додати обʼєкт</h2>
        <form onSubmit={onSubmit} className="form-grid">
          <label>
            Назва
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Тип
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </label>

          <label>
            Глибина (м)
            <input
              type="number"
              min={0}
              step="0.1"
              value={depthMeters}
              onChange={(e) => setDepthMeters(Number(e.target.value))}
              required
            />
          </label>

          <label className="full-width">
            Опис
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <button type="submit">Зберегти</button>
        </form>
      </section>

      <section className="card">
        <h2>Список обʼєктів</h2>

        {loading && <p>Завантаження...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && sortedItems.length === 0 && (
          <p>Поки що немає даних.</p>
        )}

        {!loading && !error && sortedItems.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Тип</th>
                <th>Глибина (м)</th>
                <th>Опис</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.depthMeters}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default App;
