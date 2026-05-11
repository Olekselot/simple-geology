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

interface MineralCharacteristic {
  mineralId: number;
  mineralName: string;
  chemicalFormula: string | null;
  luster: string | null;
  color: string | null;
  streak: string | null;
  transparency: string | null;
  hardnessMohs: number | null;
  cleavage: string | null;
  fracture: string | null;
  tenacity: string | null;
  specificGravity: number | null;
  magnetism: boolean;
  morphology: string | null;
  paragenesis: string | null;
  specialProperties: string | null;
  notes: string | null;
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
    "mineral-details": "Характеристики мінералу",
  };
  return labels[level] || level;
};

function App() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationPath, setNavigationPath] = useState<NavigationStep[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>("top-level");
  const [selectedMineral, setSelectedMineral] =
    useState<MineralCharacteristic | null>(null);

  const loadItems = async (level: string, selectedName?: string) => {
    setLoading(true);
    setError(null);
    setSelectedMineral(null);

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

  const loadMineralCharacteristics = async (mineralName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/minerals/characteristics?mineralName=${encodeURIComponent(mineralName)}`,
      );

      if (!response.ok) {
        const message = await getErrorText(
          response,
          "Не вдалося завантажити характеристики мінералу",
        );
        throw new Error(message);
      }

      const data: MineralCharacteristic = await response.json();
      setSelectedMineral(data);
      setCurrentLevel("mineral-details");
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

  const handleItemClick = (itemName: string) => {
    const newStep: NavigationStep = {
      level: currentLevel,
      name: itemName,
      label: itemName,
    };

    setNavigationPath([...navigationPath, newStep]);

    if (currentLevel === "mineral") {
      void loadMineralCharacteristics(itemName);
      return;
    }

    // The actual next level will be determined by the backend
    // We keep currentLevel and send it with selectedName
    void loadItems(currentLevel, itemName);
  };

  const handleBack = () => {
    if (navigationPath.length === 0) return;

    const newPath = navigationPath.slice(0, -1);
    setNavigationPath(newPath);

    if (selectedMineral) {
      setSelectedMineral(null);
      setCurrentLevel("mineral");
      return;
    }

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

        {!loading && !error && !selectedMineral && items.length > 0 && (
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

        {!loading && !error && selectedMineral && (
          <section className="mineral-details">
            <h3>{selectedMineral.mineralName}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">ID</span>
                <span className="detail-value">
                  {selectedMineral.mineralId}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Хімічна формула</span>
                <span className="detail-value">
                  {selectedMineral.chemicalFormula || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Блиск</span>
                <span className="detail-value">
                  {selectedMineral.luster || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Колір</span>
                <span className="detail-value">
                  {selectedMineral.color || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Риса</span>
                <span className="detail-value">
                  {selectedMineral.streak || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Прозорість</span>
                <span className="detail-value">
                  {selectedMineral.transparency || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Твердість (Mohs)</span>
                <span className="detail-value">
                  {selectedMineral.hardnessMohs ?? "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Спайність</span>
                <span className="detail-value">
                  {selectedMineral.cleavage || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Злам</span>
                <span className="detail-value">
                  {selectedMineral.fracture || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ковкість</span>
                <span className="detail-value">
                  {selectedMineral.tenacity || "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Питома вага</span>
                <span className="detail-value">
                  {selectedMineral.specificGravity ?? "Немає даних"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Магнетизм</span>
                <span className="detail-value">
                  {selectedMineral.magnetism ? "Так" : "Ні"}
                </span>
              </div>
              <div className="detail-item detail-item-wide">
                <span className="detail-label">Морфологія</span>
                <span className="detail-value">
                  {selectedMineral.morphology || "Немає даних"}
                </span>
              </div>
              <div className="detail-item detail-item-wide">
                <span className="detail-label">Парагенезис</span>
                <span className="detail-value">
                  {selectedMineral.paragenesis || "Немає даних"}
                </span>
              </div>
              <div className="detail-item detail-item-wide">
                <span className="detail-label">Особливі властивості</span>
                <span className="detail-value">
                  {selectedMineral.specialProperties || "Немає даних"}
                </span>
              </div>
              <div className="detail-item detail-item-wide">
                <span className="detail-label">Нотатки</span>
                <span className="detail-value">
                  {selectedMineral.notes || "Немає даних"}
                </span>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
