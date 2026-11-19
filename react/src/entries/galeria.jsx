import { createRoot } from "react-dom/client";
import "../../../assets/css/tokens.css";
import "../../../assets/css/base.css";
import "../../../apps/galeria/assets/css/galeria.css";
import Galeria from "../pages/Galeria.jsx";
import "../register-sw.js";

createRoot(document.getElementById("root")).render(<Galeria />);
