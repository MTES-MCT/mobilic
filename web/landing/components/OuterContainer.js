import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";

const useStyles = makeStyles((theme) => ({
  outerContainer: {
    padding: 0,
    margin: 0,
  },
}));

export const OuterContainer = ({
  grayBackground = false,
  children,
  ...otherProps
}) => {
  const classes = useStyles();
  return (
    <Container
      maxWidth={false}
      className={classes.outerContainer}
      sx={{
        backgroundColor: grayBackground ? "#F6F6F6" : "inherit",
      }}
      {...otherProps}
    >
      {children}
    </Container>
  );
};
