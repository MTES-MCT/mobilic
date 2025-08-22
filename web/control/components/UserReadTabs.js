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
import Box from "@mui/material/Box";
import Notice from "../../common/Notice";
import { scrollToId } from "../../common/hooks/useScroll";

export const controlTabsStyles = makeStyles(theme => ({
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

  React.useEffect(() => scrollToId("control-header"), [tab]);

  const onChangeTab = tabName => {
    setTab(tabName);
  };

  React.useEffect(() => {
    if (restoreScroll) restoreScroll();
  }, [tab]);

  const showModifyInfractionsAlert = useMemo(() => {
    return (
      tab !== tabs[1].name &&
      props.totalAlertsNumber > 0 &&
      !props.reportedInfractionsLastUpdateTime
    );
  }, [props.totalAlertsNumber, props.reportedInfractionsLastUpdateTime, tab]);

  const downloadBDC = useDownloadBDC(props.controlId);

  const classes = controlTabsStyles();
  return (
    <>
      <TabContext value={tab}>
        <AppBar enableColorOnDark position="static">
          <Tabs
            value={tab}
            onChange={(e, t) => onChangeTab(t)}
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
                    onClick={() => onChangeTab(tabs[1].name)}
                  >
                    l’onglet infractions
                  </span>
                </>
              }
            />
          )}
          <Container className={classes.panelContainer} disableGutters>
            {tabs.map(t => (
              <TabPanel
                value={t.name}
                key={t.name}
                className={`${classes.panel} ${tab !== t.name &&
                  classes.hiddenPanel}`}
              >
                {<t.component {...props} onChangeTab={onChangeTab} />}
              </TabPanel>
            ))}
          </Container>
        </Box>
      </TabContext>
      {!!currentControllerId() && !props.isReportingInfractions && (
        <ControllerControlBottomMenu
          editBDC={props.openBulletinControl}
          downloadBDC={downloadBDC}
        />
      )}
    </>
  );
}
