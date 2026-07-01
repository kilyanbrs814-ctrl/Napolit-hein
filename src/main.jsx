import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/components.css";

// Désactive la restauration automatique de scroll du navigateur.
// Doit être fait avant le render pour que la première frame parte du haut.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
if (!window.location.hash) {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

// Sécurité bfcache : certains navigateurs restaurent la position via le cache
// de navigation (back/forward cache) sans recharger la page. L'événement
// pageshow avec persisted:true est le seul moyen fiable de l'intercepter.
window.addEventListener("pageshow", () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
