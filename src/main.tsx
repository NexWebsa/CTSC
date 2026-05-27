import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress service worker preload warning
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      if (registration.navigationPreload) {
        registration.navigationPreload.disable().catch(() => {
          // Silently handle any errors
        });
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
