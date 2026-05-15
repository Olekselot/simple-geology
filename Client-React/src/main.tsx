import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles/tokens.css";
import "./styles/buttons.css";
import "./styles/index.css";
import App from "./components/App";
import NotFoundPage from "./components/NotFoundPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/" element={<App />} />
        <Route path="/:mineralSlug" element={<App />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
