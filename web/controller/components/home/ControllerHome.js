import React, { useState } from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { ControllerHomeCard } from "./ControllerHomeCard";
import Grid from "@mui/material/Grid";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";
import { Header } from "../../../common/Header";
import { ControllerControlDrawer } from "../details/ControllerControlDrawer";
import { useLocation } from "react-router-dom";
import { ControlsList } from "../list/ControlsList";
import { useLoadControls } from "../../utils/loadControls";
import Button from "@mui/material/Button";
import { InfoHoraireServiceController } from "./InfoHoraireServiceController";
import classNames from "classnames";
import { useModals } from "common/utils/modals";
import { ControlTypeFilters } from "../filters/ControlTypeFilter";
import { ControllerControlNewNoLic } from "../noLic/ControllerControlNewNoLic";
import { usePageTitle } from "../../../common/UsePageTitle";
import { Typography } from "@mui/material";
import Modal from "../../../common/Modal";

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
  newControlText: {
    marginTop: theme.spacing(7)
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  newControlButton: {
    marginBottom: theme.spacing(2)
  },
  noLicLink: {
    width: "fit-content",
    cursor: "pointer",
    textDecoration: "underline"
  },
  helpButton: {
    textTransform: "none",
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 99,
    fontSize: "1.2rem",
    [theme.breakpoints.up("md")]: {
      right: theme.spacing(10),
      bottom: theme.spacing(10)
    }
  }
}));

export function ControllerHome() {
  usePageTitle("Nouveau contrôle - Mobilic");
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const location = useLocation();
  const modals = useModals();
  const controllerUserInfo = store.controllerInfo();
  const [modal, setModal] = useState({ isOpen: false, parcours: "" });
  const [showHoraireServiceModal, setShowHoraireServiceModal] = useState(false);

  const [controlOnFocus, setControlOnFocus] = React.useState(null);
  const [openNewNoLic, setOpenNewNoLic] = React.useState(false);

  const [controls, loadControls, loadingControls] = useLoadControls();

  const [controlsType, setControlsType] = React.useState("");

  const _loadControls = () => {
    loadControls({
      controllerId: controllerUserInfo.id,
      limit: 10,
      controlsType
    });
  };

  React.useEffect(() => {
    _loadControls();
  }, [controlsType]);

  React.useEffect(() => {
    setControlOnFocus(location.state?.controlOnFocus);
  }, []);

  return (
    <>
      <Header />
      <Container
        className={`${classes.container} ${classes.whiteSection}`}
        maxWidth="xl"
      >
        <ControllerControlDrawer
          controlId={controlOnFocus?.id}
          controlType={controlOnFocus?.type}
          onClose={() => {
            _loadControls();
            setControlOnFocus(null);
          }}
        />
        <ControllerControlNewNoLic
          isOpen={openNewNoLic}
          onClose={() => setOpenNewNoLic(false)}
          setControlOnFocus={setControlOnFocus}
        />
        <Typography
          variant="h4"
          component="h1"
          key={1}
          className={classes.titleHello}
        >
          Bonjour, {controllerUserInfo.firstName}
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          key={2}
          className={classes.newControlText}
          marginBottom={2}
        >
          Nouveau contrôle
        </Typography>
        <Grid
          container
          direction="row"
          alignItems="stretch"
          spacing={3}
          className={classes.newControlButton}
        >
          <Grid item xs={12} sm={4}>
            <ControllerHomeCard
              text={"QR Code Mobilic présenté"}
              icon={"fr-icon-qr-code-line fr-icon--lg"}
              link={CONTROLLER_ROUTE_PREFIX + "/scan"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ControllerHomeCard
              text={"LIC papier présenté"}
              icon={"fr-icon-draft-line fr-icon--lg"}
              onClick={() =>
                setModal({ isOpen: true, parcours: "d'un LIC papier" })
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ControllerHomeCard
              text={"Pas de LIC à bord"}
              icon={"fr-icon-alarm-warning-line fr-icon--lg"}
              onClick={() => setOpenNewNoLic(true)}
            />
          </Grid>
        </Grid>
        <div
          className={classNames(classes.noLicLink, "fr-link")}
          onClick={() => setShowHoraireServiceModal(true)}
        >
          Un horaire de service est présenté ?
        </div>
        <Typography
          variant="h5"
          component="h2"
          className={classes.newControlText}
          marginBottom={2}
        >
          Historique des derniers contrôles
        </Typography>
        <Grid container>
          <Grid item xs={12} sm={4} md={2} marginBottom={2}>
            <ControlTypeFilters
              controlsType={controlsType}
              setControlsType={setControlsType}
            />
          </Grid>
        </Grid>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={() => modals.open("controllerHelp")}
          className={classes.helpButton}
        >
          Besoin d'aide ?
        </Button>
        <ControlsList
          controls={controls}
          loading={loadingControls}
          clickOnRow={(id, type) => setControlOnFocus({ id, type })}
        />
      </Container>
      <Modal
        open={modal.isOpen}
        handleClose={() => setModal({ isOpen: false, parcours: "" })}
        title="En cours de construction"
        content={
          <>
            Le parcours de contrôle {modal.parcours} dans votre interface
            Mobilic est en cours de conception.
          </>
        }
      />
      <Modal
        open={showHoraireServiceModal}
        handleClose={() => setShowHoraireServiceModal(false)}
        title="Un horaire de service m'est présenté à la place du LIC"
        content={<InfoHoraireServiceController />}
      />
    </>
  );
}
