import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AppBar from "@mui/material/AppBar";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";
import { Header } from "../../../common/Header";
import { TextWithBadge } from "../../../common/TextWithBadge";
import { ControllerControlNoLicInfractionsComponent } from "./ControllerControlNoLicInfractions";
import { ControllerControlNoLicHistory } from "./ControllerControlNoLicHistory";
import { ControllerControlNoLicInformations } from "./ControllerControlNoLicInformations";

const useStyles = makeStyles(theme => ({
  container: {
    padding: 0
  },
  topPart: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(2)
  },
  middleTab: {
    flexGrow: 1.5
  },
  panel: {
    padding: 0,
    maxWidth: "100%",
    flexGrow: 1,
    display: "flex"
  },
  panelContainer: {
    paddingTop: theme.spacing(4),
    margin: "auto",
    display: "flex",
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: "100%",
    textAlign: "left",
    backgroundColor: theme.palette.background.paper
  },
  hiddenPanel: { flexGrow: 0 },
  bottomMenu: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    alignItems: "center"
  }
}));

const TABS = [
  {
    name: "info",
    label: "Informations",
    icon: <InfoOutlinedIcon />,
    component: ControllerControlNoLicInformations
  },
  {
    name: "alerts",
    label: (
      <TextWithBadge badgeContent="1" color="error">
        Infractions
      </TextWithBadge>
    ),
    icon: <WarningAmberOutlinedIcon />,
    component: ControllerControlNoLicInfractionsComponent
  },
  {
    name: "history",
    label: "Historique",
    icon: <HistoryOutlinedIcon />,
    component: ControllerControlNoLicHistory
  }
];

const INFRACTIONS = [
  {
    code: "NATINF 23103",
    description: "Absence de livret individuel de contrôle à bord"
  }
];

export function ControllerControlNoLic() {
  const classes = useStyles();

  const [tab, setTab] = React.useState(TABS[0].name);
  const [infractions, setInfractions] = React.useState([]);
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    setInfractions(
      INFRACTIONS.map(infraction => ({
        ...infraction,
        selected: false
      }))
    );
  }, []);

  return (
    <>
      <Header />
      <Container className={classes.container} maxWidth="xl">
        <Box className={classes.topPart}>
          <div>
            <Link
              className={classNames(
                "fr-link",
                "fr-fi-arrow-left-line",
                "fr-link--icon-left"
              )}
              to={CONTROLLER_ROUTE_PREFIX + "/home"}
            >
              Fermer
            </Link>
          </div>
          <Button
            color="primary"
            variant="outlined"
            size="small"
            onClick={() => {}}
          >
            Exporter le contrôle
          </Button>
        </Box>
        <>
          <TabContext value={tab}>
            <AppBar enableColorOnDark position="static">
              <Tabs
                value={tab}
                onChange={(e, t) => setTab(t)}
                aria-label="control no lic tabs"
                centered
                variant="fullWidth"
                indicatorColor="primary"
                textColor="inherit"
              >
                {TABS.map(t => (
                  <Tab
                    className={t.name === "alerts" ? classes.middleTab : ""}
                    label={t.label}
                    value={t.name}
                    key={t.name}
                    icon={t.icon}
                  />
                ))}
              </Tabs>
            </AppBar>
            <Container className={classes.panelContainer} disableGutters>
              {TABS.map(t => (
                <TabPanel
                  value={t.name}
                  key={t.name}
                  className={`${classes.panel} ${tab !== t.name &&
                    classes.hiddenPanel}`}
                >
                  {
                    <t.component
                      setTab={setTab}
                      infractions={infractions}
                      notes={notes}
                      setNotes={setNotes}
                    />
                  }
                </TabPanel>
              ))}
            </Container>
          </TabContext>
          <Box className={classes.bottomMenu}>
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={() => {}}
            >
              éditer un bulletin de contrôle
            </Button>
            <Button
              color="primary"
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => {}}
            >
              Relever l'infraction
            </Button>
          </Box>
        </>
      </Container>
    </>
  );
}
