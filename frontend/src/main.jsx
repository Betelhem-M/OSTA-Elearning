import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./i18n";
import { AuthProvider } from "@context/AuthContext";
import { NotificationProvider } from "@context/NotificationContext";
import { ThemeProvider } from "@context/ThemeContext";
import { LanguageProvider } from "@context/LanguageContext";
import LanguageAutoTranslator from "./components/ui/LanguageAutoTranslator.jsx";
import "./styles/index.css";

// Production backend used by the Vercel frontend.
const PRODUCTION_API = "https://osta-elearning-backend-production.up.railway.app/api";
const LEGACY_API = "https://osta-elearning-production.up.railway.app/api";
const nativeFetch = window.fetch.bind(window);

// Redirect any legacy hard-coded API requests to the current Railway backend.
window.fetch = (input, init) => {
  if (typeof input === "string") {
    if (input.startsWith(LEGACY_API)) input = `${PRODUCTION_API}${input.slice(LEGACY_API.length)}`;
  } else if (input instanceof Request && input.url.startsWith(LEGACY_API)) {
    input = new Request(`${PRODUCTION_API}${input.url.slice(LEGACY_API.length)}`, input);
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
