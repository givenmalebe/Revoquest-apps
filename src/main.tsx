import "./utils/nativeFetch"; // Capture native fetch BEFORE any third-party scripts (frame_ant.js) can wrap it
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Initialize Firebase
import "./firebase/config";

createRoot(document.getElementById("root")!).render(<App />);
