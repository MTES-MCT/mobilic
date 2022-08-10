import React from "react";
import Box from "@mui/material/Box";
import { Logos } from "../../../common/Logos";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { LinkButton } from "../../../common/LinkButton";
import { makeStyles } from "@mui/styles";
import Divider from "@mui/material/Divider";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@mui/material/Typography";
import { SocialNetworkPanel } from "../../../common/Header";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { ControllerNavigationMenu } from "./ControllerNavigationMenu";

const useStyles = makeStyles(theme => ({
  docButton: {
    textTransform: "none",
    borderRadius: 0,
    fontSize: "1rem"
  },
  divider: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3)
  },
  userName: {
    maxWidth: 500
  },
  desktopHeader: {
    flexWrap: "wrap"
  }
}));

export function ControllerDesktopHeader() {
  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);

  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const controllerUserInfo = store.controllerInfo();
  const docLinks = () => [
    <LinkButton
      aria-label="Documentation"
      key={0}
      href="/resources/home"
      target="_blank"
      className={classes.docButton}
    >
      Documentation
    </LinkButton>,
    <LinkButton
      aria-label="Foire aux questions"
      key={1}
      href="https://faq.mobilic.beta.gouv.fr"
      target="_blank"
      rel="noopener noreferrer"
      className={classes.docButton}
    >
      Foire aux questions
    </LinkButton>,
    <LinkButton
      aria-label="NATINF expliqués"
      key={2}
      to="/natinf"
      className={classes.docButton}
    >
      NATINF expliqués
    </LinkButton>
  ];

  return (
    <Box className={`flex-row-space-between ${classes.desktopHeader}`}>
      <Logos />
      <Box className="flex-row-center" style={{ overflowX: "hidden" }}>
        {docLinks()}
        <Divider
          className={`hr-unstyled ${classes.divider}`}
          orientation="vertical"
          flexItem
        />
        <SocialNetworkPanel />
        <Divider
          className={`hr-unstyled ${classes.divider}`}
          orientation="vertical"
          flexItem
        />
        <Typography noWrap variant="body1" className={classes.userName}>
          {formatPersonName(controllerUserInfo)}
        </Typography>
        <IconButton
          aria-label="Menu"
          key={0}
          style={{ marginRight: 16 }}
          edge="end"
          onClick={() => setOpenNavDrawer(!openNavDrawer)}
        >
          <MenuIcon />
        </IconButton>
        <ControllerNavigationMenu
          key={1}
          open={openNavDrawer}
          setOpen={setOpenNavDrawer}
        />
      </Box>
    </Box>
  );
}
