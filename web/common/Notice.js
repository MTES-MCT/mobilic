import React from "react";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  box: {
    background: ({ noBackground }) => (noBackground ? "none" : "")
  },
  container: {
    padding: ({ noPadding }) => (noPadding ? "0" : "")
  }
}));

export const Notice = ({
  noBackground = false,
  noPadding = false,
  textAlign,
  children
}) => {
  const classes = useStyles({ noBackground, noPadding });
  return (
    <Box
      className={`${classes.box} fr-notice fr-notice--info`}
      textAlign={textAlign ? textAlign : { xs: "left", md: "center" }}
      marginY={1}
    >
      <Box className={`${classes.container} fr-container`}>
        <Box className="fr-notice__body">{children}</Box>
      </Box>
    </Box>
  );
};
