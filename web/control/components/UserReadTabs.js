import React from "react";
import { makeStyles } from "@mui/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AppBar from "@mui/material/AppBar";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import Container from "@mui/material/Container";
import { ControllerControlBottomMenu } from "../../controller/components/menu/ControllerControlBottomMenu";
import { currentControllerId } from "common/utils/cookie";
import { useDownloadBDC } from "../../controller/utils/useDownloadBDC";
import { canDownloadBDC } from "../../controller/utils/controlBulletin";

const useStyles = makeStyles(theme => ({
  sectionBody: {
    marginBottom: theme.spacing(6)
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

export function UserReadTabs({ tabs, restoreScroll, ...props }) {
  const [tab, setTab] = React.useState(tabs[0].name);

  React.useEffect(() => {
    if (restoreScroll) restoreScroll();
  }, [tab]);

  const reportInfractions = () => {
    props.setIsReportingInfractions(true);
    setTab(tabs[1].name);
  };

  const downloadBDC = useDownloadBDC(props.controlData?.id);

  const classes = useStyles();
  return (
    <>
      <TabContext value={tab}>
        <AppBar enableColorOnDark position="static">
          <Tabs
            value={tab}
            onChange={(e, t) => setTab(t)}
            aria-label="user read tabs"
            centered
            variant="fullWidth"
            indicatorColor="primary"
            textColor="inherit"
          >
            {tabs.map(t => (
              <Tab
                className={
                  t.name === "alerts" ? classes.middleTab : classes.tab
                }
                label={t.label}
                value={t.name}
                key={t.name}
                icon={t.icon}
                disabled={t.name !== "alerts" && props.isReportingInfractions}
              />
            ))}
          </Tabs>
        </AppBar>
        <Container className={classes.panelContainer} key={2} disableGutters>
          {tabs.map(t => (
            <TabPanel
              value={t.name}
              key={t.name}
              className={`${classes.panel} ${tab !== t.name &&
                classes.hiddenPanel}`}
            >
              {<t.component {...props} setTab={setTab} />}
            </TabPanel>
          ))}
        </Container>
      </TabContext>
      {!!currentControllerId() && !props.isReportingInfractions && (
        <ControllerControlBottomMenu
          reportInfractions={reportInfractions}
          disabledReportInfractions={(props.groupedAlerts?.length || 0) === 0}
          updatedInfractions={!!props.reportedInfractionsLastUpdateTime}
          editBDC={props.openBulletinControl}
          downloadBDC={downloadBDC}
          canDownloadBDC={canDownloadBDC(props.controlData)}
          bdcAlreadyExisting={!!props.controlData.controlBulletinCreationTime}
          totalAlertsNumber={props.totalAlertsNumber}
        />
      )}
    </>
  );
}
