import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { ControllerControlBackButton } from "../utils/ControllerControlBackButton";

const useStyles = makeStyles(theme => ({
  controlHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: "0",
    paddingRight: "0",
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
}));

export function ControlBulletinHeader({ onCloseDrawer, backLinkLabel }) {
  const classes = useStyles();
  return (
    <Container
      className={classes.controlHeaderContainer}
      id="control-bulletin-header"
    >
      <ControllerControlBackButton onClick={onCloseDrawer}>
        {backLinkLabel}
      </ControllerControlBackButton>
    </Container>
  );
}
