import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_BASE ??
  "http://localhost:5033/api/geologicalobjects";

interface NavigationStep {
  level: string;
  name: string;
  label: string;
}

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

const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    "top-level": "Верхні категорії",
    "rock-type": "Типи гірських порід",
    "rock-subtype": "Підтипи гірських порід",
    rock: "Гірські породи",
    "silicate-structure": "Силікатні структури",
    "mineral-class": "Класи мінералів",
    mineral: "Мінерали",
  };
  return labels[level] || level;
};

function App() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationPath, setNavigationPath] = useState<NavigationStep[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>("top-level");

  const loadItems = async (level: string, selectedName?: string) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint: string;

      // If no selectedName is provided and level is "top-level", get top-level categories.
      // Otherwise, drill down to the children level.
      if (level === "top-level" && !selectedName) {
        endpoint = `${API_URL}/classes/top-level`;
      } else {
        endpoint = `${API_URL}/classes/cildren-level?currentLevel=${encodeURIComponent(level)}&selectedName=${encodeURIComponent(selectedName || "")}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        const message = await getErrorText(
          response,
          "Не вдалося завантажити дані з API",
        );
        throw new Error(message);
      }

      const data: string[] = await response.json();
      setItems(data);

      // Determine the next level to use when items are clicked
      let nextLevel = level;
      if (level === "top-level") {
        if (selectedName === "Гірські породи") {
          nextLevel = "rock-type";
        } else if (selectedName === "Силікати") {
          nextLevel = "silicate-structure";
        } else if (selectedName === "Мінерали") {
          nextLevel = "mineral-class";
        }
      } else if (level === "rock-type") {
        nextLevel = "rock-subtype";
      } else if (level === "rock-subtype") {
        nextLevel = "rock";
      } else if (level === "rock") {
        nextLevel = "mineral";
      } else if (level === "silicate-structure" || level === "mineral-class") {
        nextLevel = "mineral";
      }
      setCurrentLevel(nextLevel);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Невідома помилка",
      );
      setCurrentLevel(level);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemName: string) => {
    const newStep: NavigationStep = {
      level: currentLevel,
      name: itemName,
      label: itemName,
    };

    setNavigationPath([...navigationPath, newStep]);

    // The actual next level will be determined by the backend
    // We keep currentLevel and send it with selectedName
    void loadItems(currentLevel, itemName);
  };

  const handleBack = () => {
    if (navigationPath.length === 0) return;

    const newPath = navigationPath.slice(0, -1);
    setNavigationPath(newPath);

    if (newPath.length === 0) {
      setCurrentLevel("top-level");
      void loadItems("top-level");
    } else {
      const previousStep = newPath[newPath.length - 1];
      setCurrentLevel(previousStep.level);
      void loadItems(previousStep.level, previousStep.name);
    }
  };

  useEffect(() => {
    void loadItems("top-level");
  }, []);

  const breadcrumbPath = [
    { level: "top-level", label: "Начало" },
    ...navigationPath,
  ];

  return (
    <main className="page">
      <header className="header">
        <h1>Simple Geology</h1>
        <p>Интерактивный справочник геологических объектов</p>
      </header>

      <section className="card">
        <div className="navigation-header">
          <div className="breadcrumb">
            {breadcrumbPath.map((step, index) => (
              <div key={index} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator">→</span>}
                <span className="breadcrumb-text">{step.label}</span>
              </div>
            ))}
          </div>

          {navigationPath.length > 0 && (
            <button className="back-button" onClick={handleBack}>
              ← Назад
            </button>
          )}
        </div>

        <h2>{getLevelLabel(currentLevel)}</h2>

        {loading && <p className="message loading">Завантаження...</p>}
        {error && <p className="error message">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="message">Поки що немає даних.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="category-list">
            {items.map((item) => (
              <li key={item} className="category-item">
                <button
                  className="category-button"
                  onClick={() => handleItemClick(item)}
                >
                  <span className="category-name">{item}</span>
                  <span className="category-arrow">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
