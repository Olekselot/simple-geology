import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/App.css";
import BubbleAmbientAnimation from "./BubbleAmbientAnimation";
import BubbleButtonGrid, {
  type BubbleGridEntry,
  getBubbleMainSize,
} from "./BubbleButtonGrid";
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
  hasImage: boolean;
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

const translateError = (message: string): string => {
  if (message.toLowerCase().includes("failed to fetch")) {
    return "Не вдалося з'єднатися з сервером";
  }
  return message;
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
  } catch {}

  return fallback;
};

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ye",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "yi",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "yu",
  я: "ya",
};

const mineralNameToSlug = (name: string) => {
  const transliterated = name
    .trim()
    .toLowerCase()
    .replace(/[а-яіїєґь]/g, (char) => CYRILLIC_TO_LATIN[char] ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
};

const slugToQuery = (slug: string) => slug.replace(/-/g, " ").trim();

function App() {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const navigate = useNavigate();
  const { mineralSlug } = useParams<{ mineralSlug?: string }>();
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
  const [heroExiting, setHeroExiting] = useState(false);

  const navigateToMineral = (mineralName: string) => {
    const slug = mineralNameToSlug(mineralName);
    if (!slug) {
      return;
    }

    const destination = `/${slug}`;
    if (destination !== `/${mineralSlug ?? ""}`) {
      navigate(destination);
    }
  };

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoadingMessage(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingMessage(false);
    }
  }, [loading]);

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
          ? translateError(requestError.message)
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
      navigateToMineral(data.mineralName);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? translateError(requestError.message)
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
      navigateToMineral(data.mineralName);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? translateError(requestError.message)
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
    setMineralFilters(EMPTY_MINERAL_FILTERS);
    setMineralSearchResults(null);
    setSearchQuery("");
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
      setSearchQuery("");
      setSearchResults(null);
      setMineralSearchResults(null);
      navigate("/");

      if (newPath.length === 0) {
        setCurrentLevel("top-level");
        void loadItems("top-level");
      } else {
        const previousStep = newPath[newPath.length - 1];
        setCurrentLevel(previousStep.level);
        void loadItems(previousStep.level, previousStep.name);
      }
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
    if (mineralSlug || selectedMineral || navigationPath.length > 0) {
      return;
    }

    void loadItems("top-level");
  }, [mineralSlug, navigationPath.length, selectedMineral]);

  useEffect(() => {
    if (!mineralSlug) {
      return;
    }

    if (
      selectedMineral &&
      mineralNameToSlug(selectedMineral.mineralName) === mineralSlug
    ) {
      return;
    }

    let isActive = true;

    const resolveMineralFromSlug = async () => {
      setLoading(true);
      setError(null);

      const query = slugToQuery(mineralSlug);
      if (query.length < 3) {
        if (!isActive) {
          return;
        }

        navigate("/404", { replace: true });
        return;
      }

      setSearchQuery("");
      setSearchResults(null);
      setMineralSearchResults(null);

      try {
        const findMatchedBySlug = (items: MineralSearchResultDto[]) =>
          items.find(
            (item) => mineralNameToSlug(item.mineralName) === mineralSlug,
          );

        let matched: MineralSearchResultDto | undefined;
        const queryResponse = await fetch(
          `${API_URL}/search/minerals?query=${encodeURIComponent(query)}&limit=500`,
        );

        if (queryResponse.ok) {
          const candidates: MineralSearchResultDto[] =
            await queryResponse.json();
          matched = findMatchedBySlug(candidates);
        }

        if (!matched) {
          const fallbackResponse = await fetch(
            `${API_URL}/search/minerals?hasCharacteristics=true&limit=5000`,
          );

          if (!fallbackResponse.ok) {
            const message = await getErrorText(
              fallbackResponse,
              "Помилка пошуку мінералу",
            );
            throw new Error(message);
          }

          const fallbackCandidates: MineralSearchResultDto[] =
            await fallbackResponse.json();
          matched = findMatchedBySlug(fallbackCandidates);
        }

        if (!isActive) {
          return;
        }

        if (!matched) {
          navigate("/404", { replace: true });
          return;
        }

        const detailsResponse = await fetch(
          `${API_URL}/minerals/characteristics?mineralId=${matched.mineralId}`,
        );

        if (!detailsResponse.ok) {
          const message = await getErrorText(
            detailsResponse,
            "Не вдалося завантажити характеристики мінералу",
          );
          throw new Error(message);
        }

        const details: MineralCharacteristic = await detailsResponse.json();

        if (!isActive) {
          return;
        }

        setNavigationPath([
          {
            level: "mineral",
            name: details.mineralName,
            label: details.mineralName,
          },
        ]);
        setSelectedMineral(details);
        setCurrentLevel("mineral-details");
        setError(null);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const message =
          requestError instanceof Error
            ? translateError(requestError.message)
            : "Не вдалося відкрити сторінку мінералу";
        setError(message);
        setSelectedMineral(null);
        navigate("/404", { replace: true });
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void resolveMineralFromSlug();

    return () => {
      isActive = false;
    };
  }, [mineralSlug, navigate]);

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

  const isFilterDrawerVisible = filterMode && !selectedMineral;

  const isAtRoot =
    navigationPath.length === 0 &&
    !selectedMineral &&
    searchQuery.length === 0 &&
    !filterMode;

  const heroVisible = isAtRoot || heroExiting;

  useEffect(() => {
    if (!isAtRoot && !heroExiting) {
      return;
    }
    if (isAtRoot) {
      setHeroExiting(false);
      return;
    }
    setHeroExiting(true);
    const t = setTimeout(() => setHeroExiting(false), 380);
    return () => clearTimeout(t);
  }, [isAtRoot]);

  return (
    <main className={`page${isFilterDrawerVisible ? " filter-open" : ""}`}>
      <BubbleAmbientAnimation visible={hasVisibleButtons} />
      <section className="card">
        {heroVisible && (
          <div className={`home-hero${heroExiting ? " home-hero--exit" : ""}`}>
            <h1 className="home-hero__title">Simple Geology</h1>
            <p className="home-hero__subtitle">
              Інтерактивний довідник мінералів та&nbsp;гірських порід
            </p>
          </div>
        )}
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

        {!loading && !error && !selectedMineral && items.length === 0 && (
          <section className="no-data-state">
            <p className="message">Поки що немає даних.</p>
            {backAction && (
              <div className="no-data-actions">
                <button
                  type="button"
                  className="leaflet-back-button"
                  onClick={handleBack}
                >
                  <span className="leaflet-back-button__arrow">←</span>
                  <span className="leaflet-back-button__label">Назад</span>
                </button>
              </div>
            )}
          </section>
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
                forceMainSize={getBubbleMainSize(
                  viewportWidth,
                  navigationEntries.length,
                )}
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
              forceMainSize={undefined}
            />
          )}

        {!loading && !error && selectedMineral && (
          <section className="mineral-details-shell">
            <section className="mineral-details">
              <div className="leaflet-title-row">
                <h3 className="leaflet-title">{selectedMineral.mineralName}</h3>
                <button
                  type="button"
                  className="leaflet-back-button"
                  onClick={handleBack}
                >
                  <span className="leaflet-back-button__arrow">←</span>
                  <span className="leaflet-back-button__label">Назад</span>
                </button>
              </div>

              <div className="mineral-image-section">
                <BubbleAmbientAnimation visible />
                {selectedMineral.hasImage ? (
                  <img
                    className="mineral-image"
                    src={`${API_URL}/minerals/${selectedMineral.mineralId}/image`}
                    alt={selectedMineral.mineralName}
                  />
                ) : (
                  <div className="mineral-image-placeholder">Фото відсутнє</div>
                )}
              </div>
              <div className="detail-grid">
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
