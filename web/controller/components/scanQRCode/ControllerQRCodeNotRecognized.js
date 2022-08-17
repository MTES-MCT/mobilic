import React from "react";
import { ControllerHeader } from "../header/ControllerHeader";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import classNames from "classnames";
import { Alert } from "@mui/material";
import Link from "react-router-dom/es/Link";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: 0,
    textAlign: "left"
  },
  linkScan: {
    textAlign: "left"
  },
  title: {
    textAlign: "center",
    marginTop: theme.spacing(3)
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  warningMessage: {
    marginTop: theme.spacing(3)
  }
}));
export function ControllerQRCodeNotRecognized() {
  const classes = useStyles();

  return [
    <ControllerHeader key={0} />,
    <Container
      key={20}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <Link
        className={classNames(
          classes.linkScan,
          "fr-link",
          "fr-fi-arrow-left-line",
          "fr-link--icon-left"
        )}
        to={CONTROLLER_ROUTE_PREFIX + "/scan"}
      >
        Scannez un QR Code
      </Link>
      <h3 className={classes.title}>QR Code non reconnu</h3>
      <Typography>
        Nous n'avons pas pu vérifier la validité de ce QR Code. Il se peut que
        le QR Code scanné{" "}
        <b>provienne d'une application tierce non interfacée à Mobilic.</b>
      </Typography>
      <Alert severity="warning" className={classes.warningMessage}>
        N'hésitez pas à nous remonter le nom de l'application utilisée par le
        salarié, afin que nous contactions cet éditeur de logiciel.
      </Alert>
    </Container>
  ];
}
