import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/legacy.css";
import "./styles/tokens.css";
import "./styles/global.css";
import Page from "./components/Page";
import Cursor from "./components/Cursor";
createRoot(document.getElementById("root")!).render(<React.StrictMode><Page/><Cursor/></React.StrictMode>);
