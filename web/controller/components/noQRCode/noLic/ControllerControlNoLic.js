import React from "react";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AppBar from "@mui/material/AppBar";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { formatDateTime } from "common/utils/time";
import { ControllerControlNoLicHistory } from "./ControllerControlNoLicHistory";
import { ControllerControlNoLicInformations } from "./ControllerControlNoLicInformations";
import { useDownloadBDC } from "../../../utils/useDownloadBDC";
import { ControllerControlBottomMenu as BottomMenu } from "../../menu/ControllerControlBottomMenu";
import { TextWithBadge } from "../../../../common/TextWithBadge";
import { UserReadAlerts } from "../../../../control/components/UserReadAlerts";
import Box from "@mui/material/Box";
import { useInfractions } from "../../../utils/contextInfractions";
import { useControl } from "../../../utils/contextControl";
import { controlTabsStyles } from "../../../../control/components/UserReadTabs";
import { scrollToId } from "../../../../common/hooks/useScroll";
import { ControlDisplayPicturesDrawer } from "../../pictures/ControlDisplayPicturesDrawer";

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
  editBDC,
  takePictures,
  controlData,
  setControlData
}) {
  const classes = controlTabsStyles();

  const { controlId } = useControl();
  const downloadBDC = useDownloadBDC(controlId);
  const { checkedAlertsNumber, isReportingInfractions } = useInfractions();
  const [displayPictures, setDisplayPictures] = React.useState(false);

  const showPictures = () => {
    setDisplayPictures(true);
  };

  const TABS = getTabs(checkedAlertsNumber);
  const [tab, setTab] = React.useState(TABS[0].name);

  const switchToInfractionsTab = () => {
    setTab(TABS[1].name);
  };

  React.useEffect(() => scrollToId("control-header"), [tab]);

  const onChangeTab = tabName => {
    setTab(tabName);
  };
  return displayPictures ? (
    <ControlDisplayPicturesDrawer
      isOpen={displayPictures}
      onClose={() => setDisplayPictures(false)}
      switchToInfractionsTab={switchToInfractionsTab}
    />
  ) : (
    <>
      <TabContext value={tab}>
        <AppBar enableColorOnDark position="static">
          <Tabs
            value={tab}
            onChange={(e, t) => onChangeTab(t)}
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
                    readOnlyAlerts={false}
                    onChangeTab={onChangeTab}
                    showPictures={showPictures}
                    takePictures={takePictures}
                    switchToInfractionsTab={switchToInfractionsTab}
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
            editBDC={editBDC}
            downloadBDC={downloadBDC}
            controlId={controlId}
            controlTime={formatDateTime(
              controlData?.creationTime || new Date(),
              true
            )}
            controlData={controlData}
            setControlData={setControlData}
            isNoLicContext={true}
          />
        </>
      )}
    </>
  );
}
