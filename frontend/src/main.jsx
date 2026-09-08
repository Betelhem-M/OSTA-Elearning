import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "@context/AuthContext";
import { NotificationProvider } from "@context/NotificationContext";
import { ThemeProvider } from "@context/ThemeContext";
import { LanguageProvider } from "@context/LanguageContext";
import LanguageAutoTranslator from "./components/ui/LanguageAutoTranslator.jsx";
import "./styles/index.css";

// Keep local demos independent from the old Railway URL used by legacy screens.
const LOCAL_API =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const LEGACY_API = "https://osta-elearning-production.up.railway.app/api";
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  if (typeof input === "string" && input.startsWith(LEGACY_API)) {
    input = `${LOCAL_API}${input.slice(LEGACY_API.length)}`;
  } else if (input instanceof Request && input.url.startsWith(LEGACY_API)) {
    input = new Request(
      `${LOCAL_API}${input.url.slice(LEGACY_API.length)}`,
      input
    );
  }
  return nativeFetch(input, init);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <App />
              <LanguageAutoTranslator />
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
