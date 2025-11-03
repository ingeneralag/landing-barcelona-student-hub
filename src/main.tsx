import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import siteLogo from "./assets/logo1212.png";

// Ensure favicon uses the site logo (works in dev and build)
function setFavicon(href: string) {
  const setLink = (rel: string) => {
    let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  };
  setLink("icon");
  setLink("apple-touch-icon");
}

setFavicon(siteLogo);

createRoot(document.getElementById("root")!).render(<App />);
