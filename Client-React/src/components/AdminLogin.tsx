import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/adminApi";
import "../styles/Admin.css";

export default function AdminLogin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await adminLogin(login, password);
      sessionStorage.setItem("admin_token", token);
      navigate("/admin_edit/panel");
    } catch (err: any) {
      setError(err.message ?? "Помилка входу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">Адмін панель</h1>

        <div className="admin-login__field">
          <label htmlFor="adm-login">Логін</label>
          <input
            id="adm-login"
            type="text"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>

        <div className="admin-login__field">
          <label htmlFor="adm-pass">Пароль</label>
          <input
            id="adm-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="admin-login__error">{error}</div>}

        <button className="admin-btn" type="submit" disabled={loading}>
          {loading ? "Вхід…" : "Увійти"}
        </button>
      </form>
    </div>
  );
}
