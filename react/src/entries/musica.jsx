import { createRoot } from "react-dom/client";
import "../../../assets/css/tokens.css";
import "../../../assets/css/base.css";
import "../../../apps/musica/assets/css/musica.css";
import Musica from "../pages/Musica.jsx";
import "../register-sw.js";

createRoot(document.getElementById("root")).render(<Musica />);
