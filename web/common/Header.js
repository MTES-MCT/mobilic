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
import Button from "@material-ui/core/Button";

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
  },
  docButton: {
    textTransform: "none",
    borderRadius: 0,
    fontSize: "1rem"
  },
  divider: {
    margin: theme.spacing(1)
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
      <Box {...props}></Box>
      <Divider className="full-width-divider" />
    </Box>
  );
}

function MenuRouteItem({ route }) {
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
      className={selected ? classes.selectedMenuItem : ""}
    >
      {route.label}
    </MenuItem>
  );
}

export function NavigationMenu({ menuAnchor, setMenuAnchor }) {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const companyInfo = store.companyInfo();
  const isSigningUp = store.isSigningUp();

  const routes = getAccessibleRoutes({ userInfo, companyInfo, isSigningUp });

  return (
    <Menu
      anchorEl={menuAnchor}
      keepMounted
      open={Boolean(menuAnchor)}
      onClose={() => setMenuAnchor(null)}
    >
      {routes
        .filter(
          r => !r.menuItemFilter || r.menuItemFilter({ userInfo, companyInfo })
        )
        .map(route => (
          <MenuRouteItem key={route.path} route={route} />
        ))}
      {store.userId() && (
        <MenuItem onClick={() => api.logout()}>Déconnexion</MenuItem>
      )}
    </Menu>
  );
}

function MobileHeader({ disableMenu }) {
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  return (
    <Box className="flex-row-space-between">
      <Logos />
      {!disableMenu && [
        <IconButton
          key={0}
          edge="end"
          onClick={e => setMenuAnchor(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>,
        <NavigationMenu
          key={1}
          menuAnchor={menuAnchor}
          setMenuAnchor={setMenuAnchor}
        />
      ]}
    </Box>
  );
}

function DesktopHeader({ disableMenu }) {
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

  const docLinks = () => [
    <Button key={0} className={classes.docButton} href="/developers/docs/intro">
      Espace développeurs
    </Button>,
    <Button key={1} href="/" className={classes.docButton}>
      Foire aux questions
    </Button>
  ];

  return (
    <Box className="flex-row-space-between">
      <Logos />
      {store.userId() ? (
        <Box className="flex-row-center" style={{ overflowX: "hidden" }}>
          {docLinks()}
          <Divider
            className={classes.divider}
            orientation="vertical"
            flexItem
          />
          <Typography noWrap variant="body1">
            {formatPersonName(userInfo)}
            {companyName ? ` - ${companyName}` : ""}
          </Typography>
          {!disableMenu && [
            <IconButton
              key={0}
              style={{ marginRight: 16 }}
              edge="end"
              onClick={e => setMenuAnchor(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>,
            <NavigationMenu
              key={1}
              menuAnchor={menuAnchor}
              setMenuAnchor={setMenuAnchor}
            />
          ]}
        </Box>
      ) : (
        !disableMenu && (
          <Box className="flex-row">
            {docLinks()}
            <Divider
              className={classes.divider}
              orientation="vertical"
              flexItem
            />
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
                    (!r.menuItemFilter ||
                      r.menuItemFilter({ userInfo, companyInfo }))
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
          </Box>
        )
      )}
    </Box>
  );
}

function _Header({ width, disableMenu }) {
  return (
    <HeaderContainer>
      {isWidthUp("md", width) ? (
        <DesktopHeader disableMenu={disableMenu} />
      ) : (
        <MobileHeader disableMenu={disableMenu} />
      )}
    </HeaderContainer>
  );
}

export const Header = withWidth()(_Header);
