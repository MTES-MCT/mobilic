import React from "react";
import { withRouter } from "react-router-dom";
import Container from "@material-ui/core/Container";

function _ScrollToTop({ history }) {
  React.useEffect(() => {
    const unlisten = history.listen(() => {
      const el = document.getElementById("scrollable-container");
      if (el) el.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    };
  }, []);

  return null;
}

export const ScrollToTop = withRouter(_ScrollToTop);

export function ScrollableContainer(props) {
  return (
    <Container
      id="scrollable-container"
      className="no-margin-no-padding"
      maxWidth={false}
      {...props}
    />
  );
}
