import React from "react";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

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

export function BulletinControleHeader({ onCloseDrawer, backLinkLabel }) {
  const classes = useStyles();
  return (
    <Container className={classes.controlHeaderContainer}>
      <Box className={classes.subHeaderSection}>
        <Link
          to="#"
          className={classNames(
            classes.linkHomeMobile,
            "fr-link",
            "fr-fi-arrow-left-line",
            "fr-link--icon-left"
          )}
          onClick={onCloseDrawer}
        >
          {backLinkLabel}
        </Link>
      </Box>
    </Container>
  );
}
