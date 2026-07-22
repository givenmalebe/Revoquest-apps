import "./utils/nativeFetch"; // Capture native fetch BEFORE any third-party scripts (frame_ant.js) can wrap it
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Initialize Firebase
import "./firebase/config";

// Redirect revolearn.co.za → revoquest.co.za/funnel
if (window.location.hostname === "revolearn.co.za") {
  window.location.replace("https://revoquest.co.za/funnel");
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
