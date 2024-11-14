import React, { useMemo } from "react";
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
import Box from "@mui/material/Box";
import Notice from "../../common/Notice";

const useStyles = makeStyles(theme => ({
  sectionBody: {
    marginBottom: theme.spacing(6)
  },
  middleTab: {
    fontSize: "0.75rem",
    flexGrow: 1.5,
    opacity: 1,
    color: "rgb(255,255,255,0.5)",
    "&.Mui-selected": {
      color: "rgb(255,255,255,1)"
    }
  },
  tab: {
    fontSize: "0.75rem",
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
    paddingTop: theme.spacing(3),
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
  },
  boxContainer: {
    width: "100%"
  }
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

  const showModifyInfractionsAlert = useMemo(() => {
    return (
      tab !== tabs[1].name &&
      props.totalAlertsNumber > 0 &&
      !props.reportedInfractionsLastUpdateTime
    );
  }, [props.totalAlertsNumber, props.reportedInfractionsLastUpdateTime, tab]);

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
        <Box className={classes.boxContainer}>
          {!!showModifyInfractionsAlert && (
            <Notice
              description={
                <>
                  Mobilic a relevé des infractions par défaut, vous pouvez
                  modifier la sélection au sein de{" "}
                  <span
                    className={classes.linkInfractionTab}
                    onClick={() => setTab(tabs[1].name)}
                  >
                    l’onglet infractions
                  </span>
                </>
              }
            />
          )}
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
        </Box>
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
