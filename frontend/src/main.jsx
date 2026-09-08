import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "@context/AuthContext";
import { NotificationProvider } from "@context/NotificationContext";
import { ThemeProvider } from "@context/ThemeContext";
import { LanguageProvider } from "@context/LanguageContext";
import "./styles/index.css";

// Development/demo compatibility: older screens in the project still contain
// the former Railway API URL. Redirect those absolute fetch calls to the same
// local API used by the rest of the app. This keeps the local demo completely
// independent from Railway while those legacy screens are being migrated.
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
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
