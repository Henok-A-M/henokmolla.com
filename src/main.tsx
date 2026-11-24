import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/legacy.css";
import "./styles/tokens.css";
import "./styles/global.css";
import Hero from "./components/Hero";
import Cursor from "./components/Cursor";
import PortfolioSections from "./components/PortfolioSections";
createRoot(document.getElementById("root")!).render(<React.StrictMode><Hero/><PortfolioSections/><Cursor/></React.StrictMode>);
