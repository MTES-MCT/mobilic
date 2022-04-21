import React, { useRef, useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  popper: {
    "& a": {
      color: theme.palette.primary.contrastText
    }
  }
}));

// Taken from https://stackoverflow.com/questions/56588625/react-show-material-ui-tooltip-only-for-text-that-has-ellipsis
export function TextWithOverflowTooltip({ text, children, alwaysShow }) {
  // Create Ref
  const textElementRef = useRef();
  const classes = useStyles();

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
    <Tooltip
      title={text || children}
      disableHoverListener={!alwaysShow && !hoverStatus}
      PopperProps={{ className: classes.popper }}
    >
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
