import { useState, useEffect } from "react";
import ConfirmDialog from "./ConfirmDialog";
import ErrorToast from "./ErrorToast";
import {
  getTopLevelCategories, addTopLevelCategory, updateTopLevelCategory, deleteTopLevelCategory,
  getRockTypes, addRockType, updateRockType, deleteRockType,
  getRockSubtypes, addRockSubtype, updateRockSubtype, deleteRockSubtype,
  getMineralClasses, addMineralClass, updateMineralClass, deleteMineralClass,
  getSilicateStructures, addSilicateStructure, updateSilicateStructure, deleteSilicateStructure,
} from "../../api/adminApi";

interface Props { token: string; }

type EntityType = "topLevel" | "rockType" | "rockSubtype" | "mineralClass" | "silicateStructure";

function emptyForm(type: EntityType, extra?: any) {
  if (type === "topLevel") return { name: "", sourceTable: "", hasItems: false };
  if (type === "rockType") return { name: "", topLevelCategoryId: extra?.topLevelId ?? "" };
  if (type === "rockSubtype") return { name: "", rockTypeId: extra?.rockTypeId ?? "" };
  if (type === "mineralClass") return { name: "" };
  if (type === "silicateStructure") return { name: "" };
  return {};
}

export default function HierarchyMode({ token }: Props) {
  const [topLevel, setTopLevel] = useState<any[]>([]);
  const [rockTypes, setRockTypes] = useState<any[]>([]);
  const [rockSubtypes, setRockSubtypes] = useState<any[]>([]);
  const [mineralClasses, setMineralClasses] = useState<any[]>([]);
  const [silicateStructures, setSilicateStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState<{ open: boolean; type: EntityType; editing: any | null; form: any }>({
    open: false, type: "topLevel", editing: null, form: {},
  });
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [tl, rt, rs, mc, ss] = await Promise.all([
        getTopLevelCategories(token),
        getRockTypes(token),
        getRockSubtypes(token),
        getMineralClasses(token),
        getSilicateStructures(token),
      ]);
      setTopLevel(tl);
      setRockTypes(rt);
      setRockSubtypes(rs);
      setMineralClasses(mc);
      setSilicateStructures(ss);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  function openAdd(type: EntityType, extra?: any) {
    setModal({ open: true, type, editing: null, form: emptyForm(type, extra) });
  }

  function openEdit(type: EntityType, item: any) {
    let form: any = {};
    if (type === "topLevel") form = { name: item.name, sourceTable: item.sourceTable, hasItems: item.hasItems };
    else if (type === "rockType") form = { name: item.name, topLevelCategoryId: item.topLevelCategoryId };
    else if (type === "rockSubtype") form = { name: item.name, rockTypeId: item.rockTypeId };
    else if (type === "mineralClass") form = { name: item.name };
    else if (type === "silicateStructure") form = { name: item.name };
    setModal({ open: true, type, editing: item, form });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { type, editing, form } = modal;
      if (editing) {
        if (type === "topLevel") await updateTopLevelCategory(token, editing.id, form);
        else if (type === "rockType") await updateRockType(token, editing.id, form);
        else if (type === "rockSubtype") await updateRockSubtype(token, editing.id, form);
        else if (type === "mineralClass") await updateMineralClass(token, editing.id, form);
        else if (type === "silicateStructure") await updateSilicateStructure(token, editing.id, form);
      } else {
        if (type === "topLevel") await addTopLevelCategory(token, form);
        else if (type === "rockType") await addRockType(token, form);
        else if (type === "rockSubtype") await addRockSubtype(token, form);
        else if (type === "mineralClass") await addMineralClass(token, form);
        else if (type === "silicateStructure") await addSilicateStructure(token, form);
      }
      setModal((m) => ({ ...m, open: false }));
      await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(type: EntityType, id: number) {
    setPending(() => async () => {
      setPending(null);
      try {
        if (type === "topLevel") await deleteTopLevelCategory(token, id);
        else if (type === "rockType") await deleteRockType(token, id);
        else if (type === "rockSubtype") await deleteRockSubtype(token, id);
        else if (type === "mineralClass") await deleteMineralClass(token, id);
        else if (type === "silicateStructure") await deleteSilicateStructure(token, id);
        await load();
      } catch (e: any) { setError(e.message); }
    });
  }

  if (loading) return <div className="admin-loading">Завантаження…</div>;

  const q = search.trim().toLowerCase();
  const filt = <T extends { name: string }>(arr: T[]) => q ? arr.filter((x) => x.name.toLowerCase().includes(q)) : arr;

  return (
    <div>
      {error && <ErrorToast message={error} onClose={() => setError("")} />}
      <div className="admin-search-bar" style={{ marginBottom: 20 }}>
        <input
          type="search"
          placeholder="Пошук за назвою по всій ієрархії…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Top-level categories */}
      <div className="admin-section-header">
        <h2>Категорії верхнього рівня</h2>
        <button className="admin-btn admin-btn--small" onClick={() => openAdd("topLevel")}>+ Додати</button>
      </div>
      <div className="admin-tree">
        {filt(topLevel).map((tl) => (
          <div key={tl.id} className="admin-tree__node admin-tree__node--top">
            <div className="admin-tree__row">
              <span className="admin-tree__label">{tl.name}</span>
              <span className="admin-tree__meta">{tl.sourceTable}</span>
              <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={() => openEdit("topLevel", tl)}>Редагувати</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete("topLevel", tl.id)}>Видалити</button>
            </div>
          </div>
        ))}
      </div>

      {/* Rock types */}
      <div className="admin-section-header" style={{ marginTop: 28 }}>
        <h2>Типи порід</h2>
        <button className="admin-btn admin-btn--small" onClick={() => openAdd("rockType")}>+ Додати</button>
      </div>
      <div className="admin-tree">
        {filt(rockTypes).map((rt) => {
          const parent = topLevel.find((t) => t.id === rt.topLevelCategoryId);
          return (
            <div key={rt.id} className="admin-tree__node admin-tree__node--sub">
              <div className="admin-tree__row">
                <span className="admin-tree__label">{rt.name}</span>
                <span className="admin-tree__meta">{parent?.name ?? `id:${rt.topLevelCategoryId}`}</span>
                <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={() => openEdit("rockType", rt)}>Редагувати</button>
                <button className="admin-btn admin-btn--danger" onClick={() => handleDelete("rockType", rt.id)}>Видалити</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rock subtypes */}
      <div className="admin-section-header" style={{ marginTop: 28 }}>
        <h2>Підтипи порід</h2>
        <button className="admin-btn admin-btn--small" onClick={() => openAdd("rockSubtype")}>+ Додати</button>
      </div>
      <div className="admin-tree">
        {filt(rockSubtypes).map((rs) => {
          const parent = rockTypes.find((t) => t.id === rs.rockTypeId);
          return (
            <div key={rs.id} className="admin-tree__node admin-tree__node--leaf">
              <div className="admin-tree__row">
                <span className="admin-tree__label">{rs.name}</span>
                <span className="admin-tree__meta">{parent?.name ?? `id:${rs.rockTypeId}`}</span>
                <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={() => openEdit("rockSubtype", rs)}>Редагувати</button>
                <button className="admin-btn admin-btn--danger" onClick={() => handleDelete("rockSubtype", rs.id)}>Видалити</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mineral classes */}
      <div className="admin-section-header" style={{ marginTop: 28 }}>
        <h2>Класи мінералів</h2>
        <button className="admin-btn admin-btn--small" onClick={() => openAdd("mineralClass")}>+ Додати</button>
      </div>
      <div className="admin-tree">
        {filt(mineralClasses).map((mc) => (
          <div key={mc.id} className="admin-tree__node admin-tree__node--sub">
            <div className="admin-tree__row">
              <span className="admin-tree__label">{mc.name}</span>
              <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={() => openEdit("mineralClass", mc)}>Редагувати</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete("mineralClass", mc.id)}>Видалити</button>
            </div>
          </div>
        ))}
      </div>

      {/* Silicate structures */}
      <div className="admin-section-header" style={{ marginTop: 28 }}>
        <h2>Силікатні структури</h2>
        <button className="admin-btn admin-btn--small" onClick={() => openAdd("silicateStructure")}>+ Додати</button>
      </div>
      <div className="admin-tree">
        {filt(silicateStructures).map((ss) => (
          <div key={ss.id} className="admin-tree__node admin-tree__node--leaf">
            <div className="admin-tree__row">
              <span className="admin-tree__label">{ss.name}</span>
              <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={() => openEdit("silicateStructure", ss)}>Редагувати</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete("silicateStructure", ss.id)}>Видалити</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="admin-modal-overlay" onClick={() => setModal((m) => ({ ...m, open: false }))}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.editing ? "Редагувати" : "Додати"}</h3>
            <div className="admin-form">
              {(modal.type === "topLevel" || modal.type === "rockType" || modal.type === "rockSubtype" ||
                modal.type === "mineralClass" || modal.type === "silicateStructure") && (
                <div className="admin-form__field">
                  <label>Назва</label>
                  <input value={modal.form.name ?? ""} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))} />
                </div>
              )}
              {modal.type === "topLevel" && (
                <>
                  <div className="admin-form__field">
                    <label>Таблиця джерела</label>
                    <input value={modal.form.sourceTable ?? ""} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, sourceTable: e.target.value } }))} />
                  </div>
                  <div className="admin-form__field">
                    <label>Має елементи</label>
                    <select value={modal.form.hasItems ? "true" : "false"} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, hasItems: e.target.value === "true" } }))}>
                      <option value="false">Ні</option>
                      <option value="true">Так</option>
                    </select>
                  </div>
                </>
              )}
              {modal.type === "rockType" && (
                <div className="admin-form__field">
                  <label>Категорія верхнього рівня</label>
                  <select value={modal.form.topLevelCategoryId ?? ""} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, topLevelCategoryId: Number(e.target.value) } }))}>
                    <option value="">-- Оберіть --</option>
                    {topLevel.map((tl) => <option key={tl.id} value={tl.id}>{tl.name}</option>)}
                  </select>
                </div>
              )}
              {modal.type === "rockSubtype" && (
                <div className="admin-form__field">
                  <label>Тип породи</label>
                  <select value={modal.form.rockTypeId ?? ""} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, rockTypeId: Number(e.target.value) } }))}>
                    <option value="">-- Оберіть --</option>
                    {rockTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
                </div>
              )}
              <div className="admin-form__actions">
                <button className="admin-btn admin-btn--secondary" type="button" onClick={() => setModal((m) => ({ ...m, open: false }))}>Скасувати</button>
                <button className="admin-btn" type="button" onClick={handleSave} disabled={saving}>{saving ? "Збереження…" : "Зберегти"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {pending && (
        <ConfirmDialog
          message="Видалити запис? Цю дію не можна скасувати."
          onConfirm={() => pending()}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
