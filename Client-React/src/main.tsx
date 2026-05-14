import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles/tokens.css";
import "./styles/buttons.css";
import "./styles/index.css";
import App from "./components/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:mineralSlug" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
