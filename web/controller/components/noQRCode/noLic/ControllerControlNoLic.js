import React, { useMemo } from "react";
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
import { useDownloadBDC } from "../../../utils/useDownloadBDC";
import { ControllerControlBottomMenu as BottomMenu } from "../../menu/ControllerControlBottomMenu";
import { canDownloadBDC } from "../../../utils/controlBulletin";
import { TextWithBadge } from "../../../../common/TextWithBadge";
import { UserReadAlerts } from "../../../../control/components/UserReadAlerts";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Notice from "../../../../common/Notice";

const useStyles = makeStyles(theme => ({
  middleTab: {
    flexGrow: 1.5,
    opacity: 1,
    color: "rgb(255,255,255,0.5)",
    "&.Mui-selected": {
      color: "rgb(255,255,255,1)"
    }
  },
  tab: {
    opacity: 1,
    color: "rgb(255,255,255,0.5)",
    "&.Mui-selected": {
      color: "rgb(255,255,255,1)"
    }
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
  linkInfractionTab: {
    textDecoration: "underline",
    cursor: "pointer"
  }
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

export function ControllerControlNoLic({
  controlData,
  editBDC,
  reportedInfractionsLastUpdateTime,
  groupedAlerts,
  checkedAlertsNumber,
  totalAlertsNumber,
  isReportingInfractions,
  setIsReportingInfractions,
  hasModifiedInfractions,
  saveInfractions,
  cancelInfractions,
  onUpdateInfraction
}) {
  const classes = useStyles();
  const downloadBDC = useDownloadBDC(controlData.id);

  const TABS = getTabs(checkedAlertsNumber);
  const [tab, setTab] = React.useState(TABS[0].name);

  const reportInfraction = () => {
    setIsReportingInfractions(true);
    setTab(TABS[1].name);
  };

  const showModifyInfractionsAlert = useMemo(() => {
    return !reportedInfractionsLastUpdateTime && tab !== TABS[1].name;
  }, [reportedInfractionsLastUpdateTime, tab]);

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
                className={
                  t.name === "alerts" ? classes.middleTab : classes.tab
                }
                label={t.label}
                value={t.name}
                key={t.name}
                icon={t.icon}
                disabled={t.name !== "alerts" && isReportingInfractions}
              />
            ))}
          </Tabs>
        </AppBar>
        <Box>
          {!!showModifyInfractionsAlert && (
            <Notice
              description={
                <>
                  <Typography>
                    Mobilic a relevé des infractions par défaut, vous pouvez
                    modifier la sélection au sein de{" "}
                    <span
                      className={classes.linkInfractionTab}
                      onClick={() => setTab(TABS[1].name)}
                    >
                      l’onglet infractions
                    </span>
                  </Typography>
                </>
              }
            />
          )}
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
                    controlData={controlData}
                    isReportingInfractions={isReportingInfractions}
                    setIsReportingInfractions={setIsReportingInfractions}
                    groupedAlerts={groupedAlerts}
                    totalAlertsNumber={totalAlertsNumber}
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
        </Box>
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
            bdcAlreadyExisting={!!controlData.controlBulletinCreationTime}
            totalAlertsNumber={totalAlertsNumber}
          />
        </>
      )}
    </>
  );
}
