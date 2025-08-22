import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScroll = () => {
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
    scrollToMain();
  }, [hash, pathname, search]);
};

export const scrollToMain = () => {
  const mainElements = document.getElementsByTagName("main");
  if (mainElements && mainElements[0]) {
    _scrollTo(mainElements[0]);
  }
};

export const scrollToId = id => {
  const idElement = document.getElementById(id);
  if (idElement) {
    _scrollTo(idElement);
  }
};

const _scrollTo = element =>
  element.scrollIntoView({ behavior: "smooth", block: "start" });
