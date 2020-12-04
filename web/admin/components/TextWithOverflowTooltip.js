import React, { useRef, useEffect, useState } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Box from "@material-ui/core/Box";

// Taken from https://stackoverflow.com/questions/56588625/react-show-material-ui-tooltip-only-for-text-that-has-ellipsis
export function TextWithOverflowTooltip({ children }) {
  // Create Ref
  const textElementRef = useRef();

  const compareSize = () => {
    const compare =
      textElementRef.current.scrollWidth > textElementRef.current.clientWidth;
    setHover(compare);
  };

  // compare once and add resize listener on "componentDidMount"
  useEffect(() => {
    compareSize();
    window.addEventListener("resize", compareSize);
  }, []);

  // remove resize listener again on "componentWillUnmount"
  useEffect(
    () => () => {
      window.removeEventListener("resize", compareSize);
    },
    []
  );

  // Define state and function to update the value
  const [hoverStatus, setHover] = useState(false);

  return (
    <Tooltip title={children} interactive disableHoverListener={!hoverStatus}>
      <Box
        ref={textElementRef}
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
