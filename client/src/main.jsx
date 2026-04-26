import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

// Monaco bug suppress
window.onerror = (message) => {
  if (message?.includes?.("TextModel got disposed")) return true;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
            fontSize: "13px",
          },
        }}
      />
      <App />
    </Provider>
  </StrictMode>,
);
