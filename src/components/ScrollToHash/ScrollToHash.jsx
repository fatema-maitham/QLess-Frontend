import { useEffect } from "react";
import { useLocation } from "react-router";

// Links like "/#how" open one section of a page.
// React draws the page a moment after the link is clicked, so the section
// may not exist yet. Keep looking for it (up to 2 seconds), then scroll to it.
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer;

    const scrollToSection = () => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      tries += 1;
      if (tries < 20) timer = setTimeout(scrollToSection, 100);
    };

    scrollToSection();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}