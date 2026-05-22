import { useState, useEffect } from "react";
import ConfirmDialog from "./ConfirmDialog";
import ErrorToast from "./ErrorToast";
import {
  getMineralCharacteristics, addMineralCharacteristic, updateMineralCharacteristic, deleteMineralCharacteristic,
  getRockCompositions, addRockComposition, updateRockComposition, deleteRockComposition,
  getMinerals, getRocks,
} from "../../api/adminApi";

interface Props { token: string; }

const LUSTER_OPTIONS = ["Скляний", "Металевий", "Перламутровий", "Алмазний (адамантовий)", "Восковий", "Жирний", "Шовковистий", "Смолистий", "Матовий"];
const TRANSPARENCY_OPTIONS = ["Прозорий", "Напівпрозорий", "Просвічуючий", "Непрозорий"];
const CLEAVAGE_OPTIONS = ["Відсутня", "Недосконала", "Неясна", "Середня", "Добра", "Досконала за одним напрямком", "Досконала за двома напрямками", "Досконала за трьома напрямками", "Досконала октаедрична за чотирма напрямками", "Досконала кубічна за трьома напрямками", "Досконала за трьома напрямками (ромбоедрична)"];
const FRACTURE_OPTIONS = ["Раковистий", "Нерівний", "Землистий", "Скалкастий", "Крючкуватий", "Нерівний до раковистого", "Нерівний вздовж шарів"];
const TENACITY_OPTIONS = ["Крихкий", "Гнучкий", "Пружно-гнучкий", "Ковкий", "Тягучий", "Сектильний"];
const ABUNDANCE_OPTIONS = ["major", "minor", "trace"];

function emptyCharForm() {
  return {
    mineralId: "", luster: "", color: "", streak: "", transparency: "",
    hardnessMohs: "", cleavage: "", fracture: "", tenacity: "",
    specificGravity: "", magnetism: false, morphology: "", paragenesis: "",
    specialProperties: "", notes: "",
  };
}
function charFormFrom(item: any) {
  return {
    mineralId: String(item.mineralId ?? ""),
    luster: item.luster ?? "",
    color: item.color ?? "",
    streak: item.streak ?? "",
    transparency: item.transparency ?? "",
    hardnessMohs: item.hardnessMohs != null ? String(item.hardnessMohs) : "",
    cleavage: item.cleavage ?? "",
    fracture: item.fracture ?? "",
    tenacity: item.tenacity ?? "",
    specificGravity: item.specificGravity != null ? String(item.specificGravity) : "",
    magnetism: item.magnetism ?? false,
    morphology: item.morphology ?? "",
    paragenesis: item.paragenesis ?? "",
    specialProperties: item.specialProperties ?? "",
    notes: item.notes ?? "",
  };
}
function emptyCompForm() {
  return { rockId: "", mineralId: "", abundance: "", notes: "" };
}
function compFormFrom(item: any) {
  return { rockId: String(item.rockId ?? ""), mineralId: String(item.mineralId ?? ""), abundance: item.abundance ?? "", notes: item.notes ?? "" };
}

export default function CharacteristicsMode({ token }: Props) {
  const [tab, setTab] = useState<"chars" | "comps">("chars");
  const [chars, setChars] = useState<any[]>([]);
  const [comps, setComps] = useState<any[]>([]);
  const [minerals, setMinerals] = useState<any[]>([]);
  const [rocks, setRocks] = useState<any[]>([]);
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
      const [ch, co, mi, ro] = await Promise.all([
        getMineralCharacteristics(token), getRockCompositions(token),
        getMinerals(token), getRocks(token),
      ]);
      setChars(ch); setComps(co); setMinerals(mi); setRocks(ro);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  function setField(key: string, value: any) {
    setModal((m) => ({ ...m, form: { ...m.form, [key]: value } }));
  }

  function openAdd() {
    setModal({ open: true, editing: null, form: tab === "chars" ? emptyCharForm() : emptyCompForm() });
  }

  function openEdit(item: any) {
    setModal({ open: true, editing: item, form: tab === "chars" ? charFormFrom(item) : compFormFrom(item) });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { editing, form } = modal;
      if (tab === "chars") {
        const body = {
          mineralId: Number(form.mineralId),
          luster: form.luster || null, color: form.color || null,
          streak: form.streak || null, transparency: form.transparency || null,
          hardnessMohs: form.hardnessMohs !== "" ? Number(form.hardnessMohs) : null,
          cleavage: form.cleavage || null, fracture: form.fracture || null,
          tenacity: form.tenacity || null,
          specificGravity: form.specificGravity !== "" ? Number(form.specificGravity) : null,
          magnetism: Boolean(form.magnetism),
          morphology: form.morphology || null, paragenesis: form.paragenesis || null,
          specialProperties: form.specialProperties || null, notes: form.notes || null,
        };
        editing ? await updateMineralCharacteristic(token, editing.id, body) : await addMineralCharacteristic(token, body);
      } else {
        const body = { rockId: Number(form.rockId), mineralId: Number(form.mineralId), abundance: form.abundance || null, notes: form.notes || null };
        editing ? await updateRockComposition(token, editing.id, body) : await addRockComposition(token, body);
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
        tab === "chars" ? await deleteMineralCharacteristic(token, id) : await deleteRockComposition(token, id);
        await load();
      } catch (e: any) { setError(e.message); }
    });
  }

  if (loading) return <div className="admin-loading">Завантаження…</div>;

  const rawItems = tab === "chars" ? chars : comps;
  const q = search.trim().toLowerCase();
  const items = q
    ? rawItems.filter((i) => (i.mineralName ?? i.rockName ?? "").toLowerCase().includes(q))
    : rawItems;
  const { form } = modal;

  return (
    <div>
      {error && <ErrorToast message={error} onClose={() => setError("")} />}
      <div className="admin-subtabs">
        <button className={`admin-subtab${tab === "chars" ? " admin-subtab--active" : ""}`} onClick={() => setTab("chars")}>Характеристики мінералів</button>
        <button className={`admin-subtab${tab === "comps" ? " admin-subtab--active" : ""}`} onClick={() => setTab("comps")}>Склад порід</button>
      </div>
      <h2>{tab === "chars" ? "Характеристики мінералів" : "Склад порід"}</h2>
      <div className="admin-toolbar">
        <input
          className="admin-toolbar__search"
          type="search"
          placeholder={tab === "chars" ? "Пошук за мінералом…" : "Пошук за мінералом/породою…"}
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
              {tab === "chars" && <><th>Мінерал</th><th>Блиск</th><th>Колір</th><th>Твердість</th></>}
              {tab === "comps" && <><th>Порода</th><th>Мінерал</th><th>Вміст</th></>}
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                {tab === "chars" && (
                  <>
                    <td>{item.mineralName ?? `id:${item.mineralId}`}</td>
                    <td>{item.luster ?? "—"}</td>
                    <td>{item.color ?? "—"}</td>
                    <td>{item.hardnessMohs != null ? item.hardnessMohs : "—"}</td>
                  </>
                )}
                {tab === "comps" && (
                  <>
                    <td>{item.rockName ?? `id:${item.rockId}`}</td>
                    <td>{item.mineralName ?? "—"}</td>
                    <td>{item.abundance ?? "—"}</td>
                  </>
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
            <h3>{modal.editing ? "Редагувати" : "Додати"}</h3>
            <div className="admin-form">
              {tab === "chars" && (
                <>
                  <div className="admin-form__field">
                    <label>Мінерал</label>
                    <select value={form.mineralId} onChange={(e) => setField("mineralId", e.target.value)}>
                      <option value="">-- Оберіть мінерал --</option>
                      {minerals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Блиск</label>
                    <select value={form.luster} onChange={(e) => setField("luster", e.target.value)}>
                      <option value="">— не вказано —</option>
                      {LUSTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Колір</label>
                    <input value={form.color} onChange={(e) => setField("color", e.target.value)} placeholder="напр. Безбарвний, білий…" />
                  </div>
                  <div className="admin-form__field">
                    <label>Риска</label>
                    <input value={form.streak} onChange={(e) => setField("streak", e.target.value)} placeholder="напр. Білий" />
                  </div>
                  <div className="admin-form__field">
                    <label>Прозорість</label>
                    <select value={form.transparency} onChange={(e) => setField("transparency", e.target.value)}>
                      <option value="">— не вказано —</option>
                      {TRANSPARENCY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Твердість за Моосом</label>
                    <input type="number" min="1" max="10" step="0.5" value={form.hardnessMohs} onChange={(e) => setField("hardnessMohs", e.target.value)} placeholder="1–10" />
                  </div>
                  <div className="admin-form__field">
                    <label>Спайність</label>
                    <select value={form.cleavage} onChange={(e) => setField("cleavage", e.target.value)}>
                      <option value="">— не вказано —</option>
                      {CLEAVAGE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Злам</label>
                    <select value={form.fracture} onChange={(e) => setField("fracture", e.target.value)}>
                      <option value="">— не вказано —</option>
                      {FRACTURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Міцність</label>
                    <select value={form.tenacity} onChange={(e) => setField("tenacity", e.target.value)}>
                      <option value="">— не вказано —</option>
                      {TENACITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Питома вага (г/см³)</label>
                    <input type="number" min="0" step="0.01" value={form.specificGravity} onChange={(e) => setField("specificGravity", e.target.value)} placeholder="напр. 2.65" />
                  </div>
                  <div className="admin-form__field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <input type="checkbox" id="magnetism-cb" checked={Boolean(form.magnetism)} onChange={(e) => setField("magnetism", e.target.checked)} style={{ width: "auto" }} />
                    <label htmlFor="magnetism-cb" style={{ textTransform: "none", letterSpacing: 0 }}>Магнітний</label>
                  </div>
                  <div className="admin-form__field">
                    <label>Морфологія</label>
                    <textarea rows={2} value={form.morphology} onChange={(e) => setField("morphology", e.target.value)} />
                  </div>
                  <div className="admin-form__field">
                    <label>Парагенезис</label>
                    <textarea rows={2} value={form.paragenesis} onChange={(e) => setField("paragenesis", e.target.value)} />
                  </div>
                  <div className="admin-form__field">
                    <label>Особливі властивості</label>
                    <textarea rows={2} value={form.specialProperties} onChange={(e) => setField("specialProperties", e.target.value)} />
                  </div>
                  <div className="admin-form__field">
                    <label>Нотатки</label>
                    <textarea rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
                  </div>
                </>
              )}
              {tab === "comps" && (
                <>
                  <div className="admin-form__field">
                    <label>Порода</label>
                    <select value={form.rockId} onChange={(e) => setField("rockId", e.target.value)}>
                      <option value="">-- Оберіть породу --</option>
                      {rocks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Мінерал</label>
                    <select value={form.mineralId} onChange={(e) => setField("mineralId", e.target.value)}>
                      <option value="">-- Оберіть мінерал --</option>
                      {minerals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Вміст</label>
                    <select value={form.abundance} onChange={(e) => setField("abundance", e.target.value)}>
                      <option value="">— не вказано —</option>
                      {ABUNDANCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="admin-form__field">
                    <label>Нотатки</label>
                    <textarea rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
                  </div>
                </>
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
