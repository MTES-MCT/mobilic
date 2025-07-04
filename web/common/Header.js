import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { formatPersonName } from "common/utils/coworkers";
import IconButton from "@mui/material/IconButton";
import {
  CERTIFICATE_ROUTE,
  getAccessibleRoutes,
  getBadgeRoutes
} from "./routes";
import { useHistory, useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { Logos } from "./Logos";
import MenuIcon from "@mui/icons-material/Menu";
import useTheme from "@mui/styles/useTheme";
import { useIsWidthUp } from "common/utils/useWidth";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import Drawer from "@mui/material/Drawer";
import ListSubheader from "@mui/material/ListSubheader";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import { Link, LinkButton } from "./LinkButton";
import Grid from "@mui/material/Grid";
import { useAdminStore, useAdminCompanies } from "../admin/store/store";
import {
  useCertificationInfo,
  useShouldDisplayBadge
} from "../admin/utils/certificationInfo";
import { TextWithBadge } from "./TextWithBadge";
import { ADMIN_ACTIONS } from "../admin/store/reducers/root";
import TextField from "common/utils/TextField";
import { MenuItem } from "@mui/material";
import { ControllerHeader } from "../controller/components/header/ControllerHeader";
import { LoadingButton } from "common/components/LoadingButton";

const useStyles = makeStyles(theme => ({
  navItemButton: {
    borderRadius: 2
  },
  companyDrowndown: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    maxWidth: 500
  },
  divider: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3)
  },
  navListItem: {
    width: "100%",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: "block",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default
    },
    fontWeight: "bold"
  },
  selectedNavListItem: {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, ${theme.palette.background.default} 5px, ${theme.palette.background.default})`
  },
  nestedListSubheader: {
    fontSize: "1rem",
    fontStyle: "italic"
  },
  closeNavButton: {
    display: "flex",
    justifyContent: "flex-end"
  },
  navDrawer: {
    minWidth: 200
  },
  userName: {
    maxWidth: 500
  },
  desktopHeader: {
    flexWrap: "wrap"
  }
}));

export const HeaderComponent = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      px={2}
      component="header"
      role="banner"
      className="header-container"
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      {children}
    </Box>
  );
};

function HeaderContainer(props) {
  return (
    <HeaderComponent>
      <Box py={1} {...props}></Box>
      <Divider className="full-width-divider hr-unstyled" />
    </HeaderComponent>
  );
}

export function ListRouteItem({ route, closeDrawer, userInfo, companies }) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const shouldDisplayBadge = useShouldDisplayBadge();
  const { companyWithInfo } = useCertificationInfo();
  const badge = getBadgeRoutes(
    useAdminStore(),
    companyWithInfo,
    shouldDisplayBadge
  ).find(br => br.path === route.path)?.badge;

  const selected = route.exact
    ? location.pathname === route.path
    : location.pathname.startsWith(route.path);

  return route.subRoutes ? (
    <>
      <List
        dense
        key={route.path + "subRoutes"}
        disablePadding
        subheader={
          <ListSubheader
            component="div"
            className={classes.nestedListSubheader}
          >
            {route.label}
          </ListSubheader>
        }
      >
        {route.subRoutes
          .filter(
            subRoute =>
              !subRoute.accessible ||
              subRoute.accessible({ userInfo, companies })
          )
          .map(subRoute => (
            <ListRouteItem
              key={subRoute.path || subRoute.label}
              route={{ ...subRoute, path: `${route.path}${subRoute.path}` }}
              closeDrawer={closeDrawer}
            />
          ))}
      </List>
      <Divider className="hr-unstyled" />
    </>
  ) : (
    <ListItem key={route.path || route.label} disableGutters>
      <Link
        className={`${classes.navListItem} ${selected &&
          classes.selectedNavListItem}`}
        variant="body1"
        color="inherit"
        to={route.path}
        href={route.href}
        target={route.target}
        underline="none"
        onClick={e => {
          if (!route.href && !route.target) {
            e.preventDefault();
            if (!selected) history.push(route.path);
            closeDrawer();
          }
        }}
      >
        <TextWithBadge invisible={!badge} {...badge}>
          {route.label}
        </TextWithBadge>
      </Link>
    </ListItem>
  );
}

export function NavigationMenu({ open, setOpen }) {
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const companies = store.companies();

  const classes = useStyles();

  const routes = getAccessibleRoutes({ userInfo, companies });

  if (!userInfo?.id) {
    routes.push(CERTIFICATE_ROUTE);
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ className: classes.navDrawer }}
    >
      <Box className={classes.closeNavButton} pt={2}>
        <IconButton
          aria-label="Fermer"
          onClick={() => setOpen(false)}
          className={classes.closeNavButton}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider className="hr-unstyled" />
      <List dense>
        {routes
          .filter(
            r => !r.menuItemFilter || r.menuItemFilter({ userInfo, companies })
          )
          .map(route => (
            <ListRouteItem
              userInfo={userInfo}
              companies={companies}
              key={route.path || route.label}
              route={route}
              closeDrawer={() => setOpen(false)}
            />
          ))}
      </List>
    </Drawer>
  );
}

const HeaderCompaniesDropdown = () => {
  const adminStore = useAdminStore();
  const [companies, company] = useAdminCompanies();

  const classes = useStyles();

  if (!companies || companies.length <= 1 || !company) {
    return null;
  }

  return (
    // Modified common/utils/TextField to accept children so we can use it here
    // Good idea ? Should we do this everywhere ?
    <TextField
      id="select-company-id"
      className={classes.companyDrowndown}
      select
      value={company ? company.id : 0}
      onChange={e => {
        adminStore.dispatch({
          type: ADMIN_ACTIONS.updateCompanyId,
          payload: { companyId: e.target.value }
        });
      }}
    >
      {companies.map(c => (
        <MenuItem key={c.id} value={c.id}>
          {c.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

function MobileHeader({ disableMenu }) {
  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);

  return (
    <Box className="flex-row-space-between">
      <Logos leaveSpaceForMenu={!disableMenu} />
      <HeaderCompaniesDropdown />
      {!disableMenu && [
        <IconButton
          aria-label="Menu"
          key={0}
          edge="end"
          onClick={() => setOpenNavDrawer(!openNavDrawer)}
        >
          <MenuIcon />
        </IconButton>,
        <NavigationMenu
          key={1}
          open={openNavDrawer}
          setOpen={setOpenNavDrawer}
        />
      ]}
    </Box>
  );
}

function DesktopHeader({ disableMenu }) {
  const store = useStoreSyncedWithLocalStorage();
  const adminStore = useAdminStore();

  const location = useLocation();
  const history = useHistory();

  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);

  const classes = useStyles();
  const userInfo = store.userInfo();
  const companies = store.companies();
  const company = companies.find(c => c.id === adminStore.companyId);
  const companyName = company ? company.name : null;
  const routes = getAccessibleRoutes({ userInfo, companies });

  const docLinks = () => {
    const style = { padding: "0.25rem 1rem" };
    return (
      <Box mr={4}>
        <LinkButton
          href="https://faq.mobilic.beta.gouv.fr"
          target="_blank"
          rel="noopener noreferrer"
          style={style}
        >
          Foire aux questions
        </LinkButton>
        <LinkButton href="/resources/home" target="_blank" style={style}>
          Documentation
        </LinkButton>
        <LinkButton to="/partners" style={style}>
          Partenaires et logiciels
        </LinkButton>
        {!userInfo?.id && (
          <LinkButton to="/certificate" style={style}>
            Certificat
          </LinkButton>
        )}
      </Box>
    );
  };

  return (
    <Box className={`flex-row-space-between ${classes.desktopHeader}`}>
      <Logos leaveSpaceForMenu={!disableMenu} />
      {store.userId() ? (
        <Box className="flex-row-center" style={{ overflowX: "hidden" }}>
          {!disableMenu && docLinks()}
          <Tooltip
            title={`${formatPersonName(userInfo)}${
              companyName ? " - " + companyName : ""
            }`}
          >
            <Typography noWrap variant="body1" className={classes.userName}>
              {formatPersonName(userInfo)}
            </Typography>
          </Tooltip>
          <HeaderCompaniesDropdown />
          {!disableMenu && [
            <IconButton
              aria-label="Menu"
              key={0}
              style={{ marginRight: 16 }}
              edge="end"
              onClick={() => setOpenNavDrawer(!openNavDrawer)}
            >
              <MenuIcon />
            </IconButton>,
            <NavigationMenu
              key={1}
              open={openNavDrawer}
              setOpen={setOpenNavDrawer}
            />
          ]}
        </Box>
      ) : (
        !disableMenu && (
          <Box className="flex-row-center">
            {docLinks()}
            <Grid
              container
              style={{ width: "auto" }}
              spacing={2}
              alignItems="center"
            >
              {routes
                .filter(
                  r =>
                    r.accessible({ userInfo, companies }) &&
                    (!r.menuItemFilter ||
                      r.menuItemFilter({ userInfo, companies })) &&
                    !r.subRoutes
                )
                .map(route => {
                  const ButtonComponent = route.mainCta
                    ? LoadingButton
                    : props => <Button priority="secondary" {...props} />;
                  return (
                    <Grid item key={route.path}>
                      <ButtonComponent
                        aria-label={route.label}
                        value={route.path}
                        href={route.path}
                        className={classes.navItemButton}
                        onClick={e => {
                          e.preventDefault();
                          if (!location.pathname.startsWith(route.path))
                            history.push(route.path);
                        }}
                      >
                        {route.label}
                      </ButtonComponent>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        )
      )}
    </Box>
  );
}

function _Header({ disableMenu }) {
  const store = useStoreSyncedWithLocalStorage();
  const controllerId = store.controllerId();
  const isMdUp = useIsWidthUp("md");
  return controllerId ? (
    <ControllerHeader />
  ) : (
    <HeaderContainer>
      {isMdUp ? (
        <DesktopHeader disableMenu={disableMenu} />
      ) : (
        <MobileHeader disableMenu={disableMenu} />
      )}
    </HeaderContainer>
  );
}

export const Header = _Header;
