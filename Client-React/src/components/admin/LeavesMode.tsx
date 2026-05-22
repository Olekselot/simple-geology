import { useState, useEffect } from "react";
import ConfirmDialog from "./ConfirmDialog";
import ErrorToast from "./ErrorToast";
import {
  getMinerals, addMineral, updateMineral, deleteMineral,
  getRocks, addRock, updateRock, deleteRock,
  getMineralClasses, getSilicateStructures, getRockSubtypes,
} from "../../api/adminApi";

interface Props { token: string; }

export default function LeavesMode({ token }: Props) {
  const [tab, setTab] = useState<"minerals" | "rocks">("minerals");
  const [minerals, setMinerals] = useState<any[]>([]);
  const [rocks, setRocks] = useState<any[]>([]);
  const [mineralClasses, setMineralClasses] = useState<any[]>([]);
  const [silicateStructures, setSilicateStructures] = useState<any[]>([]);
  const [rockSubtypes, setRockSubtypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState<{ open: boolean; editing: any | null; form: any }>({ open: false, editing: null, form: {} });
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [m, r, mc, ss, rs] = await Promise.all([
        getMinerals(token), getRocks(token),
        getMineralClasses(token), getSilicateStructures(token), getRockSubtypes(token),
      ]);
      setMinerals(m); setRocks(r);
      setMineralClasses(mc); setSilicateStructures(ss); setRockSubtypes(rs);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  function mineralForm(item?: any) {
    return { name: item?.name ?? "", formula: item?.formula ?? "", description: item?.description ?? "", mineralClassId: item?.mineralClassId ?? "", silicateStructureId: item?.silicateStructureId ?? "" };
  }

  function rockForm(item?: any) {
    return { name: item?.name ?? "", description: item?.description ?? "", rockSubtypeId: item?.rockSubtypeId ?? "" };
  }

  function openAdd() {
    setModal({ open: true, editing: null, form: tab === "minerals" ? mineralForm() : rockForm() });
  }

  function openEdit(item: any) {
    setModal({ open: true, editing: item, form: tab === "minerals" ? mineralForm(item) : rockForm(item) });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { editing, form } = modal;
      if (tab === "minerals") {
        const body = { ...form, mineralClassId: form.mineralClassId ? Number(form.mineralClassId) : null, silicateStructureId: form.silicateStructureId ? Number(form.silicateStructureId) : null };
        editing ? await updateMineral(token, editing.id, body) : await addMineral(token, body);
      } else {
        const body = { ...form, rockSubtypeId: form.rockSubtypeId ? Number(form.rockSubtypeId) : null };
        editing ? await updateRock(token, editing.id, body) : await addRock(token, body);
      }
      setModal((m) => ({ ...m, open: false }));
      await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    setPending(() => async () => {
      setPending(null);
      try {
        tab === "minerals" ? await deleteMineral(token, id) : await deleteRock(token, id);
        await load();
      } catch (e: any) { setError(e.message); }
    });
  }

  if (loading) return <div className="admin-loading">Завантаження…</div>;

  const raw = tab === "minerals" ? minerals : rocks;
  const q = search.trim().toLowerCase();
  const items = q ? raw.filter((i) => i.name?.toLowerCase().includes(q)) : raw;

  return (
    <div>
      {error && <ErrorToast message={error} onClose={() => setError("")} />}
      <div className="admin-subtabs">
        <button className={`admin-subtab${tab === "minerals" ? " admin-subtab--active" : ""}`} onClick={() => setTab("minerals")}>Мінерали</button>
        <button className={`admin-subtab${tab === "rocks" ? " admin-subtab--active" : ""}`} onClick={() => setTab("rocks")}>Породи</button>
      </div>
      <h2>{tab === "minerals" ? "Мінерали" : "Породи"}</h2>
      <div className="admin-toolbar">
        <input
          className="admin-toolbar__search"
          type="search"
          placeholder="Пошук за назвою…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="admin-btn admin-btn--small" onClick={openAdd}>+ Додати</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Назва</th>
              {tab === "minerals" && <><th>Формула</th><th>Клас</th><th>Структура</th></>}
              {tab === "rocks" && <th>Підтип</th>}
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                {tab === "minerals" && (
                  <>
                    <td>{item.formula ?? "—"}</td>
                    <td>{mineralClasses.find((c) => c.id === item.mineralClassId)?.name ?? "—"}</td>
                    <td>{silicateStructures.find((s) => s.id === item.silicateStructureId)?.name ?? "—"}</td>
                  </>
                )}
                {tab === "rocks" && (
                  <td>{rockSubtypes.find((s) => s.id === item.rockSubtypeId)?.name ?? "—"}</td>
                )}
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn admin-btn--small admin-btn--secondary" onClick={() => openEdit(item)}>Редагувати</button>
                    <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(item.id)}>Видалити</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="admin-modal-overlay" onClick={() => setModal((m) => ({ ...m, open: false }))}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.editing ? "Редагувати" : "Додати"} {tab === "minerals" ? "мінерал" : "породу"}</h3>
            <div className="admin-form">
              <div className="admin-form__field">
                <label>Назва</label>
                <input value={modal.form.name} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))} />
              </div>
              <div className="admin-form__field">
                <label>Опис</label>
                <textarea value={modal.form.description} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} rows={3} />
              </div>
              {tab === "minerals" && (
                <>
                  <div className="admin-form__field">
                    <label>Формула</label>
                    <input value={modal.form.formula} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, formula: e.target.value } }))} />
                  </div>
                  <div className="admin-form__field">
                    <label>Клас мінералів</label>
                    <select value={modal.form.mineralClassId} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, mineralClassId: e.target.value } }))}>
                      <option value="">— Немає —</option>
                      {mineralClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Силікатна структура</label>
                    <select value={modal.form.silicateStructureId} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, silicateStructureId: e.target.value } }))}>
                      <option value="">— Немає —</option>
                      {silicateStructures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              {tab === "rocks" && (
                <div className="admin-form__field">
                  <label>Підтип породи</label>
                  <select value={modal.form.rockSubtypeId} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, rockSubtypeId: e.target.value } }))}>
                    <option value="">— Немає —</option>
                    {rockSubtypes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
