import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useScroll() {
  const { hash, pathname, search } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    if (pathname === "/resources/regulations" && search !== "") {
      return;
    }
    const mainElements = document.getElementsByTagName("main");
    if (mainElements && mainElements[0]) {
      mainElements[0].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash, pathname, search]);
}

export default useScroll;
