import { createRoot } from "react-dom/client";
import "../../../assets/css/tokens.css";
import "../../../assets/css/base.css";
import "../../../assets/css/hub.css";
import Hub from "../pages/Hub.jsx";
import "../register-sw.js";

createRoot(document.getElementById("root")).render(<Hub />);
