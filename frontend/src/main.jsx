import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { handleUnauthorized } from "./services/api";
import "./i18n";
import { AuthProvider } from "@context/AuthContext";
import { NotificationProvider } from "@context/NotificationContext";
import { ThemeProvider } from "@context/ThemeContext";
import { LanguageProvider } from "@context/LanguageContext";
import LanguageAutoTranslator from "./components/ui/LanguageAutoTranslator.jsx";
import "./styles/index.css";

const nativeFetch = window.fetch.bind(window);

// Handle expired authenticated sessions for native fetch requests.
window.fetch = async (input, init) => {
  const hasAuthorization =
    Boolean(init?.headers?.Authorization || init?.headers?.authorization) ||
    (input instanceof Request && Boolean(input.headers.get("Authorization")));

  const response = await nativeFetch(input, init);

  if (
    response.status === 401 &&
    hasAuthorization &&
    (localStorage.getItem("osta_token") || localStorage.getItem("token"))
  ) {
    handleUnauthorized();
  }

  return response;
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
