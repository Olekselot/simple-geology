import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import HierarchyMode from "./admin/HierarchyMode";
import LeavesMode from "./admin/LeavesMode";
import CharacteristicsMode from "./admin/CharacteristicsMode";
import HistoryMode from "./admin/HistoryMode";
import "../styles/Admin.css";

const TABS = [
  { id: 1, label: "Ієрархія" },
  { id: 2, label: "Мінерали / Породи" },
  { id: 3, label: "Характеристики" },
  { id: 4, label: "Історія" },
] as const;

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("admin_token") ?? "";

  useEffect(() => {
    if (!token) navigate("/admin_edit");
  }, [token, navigate]);

  function logout() {
    sessionStorage.removeItem("admin_token");
    navigate("/admin_edit");
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-panel">
        <header className="admin-panel__header">
          <h1>Панель адміністратора</h1>
          <button className="admin-btn admin-btn--secondary" onClick={logout}>Вийти</button>
        </header>
        <nav className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab${activeTab === tab.id ? " admin-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <main className="admin-content">
          {activeTab === 1 && <HierarchyMode token={token} />}
          {activeTab === 2 && <LeavesMode token={token} />}
          {activeTab === 3 && <CharacteristicsMode token={token} />}
          {activeTab === 4 && <HistoryMode token={token} />}
        </main>
      </div>
    </div>
  );
}
