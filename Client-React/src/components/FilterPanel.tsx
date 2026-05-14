import React from "react";
import "../styles/FilterPanel.css";

export interface MineralFilterState {
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

export const EMPTY_MINERAL_FILTERS: MineralFilterState = {
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

interface FilterPanelProps {
  filters: MineralFilterState;
  onChange: (updated: MineralFilterState) => void;
  onReset: () => void;
}

type TextField = Exclude<
  keyof MineralFilterState,
  "magnetism" | "hasSilicateStructure" | "hasCharacteristics"
>;

type SelectField = "magnetism" | "hasSilicateStructure" | "hasCharacteristics";

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const set = (field: keyof MineralFilterState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const text = (field: TextField, label: string) => (
    <div className="filter-field" key={field}>
      <label className="filter-field-label">{label}</label>
      <input
        type="text"
        value={filters[field]}
        onChange={(e) => set(field, e.target.value)}
        placeholder="будь-яке"
      />
    </div>
  );

  const triState = (field: SelectField, label: string) => (
    <div className="filter-field" key={field}>
      <label className="filter-field-label">{label}</label>
      <select
        value={filters[field]}
        onChange={(e) => set(field, e.target.value as "any" | "true" | "false")}
      >
        <option value="any">Будь-яке</option>
        <option value="true">Так</option>
        <option value="false">Ні</option>
      </select>
    </div>
  );

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <span className="filter-panel-title">Фільтри</span>
        <button type="button" className="filter-panel-reset" onClick={onReset}>
          Скинути
        </button>
      </div>

      {/* Класифікація */}
      <div className="filter-group">
        <span className="filter-group-label">Класифікація</span>
        <div className="filter-fields-grid">
          {text("mineralClass", "Клас мінералу")}
          {text("chemicalFormula", "Хімічна формула")}
          {triState("hasSilicateStructure", "Є силікатна структура")}
          {text("silicateStructure", "Тип силікатної структури")}
          {triState("hasCharacteristics", "Є характеристики")}
        </div>
      </div>

      {/* Зовнішній вигляд */}
      <div className="filter-group">
        <span className="filter-group-label">Зовнішній вигляд</span>
        <div className="filter-fields-grid">
          {text("color", "Колір")}
          {text("streak", "Риса")}
          {text("luster", "Блиск")}
          {text("transparency", "Прозорість")}
          {text("morphology", "Морфологія")}
        </div>
      </div>

      {/* Фізичні властивості */}
      <div className="filter-group">
        <span className="filter-group-label">Фізичні властивості</span>
        <div className="filter-fields-grid">
          {text("cleavage", "Спайність")}
          {text("fracture", "Злам")}
          {text("tenacity", "Крихкість")}
          {triState("magnetism", "Магнетизм")}
        </div>
        <div className="filter-ranges-row">
          <div className="filter-range-pair">
            <div className="filter-field">
              <label className="filter-field-label">Твердість (від)</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={filters.hardnessMin}
                onChange={(e) => set("hardnessMin", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="filter-field">
              <label className="filter-field-label">Твердість (до)</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={filters.hardnessMax}
                onChange={(e) => set("hardnessMax", e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <div className="filter-range-pair">
            <div className="filter-field">
              <label className="filter-field-label">Питома вага (від)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={filters.specificGravityMin}
                onChange={(e) => set("specificGravityMin", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="filter-field">
              <label className="filter-field-label">Питома вага (до)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={filters.specificGravityMax}
                onChange={(e) => set("specificGravityMax", e.target.value)}
                placeholder="∞"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Додаткові відомості */}
      <div className="filter-group">
        <span className="filter-group-label">Додаткові відомості</span>
        <div className="filter-fields-grid">
          {text("paragenesis", "Парагенезис")}
          {text("specialProperties", "Особливі властивості")}
          {text("commonUse", "Застосування")}
          {text("description", "Опис")}
          {text("notes", "Примітки")}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
