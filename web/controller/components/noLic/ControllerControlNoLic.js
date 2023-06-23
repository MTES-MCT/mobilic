import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AppBar from "@mui/material/AppBar";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { ControllerControlNoLicHistory } from "./ControllerControlNoLicHistory";
import { ControllerControlNoLicInformations } from "./ControllerControlNoLicInformations";
import { useDownloadBDC } from "../../utils/useDownloadBDC";
import { ControllerControlBottomMenu as BottomMenu } from "../menu/ControllerControlBottomMenu";
import { InfractionsAvailableSoon } from "../infractions/InfractionsAvailableSoon";
import { canDownloadBDC } from "../../utils/controlBulletin";

const useStyles = makeStyles(theme => ({
  container: {
    padding: 0
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
  hiddenPanel: { flexGrow: 0 }
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
    label: "Infractions",
    icon: <WarningAmberOutlinedIcon />,
    component: InfractionsAvailableSoon
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

export function ControllerControlNoLic({ controlData, editBDC }) {
  const classes = useStyles();
  const downloadBDC = useDownloadBDC(controlData.id);

  const [tab, setTab] = React.useState(TABS[0].name);
  const [infractions, setInfractions] = React.useState([]);
  const [notes, setNotes] = React.useState("");
  const [
    lastInfractionsEditionDate,
    setLastInfractionsEditionDate
  ] = React.useState(null);
  const [isReportingInfractions, setIsReportingInfractions] = React.useState(
    false
  );

  React.useEffect(() => {
    setInfractions(
      INFRACTIONS.map(infraction => ({
        ...infraction,
        selected: false
      }))
    );
  }, []);

  const reportInfraction = () => {
    setIsReportingInfractions(true);
    setTab(TABS[1].name);
  };

  const toggleInfraction = ({ code, selected }) => {
    setInfractions(
      infractions.map(infraction =>
        infraction.code === code
          ? {
              ...infraction,
              selected: !selected
            }
          : infraction
      )
    );
  };

  const saveInfractions = () => {
    setIsReportingInfractions(false);
    setLastInfractionsEditionDate(new Date());
  };
  const cancelInfractions = () => {
    setIsReportingInfractions(false);
  };

  return (
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
                disabled={t.name !== "alerts" && isReportingInfractions}
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
                  lastInfractionsEditionDate={lastInfractionsEditionDate}
                  setLastInfractionsEditionDate={setLastInfractionsEditionDate}
                  isReportingInfractions={isReportingInfractions}
                  toggleInfraction={toggleInfraction}
                  saveInfractions={saveInfractions}
                  cancelInfractions={cancelInfractions}
                  controlData={controlData}
                />
              }
            </TabPanel>
          ))}
        </Container>
      </TabContext>
      {!isReportingInfractions && (
        <>
          <BottomMenu
            reportInfraction={reportInfraction}
            updatedInfractions={!!lastInfractionsEditionDate}
            editBDC={editBDC}
            downloadBDC={downloadBDC}
            canDownloadBDC={canDownloadBDC(controlData)}
            touchedBDC={controlData.controlBulletinCreationTime}
          />
        </>
      )}
    </>
  );
}
