import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getInitialTheme, applyTheme } from "./lib/theme";

// Apply the initial theme before the app renders
try {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
} catch (e) {
  // Fail silently if theme setup has any issues
}

createRoot(document.getElementById("root")!).render(<App />);
