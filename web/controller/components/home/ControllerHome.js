import React, { useState } from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { ControllerHomeCard } from "./ControllerHomeCard";
import Grid from "@mui/material/Grid";
import classNames from "classnames";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";
import { Header } from "../../../common/Header";
import { ControllerControlDrawer } from "../details/ControllerControlDrawer";
import { useLocation } from "react-router-dom";
import { Modal, ModalTitle, ModalContent } from "@dataesr/react-dsfr";
import { ControlsList } from "../list/ControlsList";
import { useLoadControls } from "../../utils/loadControls";
import { addDaysToDate, isoFormatLocalDate } from "common/utils/time";
import Button from "@mui/material/Button";
import { HelpController } from "../help/ModalHelpController";

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
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const location = useLocation();
  const controllerUserInfo = store.controllerInfo();
  const [modal, setModal] = useState({ isOpen: false, parcours: "" });
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [controlIdOnFocus, setControlIdOnFocus] = React.useState(null);

  const [controls, loadControls, loadingControls] = useLoadControls();

  React.useEffect(() => {
    loadControls({
      controllerId: controllerUserInfo.id,
      fromDate: isoFormatLocalDate(addDaysToDate(new Date(), -14)),
      controlsType: "mobilic"
    });
  }, []);

  React.useEffect(() => {
    setControlIdOnFocus(location.state?.controlId);
  }, []);

  return [
    <Header key={0} />,
    <Container
      key={1}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <ControllerControlDrawer
        controlId={controlIdOnFocus}
        onClose={() => setControlIdOnFocus(null)}
      />
      <h3 className={classes.titleHello} key={1}>
        Bonjour, {controllerUserInfo.firstName}
      </h3>
      <h4 className={classes.newControl} key={2}>
        Nouveau contrôle
      </h4>
      <Grid container direction="row" alignItems="stretch" spacing={3}>
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
            onClick={() =>
              setModal({ isOpen: true, parcours: '"Pas de LIC à bord"' })
            }
          />
        </Grid>
      </Grid>
      <a className={classNames(classes.noLicLink, "fr-link")} href="#">
        Un horaire de service est présenté ?
      </a>
      <h4 className={classes.newControl}>Historique des contrôles récents</h4>
      <Button
        size="small"
        color="primary"
        variant="contained"
        onClick={() => setShowHelpModal(true)}
        className={classes.helpButton}
      >
        Besoin d'aide ?
      </Button>
      <ControlsList
        controls={controls}
        loading={loadingControls}
        clickOnRow={setControlIdOnFocus}
      />
    </Container>,
    <Modal
      key={2}
      isOpen={modal.isOpen}
      hide={() => setModal({ isOpen: false, parcours: "" })}
    >
      <ModalTitle>En cours de construction</ModalTitle>
      <ModalContent>
        Le parcours de contrôle {modal.parcours} dans votre interface Mobilic
        est en cours de conception.
      </ModalContent>
    </Modal>,
    <Modal
      key={3}
      isOpen={showHelpModal}
      hide={() => setShowHelpModal(false)}
      size="lg"
    >
      <ModalTitle>Besoin d'aide ?</ModalTitle>
      <ModalContent>
        <HelpController />
      </ModalContent>
    </Modal>
  ];
}
