import React from "react";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import { formatPersonName } from "common/utils/coworkers";
import IconButton from "@material-ui/core/IconButton";
import { useApi } from "common/utils/api";
import { getAccessibleRoutes } from "./routes";

import { useHistory, useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { Logos } from "./Logos";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import MenuItem from "@material-ui/core/MenuItem";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from "@material-ui/core/Menu/Menu";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import useTheme from "@material-ui/core/styles/useTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  menuItemButton: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderRadius: 0,
    border: "none",
    color: theme.palette.text.primary
  },
  selectedMenuItem: {
    backgroundColor: theme.palette.grey[200]
  }
}));

function HeaderContainer(props) {
  const theme = useTheme();
  return (
    <Box
      px={2}
      className="header-container"
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <Box py={1} {...props}></Box>
      <Divider className="full-width-divider" />
    </Box>
  );
}

function _MenuRouteItem({ route }) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const selected = location.pathname.startsWith(route.path);

  return (
    <MenuItem
      key={route.path}
      onClick={() => {
        if (!selected) history.push(route.path);
      }}
      className={selected && classes.selectedMenuItem}
    >
      {route.label}
    </MenuItem>
  );
}

function MobileHeader() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const companyInfo = store.companyInfo();
  const isSigningUp = store.isSigningUp();

  const routes = getAccessibleRoutes({ userInfo, companyInfo, isSigningUp });
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  return (
    <Box className="flex-row-space-between">
      <Logos />
      <IconButton edge="end" onClick={e => setMenuAnchor(e.currentTarget)}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        keepMounted
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {routes
          .filter(r => !r.noMenuItem)
          .map(route => (
            <_MenuRouteItem key={route.path} route={route} />
          ))}
        {store.userId() && (
          <MenuItem onClick={() => api.logout()}>Déconnexion</MenuItem>
        )}
      </Menu>
    </Box>
  );
}

function DesktopHeader() {
  const api = useApi();
  const theme = useTheme();
  const store = useStoreSyncedWithLocalStorage();

  const location = useLocation();
  const history = useHistory();

  const [menuAnchor, setMenuAnchor] = React.useState(null);

  const classes = useStyles();
  const userInfo = store.userInfo();
  const companyInfo = store.companyInfo();
  const companyName = companyInfo.name;
  const isSigningUp = store.isSigningUp();
  const routes = getAccessibleRoutes({ userInfo, companyInfo, isSigningUp });

  return (
    <Box className="flex-row-space-between" style={{ alignItems: "stretch" }}>
      <Logos />
      {store.userId() ? (
        <Box className="flex-row-center" style={{ overflowX: "hidden" }}>
          <Typography
            style={{ marginLeft: theme.spacing(4) }}
            noWrap
            variant="body1"
          >
            {formatPersonName(userInfo)}
            {companyName ? ` - ${companyName}` : ""}
          </Typography>
          <IconButton
            style={{ marginRight: 16 }}
            edge="end"
            onClick={e => setMenuAnchor(e.currentTarget)}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            keepMounted
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            {routes
              .filter(r => !r.noMenuItem)
              .map(route => (
                <_MenuRouteItem key={route.path} route={route} />
              ))}
            <MenuItem onClick={() => api.logout()}>Déconnexion</MenuItem>
          </Menu>
        </Box>
      ) : (
        <ToggleButtonGroup
          exclusive
          value={location.pathname}
          onChange={(e, newPath) => {
            e.preventDefault();
            if (newPath && !location.pathname.startsWith(newPath))
              history.push(newPath);
          }}
        >
          {routes
            .filter(
              r =>
                r.accessible({ userInfo, companyInfo, isSigningUp }) &&
                !r.noMenuItem
            )
            .map(route => (
              <ToggleButton
                key={route.path}
                value={route.path}
                href={route.path}
                selected={location.pathname.startsWith(route.path)}
                className={classes.menuItemButton}
              >
                {route.label}
              </ToggleButton>
            ))}
        </ToggleButtonGroup>
      )}
    </Box>
  );
}

function _Header({ width }) {
  return (
    <HeaderContainer>
      {isWidthUp("md", width) ? <DesktopHeader /> : <MobileHeader />}
    </HeaderContainer>
  );
}

export const Header = withWidth()(_Header);
