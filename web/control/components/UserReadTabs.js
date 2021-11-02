import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from "@material-ui/core/AppBar";
import TabPanel from "@material-ui/lab/TabPanel";
import TabContext from "@material-ui/lab/TabContext";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
  container: {
    zIndex: 0
  },
  sectionBody: {
    marginBottom: theme.spacing(6)
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

  const classes = useStyles();

  return (
    <>
      <TabContext value={tab}>
        <AppBar className={classes.container} position="static">
          <Tabs
            value={tab}
            onChange={(e, t) => setTab(t)}
            aria-label="user read tabs"
            centered
            variant="fullWidth"
            textColor="inherit"
          >
            {tabs.map(t => (
              <Tab
                className={classes.tab}
                label={t.label}
                value={t.name}
                key={t.name}
                icon={t.icon}
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
    </>
  );
}
