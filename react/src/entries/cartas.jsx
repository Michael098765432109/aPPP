import { createRoot } from "react-dom/client";
import "../../../assets/css/tokens.css";
import "../../../assets/css/base.css";
import "../../../apps/cartas/assets/css/cartas.css";
import Cartas from "../pages/Cartas.jsx";
import "../register-sw.js";

createRoot(document.getElementById("root")).render(<Cartas />);
