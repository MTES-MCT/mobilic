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
  const docLinks = () => (
    <>
      <LinkButton
        priority="tertiary no outline"
        href="/resources/controller"
        target="_blank"
      >
        Documentation
      </LinkButton>
      <LinkButton
        priority="tertiary no outline"
        href="https://mobilic.gitbook.io/mobilic-faq-dediee-aux-corps-de-controle/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Foire aux questions
      </LinkButton>
      <LinkButton
        priority="tertiary no outline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://mobilic.gitbook.io/natinf-expliques/"
      >
        NATINF expliqués
      </LinkButton>
    </>
  );

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
