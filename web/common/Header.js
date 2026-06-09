import React from "react";
import Box from "@mui/material/Box";
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
import classNames from "classnames";
import { fr } from "@codegouvfr/react-dsfr";
import { Navigation } from "./Navigation";
import { useModals } from "common/utils/modals";
import { useStoreMissions } from "common/store/contextMissions";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Select } from "@codegouvfr/react-dsfr/Select";

import MobilicLogoWithText from "common/assets/images/mobilic-logo-with-text.svg";


const currentPathname = window.location.pathname;

const useStyles = makeStyles((theme) => ({
  navItemButton: {
    borderRadius: 2,
    padding: "0"
  },
  companyDrowndown: {
    display: "inline-flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    border: '1px solid var(--border-default-grey)',
    padding: '0.25rem 0.5rem 0.25rem 0.75rem',
    gap: theme.spacing(1),
    "& .noFocusRingSelect:focus": {
      outline: "none",
      outlineStyle: "none",
      outlineColor: "transparent",
      outlineWidth: 0,
      outlineOffset: 0
    },
    "&:focus": {
      border: '1px solid red',
    },
    // marginLeft: theme.spacing(2),
    // marginRight: theme.spacing(2),
    // maxWidth: 500
  },
  navListItem: {
    width: "100%",
    // paddingLeft: theme.spacing(4),
    // paddingRight: theme.spacing(6),
    // paddingBottom: theme.spacing(2),
    display: "block",
    padding: "0.75rem 0",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default
    },
    fontWeight: 500
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: 0,
    margin: 0,
    listStyle: "none",
    // rowGap: theme.spacing(1),
  },
  navListItemWrapper: {
    width: "100%"
  },
  selectedNavListItem: {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, ${theme.palette.background.default} 5px, ${theme.palette.background.default})`
  },
  nestedListSubheader: {
    color:  fr.colors.decisions.text.title.grey.default,
    fontWeight: 600
  },
  subRoute: {
    fontWeight: 500
  },
  userName: {
    maxWidth: 500,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: fr.colors.decisions.text.actionHigh.grey.default,
    fontWeight: 600
  },
  userEmail: {
    maxWidth: 500,
    margin: 0,
    color: fr.colors.decisions.text.mention.grey.default,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  headerTopSection: {
    padding: '0.75rem 1.5rem 1.5rem 1.5rem !important',
  },
  navTopSection: {
    display: "flex",
    flexDirection: "column",
    // rowGap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    alignItems: "flex-start",
  },
  navSections: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    rowGap: theme.spacing(1),
    alignItems: "flex-start",
    padding: '0.75rem 1.5rem',
  },
  navDivider: {
    width: "100%",
    border: 0,
    borderTop: "1px solid var(--border-default-grey)",
    margin: 0
  },
  desktopHeader: {
    flexWrap: "wrap"
  },
  headerToolsLinks: {
    "& .fr-btns-group": {
      alignItems: "baseline",
      gap: "0.75rem"
    },
    "& .fr-btns-group > li": {
      marginBottom: 0
    },
    "& .fr-btn": {
      alignItems: "baseline"
    }
  }
}));


export const HeaderComponent = ({ fitContainer, children }) => {
  const theme = useTheme();
  return (
    <Box
      component="header"
      role="banner"
      className={classNames(
        "header-container",
        fitContainer ? "fit-container" : ""
      )}
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      {children}
    </Box>
  );
};


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
  ).find((br) => br.path === route.path)?.badge;

  const selected = route.exact
    ? location.pathname === route.path
    : location.pathname.startsWith(route.path);

  return route.subRoutes ? (
    <>
      <section key={route.path + "subRoutes"} className={classes.navSections}>
        <p className={classes.nestedListSubheader + " fr-text--md fr-mb-0"}>{route.label}</p>
        <div className={classes.navLis + ' row-gap-0'}>
          {route.subRoutes
            .filter(
              (subRoute) =>
                !subRoute.accessible ||
                subRoute.accessible({ userInfo, companies })
            )
            .map((subRoute) => (
              <ListRouteItem
                key={subRoute.path || subRoute.label}
                route={{ ...subRoute, path: `${route.path}${subRoute.path}` }}
                closeDrawer={closeDrawer}
              />
            ))}
        </div>
      </section>
      <hr className={` hr-unstyled ${classes.navDivider}`} />
    </>

  ) : (
    <div className={classes.navListItemWrapper} key={route.path || route.label}>
      <Link
        className={`${classes.navListItem} ${
          selected && classes.selectedNavListItem
        }`}
        variant="body1"
        color="inherit"
        to={route.path}
        href={route.href}
        target={route.target}
        underline="none"
        onClick={(e) => {
          if (!route.href && !route.target) {
            e.preventDefault();
            if (!selected) 
              history.push(route.path);
            closeDrawer();
          }
        }}
      >
        <TextWithBadge invisible={!badge} {...badge}>
          {route.label}
        </TextWithBadge>
      </Link>
    </div>
  );
}

export function NavigationMenu({ open, setOpen }) {
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const companies = store.companies();
  const modals = useModals();
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  const routes = getAccessibleRoutes({ userInfo, companies });

  if (!userInfo?.id) {
    routes.push(CERTIFICATE_ROUTE);
  }

  const { displayCurrentMission } = useStoreMissions();

  const userName = userInfo ? formatPersonName(userInfo) : "Utilisateur";
  const userEmail = userInfo?.email || "email non renseigné";
  
  return (
    <Navigation open={open} setOpen={setOpen}>
      <div className={classes.navTopSection}>
        {userInfo?.hasActivatedEmail && userInfo?.id && (
          <>
            <section className={classes.navSections + ' ' + classes.headerTopSection}>
              {userInfo.firstName && userInfo.lastName && (
                <div>
                  <p className={classes.userName + ' fr-text--md'}>{userName}</p>
                  <p className={classes.userEmail + ' fr-text--sm'}>{userEmail}</p>
                </div>
              )}
              <HeaderCompaniesDropdown/>
            </section>
            <hr className={`hr-unstyled ${classes.navDivider}`} />
            <section className={classes.navSections}>
              <Button
                priority="tertiary no outline"
                iconPosition="left"
                iconId="fr-icon-add-line"
                onClick={
                  location.pathname === "/app"
                    ? () => setOpen(false)
                    : () => history.push("/app")
                }
                className={classes.navItemButton}
              >
                {displayCurrentMission ? "Mission en cours" : "Nouvelle mission"}
              </Button>
              <Button
                priority="tertiary no outline"
                iconPosition="left"
                iconId="fr-icon-time-line"
                onClick={
                  location.pathname === "/app/history"
                    ? () => setOpen(false)
                    : () => history.push("/app/history")
                }
                className={classes.navItemButton}
              >
                Mes missions passées
              </Button>
              <Button
                priority="tertiary no outline"
                iconPosition="left"
                iconId="fr-icon-qr-code-line"
                onClick={() => {
                  modals.open("userReadQRCode");
                }}
                className={classes.navItemButton}
              >
                Accès contrôleur
              </Button>
            </section>
            <hr className={`hr-unstyled ${classes.navDivider}`} />
          </>
        )}
        <div className={classes.navList}>
          {routes
            .filter(
              (r) =>
                !r.menuItemFilter || r.menuItemFilter({ userInfo, companies })
            )
            .map((route) => 
              <ListRouteItem
                userInfo={userInfo}
                companies={companies}
                key={route.path || route.label}
                route={route}
                closeDrawer={() => setOpen(false)}
              />
            )
          }
        </div>
      </div>
    </Navigation>
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
    <Select
      label={
        <span
          className="fr-icon-building-line fr-icon--sm"
          aria-hidden="true"
          style={{ color: 'var(--text-action-high-blue-france)' }}
        />
      }
      nativeSelectProps={{
        id: "select-company-id",
        value: company?.id?.toString() ?? "",
        onChange: (e) => {
          adminStore.dispatch({
            type: ADMIN_ACTIONS.updateCompanyId,
            payload: { companyId: Number(e.target.value) }
          });
        },
        className: "noFocusRingSelect",
        style: {
          color: 'var(--text-action-high-blue-france)',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: 'inherit',
          boxShadow: 'none',
          margin: 0,
          padding: 0,
        }
      }}
      className={classes.companyDrowndown}
    >
      <option value="" disabled>
        Selectionnez une entreprise
      </option>
      {
        companies.map((c) => (
          <option 
            key={c.id} 
            value={c.id}
          >
            {c.name}
          </option>
        ))
      }
    </Select>
  );
};

/*const HeaderCompaniesDropdown = () => {
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
      onChange={(e) => {
        adminStore.dispatch({
          type: ADMIN_ACTIONS.updateCompanyId,
          payload: { companyId: e.target.value }
        });
      }}
    >
      {companies.map((c) => (
        <MenuItem key={c.id} value={c.id}>
          {c.name}
        </MenuItem>
      ))}
    </TextField>
  );
};*/

function DesktopHeader({ disableMenu }) {
  const store = useStoreSyncedWithLocalStorage();
  const adminStore = useAdminStore();

  const location = useLocation();
  const history = useHistory();

  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);

  const classes = useStyles();
  const userInfo = store.userInfo();
  const companies = store.companies();
  const company = companies.find((c) => c.id === adminStore.companyId);
  const companyName = company ? company.name : null;
  const routes = getAccessibleRoutes({ userInfo, companies });

  const quickAccessItemsPublic = [
    {
      iconId: 'fr-icon-mail-line',
      linkProps: {
        to: "mailto:contact@mobilic.beta.gouv.fr",
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      text: 'Nous contacter',
    },
    {
      iconId: 'fr-icon-add-circle-line',
      linkProps: {
        to: '/signup/role_selection',
        target: '_self'
      },
      text: 'Créer un compte',
    },
    {
      iconId: 'fr-icon-lock-line',
      linkProps: {
        to: '/login-selection',
        target: '_self'
      },
      text: 'Se connecter',
    }
  ]

  const quickAccessItemsConnected = [
    {
      iconId: '',
      buttonProps: {
        type: "button",
        disabled: true
      },
      text: <span style={{ color: 'var(--text-action-high-grey)' }}>{formatPersonName(userInfo)}</span>,
    },
    {
      iconId: '',
      buttonProps: {
        type: "button",
        disabled: true
      },
      text: (
        <HeaderCompaniesDropdown />
      ),
    },
    {
      iconId: '',
      buttonProps: {
        type: "button",
        disabled: false,
        onClick: () => setOpenNavDrawer(true)
      },
      text: <span className="fr-icon-menu-fill fr-icon--sm" aria-hidden="true"></span>,
    },
  ]

  const navigation = [
    {
      linkProps: {
        to: '/',
        target: '_self'
      },
      text: 'Accueil',
      isActive: location.pathname === '/'
    },
    {
      linkProps: {
        to: '/resources/home',
        target: '_self'
      },
      text: 'Documentation',
      isActive: location.pathname === '/resources/home'
    },
    {
      linkProps: {
        to: '/partners',
        target: '_self'
      },
      text: 'Partenaires et logiciels',
      isActive: location.pathname === '/partners'
    },
    {
      linkProps: {
        to: '/certificate',
        target: '_self'
      },
      text: 'Certificat',
      isActive: location.pathname === '/certificate'
    },
    {
      linkProps: {
        to: 'https://faq.mobilic.beta.gouv.fr',
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      text: (
        <>
          Aide
          <span
            className="fr-icon-external-link-line fr-icon--sm fr-ml-2v"
            aria-hidden="true"
          />
        </>
      ),
      isActive: false,
    }
  ];

    if (store.userId()) {
      return(
        <>
          <Header
            brandTop={<>RÉPUBLIQUE<br />FRANÇAISE</>}
            homeLinkProps={{
              to: '/',
              title: 'Accueil - Mobilic'
            }}
            id="fr-header-simple-header-connected"
            operatorLogo={{
              alt: 'Mobilic',
              imgUrl: MobilicLogoWithText,
              orientation: 'horizontal'
            }}
            quickAccessItems={quickAccessItemsConnected}
            navigation={navigation}
            classes={{
              root: "mobilic-dsfr-header",
              toolsLinks: classes.headerToolsLinks
            }}
          />
          {
            openNavDrawer &&
            <NavigationMenu
              key={1}
              open={openNavDrawer}
              setOpen={setOpenNavDrawer}
            />
        }
        </>
      )
    } else {
      return (
        <Header
          brandTop={<>RÉPUBLIQUE<br />FRANÇAISE</>}
          homeLinkProps={{
            to: '/',
            title: 'Accueil - Mobilic'
          }}
          id="fr-header-simple-header"
          operatorLogo={{
            alt: 'Mobilic',
            imgUrl: MobilicLogoWithText,
            orientation: 'horizontal'
          }}
          navigation={navigation}
          quickAccessItems={quickAccessItemsPublic}
          classes={{
            root: "mobilic-dsfr-header",
          }}
        />
      )
    }
}

export function MobilicHeader({ disableMenu, forceMobile = false }) {
  const store = useStoreSyncedWithLocalStorage();
  const controllerId = store.controllerId();
  const isMdUp = useIsWidthUp("md");
  return controllerId ? (
    <ControllerHeader />
  ) : (
    <HeaderComponent fitContainer={forceMobile}>
        <DesktopHeader disableMenu={disableMenu} />
    </HeaderComponent>
  );
}
