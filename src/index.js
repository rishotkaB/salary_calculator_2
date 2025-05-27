import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import SalaryCalculator from "./SalaryCalculator";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SalaryCalculator />
  </React.StrictMode>
);