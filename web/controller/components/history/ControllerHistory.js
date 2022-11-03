import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { isoFormatLocalDate, startOfMonthAsDate } from "common/utils/time";
import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../../../common/Header";
import { useLoadControls } from "../../utils/loadControls";
import { ControllerControlDrawer } from "../details/ControllerControlDrawer";
import { ControlsList } from "../list/ControlsList";
import { ControllerHistoryFilters } from "./ControllerHistoryFilters";

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
    fromDate: isoFormatLocalDate(startOfMonthAsDate(new Date())),
    toDate: isoFormatLocalDate(new Date())
  });
  const [period, setPeriod] = React.useState("day");
  const [controls, loadControls, loadingControls] = useLoadControls();

  React.useEffect(() => {
    loadControls({
      controllerId: controllerUserInfo.id,
      ...controlFilters
    });
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
        />
      </Box>
      {controls && controls.length > 0 && (
        <ControlsList
          controls={controls}
          period={period}
          loading={loadingControls}
          clickOnRow={setControlIdOnFocus}
        />
      )}
    </Container>
  ];
}
