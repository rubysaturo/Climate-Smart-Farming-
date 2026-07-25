import React from "react";
import ReactDOM from "react-dom/client";
import "@/lib/env"; // validate env vars before anything else
import App from "./App";
import "@/styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
