import React from "react";
import { ControllerHeader } from "../header/ControllerHeader";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { ControllerHomeCard } from "./ControllerHomeCard";
import Grid from "@mui/material/Grid";
import classNames from "classnames";
import { ControllerHistory } from "../history/ControllerHistory";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: 0,
    textAlign: "left"
  },
  titleHello: {
    textAlign: "center",
    marginTop: theme.spacing(3)
  },
  newControl: {
    marginTop: theme.spacing(7)
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  noLicLink: {
    marginTop: theme.spacing(4)
  }
}));

export function ControllerHome() {
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const controllerUserInfo = store.controllerInfo();
  return [
    <ControllerHeader key={0} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <h3 className={classes.titleHello} key={1}>
        Bonjour, {controllerUserInfo.firstName}
      </h3>
      <h4 className={classes.newControl} key={2}>
        Nouveau contrôle
      </h4>
      <Grid container direction="row" alignItems="stretch" spacing={3}>
        <Grid item xs={12} sm={4}>
          <ControllerHomeCard
            text={"QR code Mobilic présenté"}
            icon={"fr-icon-qr-code-line fr-icon--lg"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ControllerHomeCard
            text={"LIC papier présenté"}
            icon={"fr-icon-draft-line fr-icon--lg"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ControllerHomeCard
            text={"Pas de LIC à bord"}
            icon={"fr-icon-alarm-warning-line fr-icon--lg"}
          />
        </Grid>
      </Grid>
      <a className={classNames(classes.noLicLink, "fr-link")} href="#">
        Un horaire de service est présenté ?
      </a>
      {/* Maquette figma: font 18px => vs h5 or h4 are bigger */}
      <h5 className={classes.newControl}>Historique des contrôles récents</h5>
      <ControllerHistory controls={controllerUserInfo.controls} />
    </Container>
  ];
}