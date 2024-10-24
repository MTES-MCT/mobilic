import React from "react";
import { useHistory } from "react-router-dom";

function _ScrollToTop() {
  const history = useHistory();

  React.useEffect(() => {
    const unlisten = history.listen(() => {
      if (
        history.location.pathname !== "/resources/regulations" ||
        history.location.search === ""
      ) {
        window.scrollTo(0, 0);
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  return null;
}

export const ScrollToTop = _ScrollToTop;
