import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Modal, ModalTitle, ModalContent } from "@dataesr/react-dsfr";
import { Header } from "../../../common/Header";
import { ControllerHistoryFilters, CONTROL_TYPES } from "./Filters";
import { useLoadControls } from "../../utils/loadControls";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { ControlsList } from "../list/ControlsList";
import { useLocation } from "react-router-dom";
import { ControllerControlDrawer } from "../details/ControllerControlDrawer";
import { addDaysToDate, isoFormatLocalDate } from "common/utils/time";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: 0,
    textAlign: "center"
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  }
}));

export function ControllerHistory() {
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const controllerUserInfo = store.controllerInfo();
  const [modalOpened, setModalOpened] = useState(false);

  const location = useLocation();
  const [controlIdOnFocus, setControlIdOnFocus] = React.useState(null);

  React.useEffect(() => {
    setControlIdOnFocus(location.state?.controlId);
  }, []);

  const [controlFilters, setControlFilters] = React.useState({
    controlsType: CONTROL_TYPES[0].value,
    fromDate: isoFormatLocalDate(addDaysToDate(new Date(), -2)),
    toDate: isoFormatLocalDate(new Date())
  });
  const [controls, setControls] = React.useState([]);
  const [period, setPeriod] = React.useState("day");
  const loadControls = useLoadControls();

  React.useEffect(() => {
    loadControls({
      controllerId: controllerUserInfo.id,
      ...controlFilters
    }).then(controls => setControls(controls));
  }, [controlFilters]);
  return [
    <Header key={0} />,
    <Container
      key={1}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <Modal isOpen={modalOpened} hide={() => setModalOpened(false)}>
        <ModalTitle>En cours de construction</ModalTitle>
        <ModalContent>
          L'export de vos contrôles est en cours de construction.
        </ModalContent>
      </Modal>
      <ControllerControlDrawer
        controlId={controlIdOnFocus}
        onClose={() => setControlIdOnFocus(null)}
      />
      <Typography sx={{ typography: { xs: "h3", sm: "h1" } }}>
        Historique des contrôles
      </Typography>
      <Box
        sx={{
          marginBottom: theme => ({
            xs: theme.spacing(2),
            md: theme.spacing(12)
          })
        }}
      >
        <ControllerHistoryFilters
          controlFilters={controlFilters}
          setControlFilters={setControlFilters}
          period={period}
          setPeriod={setPeriod}
          onClickExport={() => setModalOpened(true)}
        />
      </Box>
      <ControlsList
        controls={controls}
        period={period}
        clickOnRow={setControlIdOnFocus}
      />
    </Container>
  ];
}
