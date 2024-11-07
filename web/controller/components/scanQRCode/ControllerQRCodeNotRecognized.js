import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { Header } from "../../../common/Header";
import { usePageTitle } from "../../../common/UsePageTitle";
import Notice from "../../../common/Notice";
import { Main } from "../../../common/semantics/Main";
import { ControllerBackButton } from "./ControllerBackButton";

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
  }
}));
export function ControllerQRCodeNotRecognized() {
  usePageTitle("Erreur QRCode - Mobilic");
  const classes = useStyles();

  return (
    <>
      <Header />
      <Main
        className={`${classes.container} ${classes.whiteSection}`}
        maxWidth="xl"
      >
        <ControllerBackButton label="Scannez un QR Code" route="/scan" />
        <h3 className={classes.title}>QR Code non reconnu</h3>
        <Typography>
          Nous n'avons pas pu vérifier la validité de ce QR Code. Il se peut que
          le QR Code scanné{" "}
          <b>provienne d'une application tierce non interfacée à Mobilic.</b>
        </Typography>
        <Notice
          type="warning"
          sx={{ marginTop: 3 }}
          description="N'hésitez pas à nous remonter le nom de l'application utilisée par le
        salarié, afin que nous contactions cet éditeur de logiciel."
        />
      </Main>
    </>
  );
}
