import { useEffect, useState } from "react";
import "../styles/App.css";
import BubbleAmbientAnimation from "./BubbleAmbientAnimation";
import BubbleButtonGrid, { type BubbleGridEntry } from "./BubbleButtonGrid";
import SearchBar from "./SearchBar";
import FilterPanel, {
  type MineralFilterState,
  EMPTY_MINERAL_FILTERS,
} from "./FilterPanel";

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
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [showSearchLoadingMessage, setShowSearchLoadingMessage] =
    useState(false);

  // Delay showing loading message by 0.5 second
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoadingMessage(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingMessage(false);
    }
  }, [loading]);

  // Delay showing search loading message by 0.5 second
  useEffect(() => {
    if (searchLoading) {
      const timer = setTimeout(() => setShowSearchLoadingMessage(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowSearchLoadingMessage(false);
    }
  }, [searchLoading]);

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

  const navigationEntries: BubbleGridEntry[] = items.map((item) => ({
    key: item,
    label: item,
    onClick: () => handleItemClick(item),
  }));

  const searchEntries: BubbleGridEntry[] =
    searchResults?.map((result, idx) => ({
      key: `${result.entityType}-${result.name}-${idx}`,
      label: result.name,
      badge: result.entityTypeLabel,
      onClick: () => handleSearchResultClick(result),
    })) ?? [];

  const mineralFilterEntries: BubbleGridEntry[] =
    mineralSearchResults?.map((result) => ({
      key: `${result.mineralId}`,
      label: result.mineralName,
      badge: "Мінерал",
      meta: [
        result.mineralClass || "Без класу",
        result.chemicalFormula,
        result.hardnessMohs !== null ? `Mohs ${result.hardnessMohs}` : null,
        result.magnetism ? "Магнітний" : null,
      ]
        .filter(Boolean)
        .join(" • "),
      onClick: () => handleMineralFilterResultClick(result),
    })) ?? [];

  const backAction =
    navigationPath.length > 0
      ? {
          label: "← Назад",
          onClick: handleBack,
          variant: "back" as const,
        }
      : undefined;

  const hasVisibleButtons =
    selectedMineral !== null ||
    items.length > 0 ||
    (searchResults !== null && searchResults.length > 0) ||
    (mineralSearchResults !== null && mineralSearchResults.length > 0) ||
    backAction !== undefined;

  return (
    <main className="page">
      <BubbleAmbientAnimation visible={hasVisibleButtons} />
      <section className="card">
        {!selectedMineral && (
          <div className="search-box">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterActive={filterMode}
              onFilterToggle={() => setFilterMode((prev) => !prev)}
            />

            {!filterMode &&
              searchQuery.length > 0 &&
              searchQuery.length < 3 && (
                <span className="search-hint">
                  Введіть ще {3 - searchQuery.length} символ(и)
                </span>
              )}

            <div
              className={`filter-panel-dropdown${filterMode ? " open" : ""}`}
              aria-hidden={!filterMode}
            >
              <FilterPanel
                filters={mineralFilters}
                onChange={setMineralFilters}
                onReset={() => setMineralFilters(EMPTY_MINERAL_FILTERS)}
              />
            </div>
          </div>
        )}

        {showLoadingMessage && (
          <p className="message loading">Завантаження...</p>
        )}
        {error && <p className="error message">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="message">Поки що немає даних.</p>
        )}

        {showSearchLoadingMessage && (
          <p className="message loading">Пошук...</p>
        )}

        {!searchLoading && !filterMode && searchResults !== null && (
          <>
            {searchResults.length === 0 ? (
              <p className="message">
                Нічого не знайдено за запитом "{searchQuery}".
              </p>
            ) : (
              <BubbleButtonGrid
                entries={searchEntries}
                trailingAction={backAction}
              />
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
              <BubbleButtonGrid
                entries={mineralFilterEntries}
                trailingAction={backAction}
              />
            )}
          </>
        )}

        {!loading &&
          !error &&
          !selectedMineral &&
          searchResults === null &&
          mineralSearchResults === null &&
          items.length > 0 && (
            <BubbleButtonGrid
              entries={navigationEntries}
              trailingAction={backAction}
            />
          )}

        {!loading && !error && selectedMineral && (
          <section className="mineral-details-shell">
            <BubbleButtonGrid entries={[]} trailingAction={backAction} />
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
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
