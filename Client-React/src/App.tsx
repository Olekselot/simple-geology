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

interface SearchResultDto {
  name: string;
  entityType: string;
  entityTypeLabel: string;
}

interface MineralSearchResultDto {
  mineralId: number;
  mineralName: string;
  mineralClass: string | null;
  silicateStructure: string | null;
  chemicalFormula: string | null;
  hardnessMohs: number | null;
  specificGravity: number | null;
  color: string | null;
  luster: string | null;
  magnetism: boolean;
}

interface MineralFilterState {
  chemicalFormula: string;
  mineralClass: string;
  silicateStructure: string;
  luster: string;
  color: string;
  streak: string;
  transparency: string;
  cleavage: string;
  fracture: string;
  tenacity: string;
  morphology: string;
  paragenesis: string;
  specialProperties: string;
  notes: string;
  description: string;
  commonUse: string;
  hardnessMin: string;
  hardnessMax: string;
  specificGravityMin: string;
  specificGravityMax: string;
  magnetism: "any" | "true" | "false";
  hasSilicateStructure: "any" | "true" | "false";
  hasCharacteristics: "any" | "true" | "false";
}

const EMPTY_MINERAL_FILTERS: MineralFilterState = {
  chemicalFormula: "",
  mineralClass: "",
  silicateStructure: "",
  luster: "",
  color: "",
  streak: "",
  transparency: "",
  cleavage: "",
  fracture: "",
  tenacity: "",
  morphology: "",
  paragenesis: "",
  specialProperties: "",
  notes: "",
  description: "",
  commonUse: "",
  hardnessMin: "",
  hardnessMax: "",
  specificGravityMin: "",
  specificGravityMax: "",
  magnetism: "any",
  hasSilicateStructure: "any",
  hasCharacteristics: "any",
};

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResultDto[] | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterMode, setFilterMode] = useState(false);
  const [mineralFilters, setMineralFilters] = useState<MineralFilterState>(
    EMPTY_MINERAL_FILTERS,
  );
  const [mineralSearchResults, setMineralSearchResults] = useState<
    MineralSearchResultDto[] | null
  >(null);

  const loadItems = async (level: string, selectedName?: string) => {
    setLoading(true);
    setError(null);
    setSelectedMineral(null);
    setSearchQuery("");
    setSearchResults(null);
    setMineralSearchResults(null);

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

  const loadMineralCharacteristicsById = async (mineralId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/minerals/characteristics?mineralId=${mineralId}`,
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

  useEffect(() => {
    const hasFilterValues = Object.entries(mineralFilters).some(
      ([key, value]) => {
        if (
          key === "magnetism" ||
          key === "hasSilicateStructure" ||
          key === "hasCharacteristics"
        ) {
          return value !== "any";
        }

        return value.trim().length > 0;
      },
    );

    if (!filterMode) {
      setMineralSearchResults(null);

      if (searchQuery.length < 3) {
        setSearchResults(null);
        return;
      }

      const timer = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const response = await fetch(
            `${API_URL}/search?query=${encodeURIComponent(searchQuery)}`,
          );
          if (!response.ok) {
            const message = await getErrorText(response, "Помилка пошуку");
            throw new Error(message);
          }
          const data: SearchResultDto[] = await response.json();
          setSearchResults(data);
        } catch {
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 350);

      return () => clearTimeout(timer);
    }

    setSearchResults(null);
    if (!hasFilterValues && searchQuery.length < 3) {
      setMineralSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim().length > 0) {
          params.set("query", searchQuery.trim());
        }

        const appendIfValue = (key: string, value: string) => {
          const normalized = value.trim();
          if (normalized.length > 0) {
            params.set(key, normalized);
          }
        };

        appendIfValue("chemicalFormula", mineralFilters.chemicalFormula);
        appendIfValue("mineralClass", mineralFilters.mineralClass);
        appendIfValue("silicateStructure", mineralFilters.silicateStructure);
        appendIfValue("luster", mineralFilters.luster);
        appendIfValue("color", mineralFilters.color);
        appendIfValue("streak", mineralFilters.streak);
        appendIfValue("transparency", mineralFilters.transparency);
        appendIfValue("cleavage", mineralFilters.cleavage);
        appendIfValue("fracture", mineralFilters.fracture);
        appendIfValue("tenacity", mineralFilters.tenacity);
        appendIfValue("morphology", mineralFilters.morphology);
        appendIfValue("paragenesis", mineralFilters.paragenesis);
        appendIfValue("specialProperties", mineralFilters.specialProperties);
        appendIfValue("notes", mineralFilters.notes);
        appendIfValue("description", mineralFilters.description);
        appendIfValue("commonUse", mineralFilters.commonUse);
        appendIfValue("hardnessMin", mineralFilters.hardnessMin);
        appendIfValue("hardnessMax", mineralFilters.hardnessMax);
        appendIfValue("specificGravityMin", mineralFilters.specificGravityMin);
        appendIfValue("specificGravityMax", mineralFilters.specificGravityMax);

        if (mineralFilters.magnetism !== "any") {
          params.set("magnetism", mineralFilters.magnetism);
        }
        if (mineralFilters.hasSilicateStructure !== "any") {
          params.set(
            "hasSilicateStructure",
            mineralFilters.hasSilicateStructure,
          );
        }
        if (mineralFilters.hasCharacteristics !== "any") {
          params.set("hasCharacteristics", mineralFilters.hasCharacteristics);
        }

        const response = await fetch(
          `${API_URL}/search/minerals?${params.toString()}`,
        );
        if (!response.ok) {
          const message = await getErrorText(
            response,
            "Помилка пошуку за фільтрами",
          );
          throw new Error(message);
        }

        const data: MineralSearchResultDto[] = await response.json();
        setMineralSearchResults(data);
      } catch {
        setMineralSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, filterMode, mineralFilters]);

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

  const handleSearchResultClick = (result: SearchResultDto) => {
    setSearchQuery("");
    setSearchResults(null);

    if (result.entityType === "mineral") {
      setNavigationPath([
        { level: "mineral", name: result.name, label: result.name },
      ]);
      void loadMineralCharacteristics(result.name);
      return;
    }

    setNavigationPath([
      { level: result.entityType, name: result.name, label: result.name },
    ]);
    void loadItems(result.entityType, result.name);
  };

  const handleMineralFilterResultClick = (result: MineralSearchResultDto) => {
    setNavigationPath([
      { level: "mineral", name: result.mineralName, label: result.mineralName },
    ]);
    void loadMineralCharacteristicsById(result.mineralId);
  };

  const toggleFilterMode = () => {
    setFilterMode((prev) => {
      const next = !prev;
      setSearchResults(null);
      setMineralSearchResults(null);
      if (!next) {
        setMineralFilters(EMPTY_MINERAL_FILTERS);
      }
      return next;
    });
  };

  const updateMineralFilter = (
    key: keyof MineralFilterState,
    value: string,
  ) => {
    setMineralFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearMineralFilters = () => {
    setMineralFilters(EMPTY_MINERAL_FILTERS);
    setMineralSearchResults(null);
  };

  const handleBack = () => {
    if (navigationPath.length === 0) return;

    const newPath = navigationPath.slice(0, -1);
    setNavigationPath(newPath);

    if (selectedMineral) {
      setSelectedMineral(null);
      setCurrentLevel("mineral");
      setSearchQuery("");
      setSearchResults(null);
      setMineralSearchResults(null);
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

        {!selectedMineral && (
          <div className="search-box">
            <div className="search-mode-row">
              <label className="search-mode-toggle">
                <input
                  type="checkbox"
                  checked={filterMode}
                  onChange={toggleFilterMode}
                />
                <span>Режим фільтрів мінералів</span>
              </label>
              {filterMode && (
                <button
                  type="button"
                  className="filters-reset-button"
                  onClick={clearMineralFilters}
                >
                  Скинути фільтри
                </button>
              )}
            </div>

            <input
              type="text"
              className="search-input"
              placeholder={
                filterMode
                  ? "Пошук мінералу за назвою (без фільтрів: від 3 символів)..."
                  : "Пошук за назвою (від 3 символів)..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {!filterMode &&
              searchQuery.length > 0 &&
              searchQuery.length < 3 && (
                <span className="search-hint">
                  Введіть ще {3 - searchQuery.length} символ(и)
                </span>
              )}

            {filterMode && (
              <div className="filters-grid">
                <input
                  className="filter-input"
                  placeholder="Хімічна формула"
                  value={mineralFilters.chemicalFormula}
                  onChange={(e) =>
                    updateMineralFilter("chemicalFormula", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Клас мінералу"
                  value={mineralFilters.mineralClass}
                  onChange={(e) =>
                    updateMineralFilter("mineralClass", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Силікатна структура"
                  value={mineralFilters.silicateStructure}
                  onChange={(e) =>
                    updateMineralFilter("silicateStructure", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Блиск"
                  value={mineralFilters.luster}
                  onChange={(e) =>
                    updateMineralFilter("luster", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Колір"
                  value={mineralFilters.color}
                  onChange={(e) => updateMineralFilter("color", e.target.value)}
                />
                <input
                  className="filter-input"
                  placeholder="Риса"
                  value={mineralFilters.streak}
                  onChange={(e) =>
                    updateMineralFilter("streak", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Прозорість"
                  value={mineralFilters.transparency}
                  onChange={(e) =>
                    updateMineralFilter("transparency", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Спайність"
                  value={mineralFilters.cleavage}
                  onChange={(e) =>
                    updateMineralFilter("cleavage", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Злам"
                  value={mineralFilters.fracture}
                  onChange={(e) =>
                    updateMineralFilter("fracture", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Ковкість"
                  value={mineralFilters.tenacity}
                  onChange={(e) =>
                    updateMineralFilter("tenacity", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Морфологія"
                  value={mineralFilters.morphology}
                  onChange={(e) =>
                    updateMineralFilter("morphology", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Парагенезис"
                  value={mineralFilters.paragenesis}
                  onChange={(e) =>
                    updateMineralFilter("paragenesis", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Особливі властивості"
                  value={mineralFilters.specialProperties}
                  onChange={(e) =>
                    updateMineralFilter("specialProperties", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Нотатки"
                  value={mineralFilters.notes}
                  onChange={(e) => updateMineralFilter("notes", e.target.value)}
                />
                <input
                  className="filter-input"
                  placeholder="Опис"
                  value={mineralFilters.description}
                  onChange={(e) =>
                    updateMineralFilter("description", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Застосування"
                  value={mineralFilters.commonUse}
                  onChange={(e) =>
                    updateMineralFilter("commonUse", e.target.value)
                  }
                />

                <input
                  className="filter-input"
                  placeholder="Твердість Mohs від"
                  value={mineralFilters.hardnessMin}
                  onChange={(e) =>
                    updateMineralFilter("hardnessMin", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Твердість Mohs до"
                  value={mineralFilters.hardnessMax}
                  onChange={(e) =>
                    updateMineralFilter("hardnessMax", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Питома вага від"
                  value={mineralFilters.specificGravityMin}
                  onChange={(e) =>
                    updateMineralFilter("specificGravityMin", e.target.value)
                  }
                />
                <input
                  className="filter-input"
                  placeholder="Питома вага до"
                  value={mineralFilters.specificGravityMax}
                  onChange={(e) =>
                    updateMineralFilter("specificGravityMax", e.target.value)
                  }
                />

                <select
                  className="filter-input"
                  value={mineralFilters.magnetism}
                  onChange={(e) =>
                    updateMineralFilter("magnetism", e.target.value)
                  }
                >
                  <option value="any">Магнетизм: будь-який</option>
                  <option value="true">Магнетизм: так</option>
                  <option value="false">Магнетизм: ні</option>
                </select>
                <select
                  className="filter-input"
                  value={mineralFilters.hasSilicateStructure}
                  onChange={(e) =>
                    updateMineralFilter("hasSilicateStructure", e.target.value)
                  }
                >
                  <option value="any">Силікатна структура: будь-яка</option>
                  <option value="true">Силікатна структура: є</option>
                  <option value="false">Силікатна структура: немає</option>
                </select>
                <select
                  className="filter-input"
                  value={mineralFilters.hasCharacteristics}
                  onChange={(e) =>
                    updateMineralFilter("hasCharacteristics", e.target.value)
                  }
                >
                  <option value="any">Характеристики: будь-які</option>
                  <option value="true">Характеристики: є</option>
                  <option value="false">Характеристики: немає</option>
                </select>
              </div>
            )}

            {filterMode && (
              <span className="search-hint">
                Фільтри шукають тільки мінерали по всій БД, незалежно від
                поточної категорії.
              </span>
            )}
          </div>
        )}

        {loading && <p className="message loading">Завантаження...</p>}
        {error && <p className="error message">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="message">Поки що немає даних.</p>
        )}

        {searchLoading && <p className="message loading">Пошук...</p>}

        {!searchLoading && !filterMode && searchResults !== null && (
          <>
            {searchResults.length === 0 ? (
              <p className="message">
                Нічого не знайдено за запитом "{searchQuery}".
              </p>
            ) : (
              <ul className="category-list">
                {searchResults.map((result, idx) => (
                  <li key={idx} className="category-item">
                    <button
                      className="category-button"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <span className="category-name">{result.name}</span>
                      <span className="search-result-type">
                        {result.entityTypeLabel}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!searchLoading && filterMode && mineralSearchResults !== null && (
          <>
            {mineralSearchResults.length === 0 ? (
              <p className="message">
                Нічого не знайдено за вказаними фільтрами.
              </p>
            ) : (
              <ul className="category-list">
                {mineralSearchResults.map((result) => (
                  <li key={result.mineralId} className="category-item">
                    <button
                      className="category-button"
                      onClick={() => handleMineralFilterResultClick(result)}
                    >
                      <div className="filter-result-main">
                        <span className="category-name">
                          {result.mineralName}
                        </span>
                        <span className="search-result-type">Мінерал</span>
                      </div>
                      <span className="filter-result-meta">
                        {result.mineralClass || "Без класу"}
                        {result.chemicalFormula
                          ? ` • ${result.chemicalFormula}`
                          : ""}
                        {result.hardnessMohs !== null
                          ? ` • Mohs ${result.hardnessMohs}`
                          : ""}
                        {result.magnetism ? " • Магнітний" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!loading &&
          !error &&
          !selectedMineral &&
          searchResults === null &&
          mineralSearchResults === null &&
          items.length > 0 && (
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
