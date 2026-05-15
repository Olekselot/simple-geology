import { useNavigate } from "react-router-dom";
import BubbleAmbientAnimation from "./BubbleAmbientAnimation";
import "../styles/App.css";
import "../styles/NotFoundPage.css";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <BubbleAmbientAnimation visible />

      <section className="page not-found-shell" role="alert">
        <section className="header not-found-header">
          <p className="not-found-code">404</p>
          <h1>Сторінку не знайдено</h1>
          <p>
            Сталася помилка. Можливо, адреса введена з помилкою або посилання
            більше не існує.
          </p>
        </section>

        <section className="mineral-details not-found-card">
          <div className="not-found-actions">
            <button
              type="button"
              className="category-button not-found-action"
              onClick={() => navigate(-1)}
            >
              <span className="category-name">Повернутися назад</span>
              <span className="category-arrow">←</span>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default NotFoundPage;
