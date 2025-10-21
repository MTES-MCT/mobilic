import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getAccessibleRoutes } from "../../../common/routes";
import List from "@mui/material/List";
import { ListRouteItem } from "../../../common/Header";
import { Navigation } from "../../../common/Navigation";

export function ControllerNavigationMenu({ open, setOpen }) {
  const store = useStoreSyncedWithLocalStorage();
  const controllerInfo = store.controllerInfo();

  const routes = getAccessibleRoutes({ controllerInfo });

  return (
    <Navigation open={open} setOpen={setOpen}>
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
    </Navigation>
  );
}
