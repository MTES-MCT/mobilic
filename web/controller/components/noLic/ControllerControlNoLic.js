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
import { canDownloadBDC } from "../../utils/controlBulletin";
import { TextWithBadge } from "../../../common/TextWithBadge";
import { UserReadAlerts } from "../../../control/components/UserReadAlerts";
import { useReportInfractions } from "../../utils/useReportInfractions";

const useStyles = makeStyles(theme => ({
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

const getTabs = alertNumber => [
  {
    name: "info",
    label: "Informations",
    icon: <InfoOutlinedIcon />,
    component: ControllerControlNoLicInformations
  },
  {
    name: "alerts",
    label: (
      <TextWithBadge
        badgeContent={alertNumber || 0}
        color={alertNumber ? "error" : "success"}
      >
        Infractions
      </TextWithBadge>
    ),
    icon: <WarningAmberOutlinedIcon />,
    component: UserReadAlerts
  },
  {
    name: "history",
    label: "Historique",
    icon: <HistoryOutlinedIcon />,
    component: ControllerControlNoLicHistory
  }
];

export function ControllerControlNoLic({ controlData, editBDC }) {
  const classes = useStyles();
  const [
    reportedInfractionsLastUpdateTime,
    groupedAlerts,
    alertsNumber,
    isReportingInfractions,
    setIsReportingInfractions,
    hasModifiedInfractions,
    saveInfractions,
    cancelInfractions,
    onUpdateInfraction
  ] = useReportInfractions(controlData, true);
  const downloadBDC = useDownloadBDC(controlData.id);

  const TABS = getTabs(alertsNumber);
  const [tab, setTab] = React.useState(TABS[0].name);

  const reportInfraction = () => {
    setIsReportingInfractions(true);
    setTab(TABS[1].name);
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
                  isReportingInfractions={isReportingInfractions}
                  setIsReportingInfractions={setIsReportingInfractions}
                  controlData={controlData}
                  groupedAlerts={groupedAlerts}
                  saveInfractions={saveInfractions}
                  cancelInfractions={cancelInfractions}
                  onUpdateInfraction={onUpdateInfraction}
                  hasModifiedInfractions={hasModifiedInfractions}
                  noLic={true}
                  readOnlyAlerts={false}
                />
              }
            </TabPanel>
          ))}
        </Container>
      </TabContext>
      {!isReportingInfractions && (
        <>
          <BottomMenu
            reportInfractions={reportInfraction}
            updatedInfractions={!!reportedInfractionsLastUpdateTime}
            disableReportInfractions={false}
            editBDC={editBDC}
            downloadBDC={downloadBDC}
            canDownloadBDC={canDownloadBDC(controlData)}
            BDCAlreadyExisting={!!controlData.controlBulletinCreationTime}
            singleInfraction={true}
          />
        </>
      )}
    </>
  );
}
