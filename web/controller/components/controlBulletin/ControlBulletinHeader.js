import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Button } from "@codegouvfr/react-dsfr/Button";

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
  },
  underlinedButton: {
    textDecoration: "underline"
  }
}));

export function ControlBulletinHeader({ onCloseDrawer, backLinkLabel }) {
  const classes = useStyles();
  return (
    <Container className={classes.controlHeaderContainer}>
      <Box>
        <Button
          onClick={onCloseDrawer}
          priority="tertiary no outline"
          iconId="fr-icon-arrow-left-s-line"
          iconPosition="left"
          className={classes.underlinedButton}
        >
          {backLinkLabel}
        </Button>
      </Box>
    </Container>
  );
}
