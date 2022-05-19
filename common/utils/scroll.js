import React from "react";
import { withRouter } from "react-router-dom";

function _ScrollToTop({ history }) {
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

export const ScrollToTop = withRouter(_ScrollToTop);
