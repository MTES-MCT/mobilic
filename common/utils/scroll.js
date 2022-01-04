import React from "react";
import { withRouter } from "react-router-dom";

function _ScrollToTop({ history }) {
  React.useEffect(() => {
    const unlisten = history.listen(() => {
      const el = document.getElementById("root");
      if (
        el &&
        el.scrollTo &&
        history.location.pathname !== "/resources/regulations"
      )
        el.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    };
  }, []);

  return null;
}

export const ScrollToTop = withRouter(_ScrollToTop);
