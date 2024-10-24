import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getAccessibleRoutes } from "../../../common/routes";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import { makeStyles } from "@mui/styles";
import { ListRouteItem } from "../../../common/Header";
import CloseButton from "../../../common/CloseButton";

const useStyles = makeStyles(theme => ({
  closeNavButton: {
    display: "flex",
    justifyContent: "flex-end"
  },
  navDrawer: {
    minWidth: 200
  }
}));

export function ControllerNavigationMenu({ open, setOpen }) {
  const store = useStoreSyncedWithLocalStorage();
  const controllerInfo = store.controllerInfo();

  const classes = useStyles();

  const routes = getAccessibleRoutes({ controllerInfo });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ className: classes.navDrawer }}
    >
      <Box className={classes.closeNavButton} pt={2}>
        <CloseButton onClick={() => setOpen(false)} />
      </Box>
      <Divider className="hr-unstyled" />
      <List dense>
        {routes
          .filter(
            r => !r.menuItemFilter || r.menuItemFilter({ controllerInfo })
          )
          .map(route => (
            <ListRouteItem
              key={route.path || route.label}
              route={route}
              closeDrawer={() => setOpen(false)}
            />
          ))}
      </List>
    </Drawer>
  );
}
