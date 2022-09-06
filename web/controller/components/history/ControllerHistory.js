import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { Header } from "../../../common/Header";
import { ControllerHistoryFilters, CONTROL_TYPES } from "./Filters";
import { useLoadControls } from "../../utils/loadControls";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { ControlsList } from "../list/ControlsList";
import { useLocation } from "react-router-dom";
import { ControllerControlDrawer } from "../details/ControllerControlDrawer";

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

  const location = useLocation();
  const [controlIdOnFocus, setControlIdOnFocus] = React.useState(null);

  React.useEffect(() => {
    setControlIdOnFocus(location.state?.controlId);
  }, []);

  const [controlFilters, setControlFilters] = React.useState({
    type: CONTROL_TYPES[0].value,
    fromDate: new Date(),
    toDate: new Date()
  });
  const [controls, setControls] = React.useState([]);
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
      <ControllerControlDrawer
        controlId={controlIdOnFocus}
        onClose={() => setControlIdOnFocus(null)}
      />
      <h1>Historique des contrôles</h1>
      <div>
        <ControllerHistoryFilters
          controlFilters={controlFilters}
          setControlFilters={setControlFilters}
        />
      </div>
      <ControlsList controls={controls} clickOnRow={setControlIdOnFocus} />
    </Container>
  ];
}
