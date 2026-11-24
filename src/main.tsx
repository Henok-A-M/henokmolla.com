import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/legacy.css";
import "./styles/tokens.css";
import "./styles/global.css";
import Network from "./components/Network";
import "./styles/network.css";
createRoot(document.getElementById("root")!).render(<React.StrictMode><Network/></React.StrictMode>);
