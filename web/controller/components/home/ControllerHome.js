import React from "react";
import { ControllerHeader } from "../header/ControllerHeader";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { ControllerHomeCard } from "./ControllerHomeCard";
import Grid from "@mui/material/Grid";
import classNames from "classnames";

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
      <h2 className={classes.titleHello} key={1}>
        Bonjour, {controllerUserInfo.firstName} !
      </h2>
      <h3 className={classes.newControl} key={2}>
        Nouveau contrôle
      </h3>
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
            icon={"ri-book-open-line ri-xl"}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <ControllerHomeCard
            text={"Horaire de service présenté"}
            icon={"ri-book-read-line ri-xl"}
          />
        </Grid>
      </Grid>
      <a className={classNames(classes.noLicLink, "fr-link")} href="#">
        Pas de LIC à bord ?
      </a>
    </Container>
  ];
}
