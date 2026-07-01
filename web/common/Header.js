import React from "react";
import Box from "@mui/material/Box";
import { MobileHeaderConnected } from "./MobileHeaderConnected";
import { formatPersonName } from "common/utils/coworkers";
import {
  CERTIFICATE_ROUTE,
  getAccessibleRoutes,
  getBadgeRoutes
} from "./routes";
import { useHistory, useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import useTheme from "@mui/styles/useTheme";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Link } from "./LinkButton";
import { useAdminStore, useAdminCompanies } from "../admin/store/store";
import {
  useCertificationInfo,
  useShouldDisplayBadge
} from "../admin/utils/certificationInfo";
import { TextWithBadge } from "./TextWithBadge";
import { ADMIN_ACTIONS } from "../admin/store/reducers/root";
import { ControllerHeader } from "../controller/components/header/ControllerHeader";
import classNames from "classnames";
import { fr } from "@codegouvfr/react-dsfr";
import { Navigation } from "./Navigation";
import { useModals } from "common/utils/modals";
import { useStoreMissions } from "common/store/contextMissions";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Select } from "@codegouvfr/react-dsfr/Select";
import MobilicLogoWithText from "common/assets/images/mobilic-logo-with-text.svg";
import { useIsWidthDown } from "common/utils/useWidth";


const useStyles = makeStyles((theme) => ({
  navItemButton: {
    borderRadius: 2,
    padding: "0",
    fontSize: "1rem",
    fontWeight: 400,
  },
  companyDrowndown: {
    display: "inline-flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    border: '1px solid var(--border-default-grey)',
    padding: '0.25rem 0 0.25rem 0.75rem',
    gap: theme.spacing(1),
    "& .noFocusRingSelect:focus": {
      outline: "none",
      outlineStyle: "none",
      outlineColor: "transparent",
      outlineWidth: 0,
      outlineOffset: 0
    },
  },
  navListItem: {
    width: "100%",
    display: "block",
    padding: "0.75rem 0",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default
    },
    fontSize: "1rem",
    fontWeight: 400,
    color: fr.colors.decisions.text.default.grey.default
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  navListItemWrapper: {
    width: "100%"
  },
  mainLeafNavListItemWrapper: {
    padding: "0.75rem 1rem"
  },
  selectedNavListItem: {
    color: fr.colors.decisions.text.active.blueFrance.default,
  },
  nestedListSubheader: {
    padding: "0.75rem 0",
    color:  fr.colors.decisions.text.title.grey.default,
    fontWeight: 600
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
    gap: '1rem !important'
  },
  navTopSection: {
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing(2),
    alignItems: "flex-start",
  },
  navSections: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "flex-start",
    padding: '0.75rem 1.5rem',
  },
  navDivider: {
    width: "100%",
    border: 0,
    borderTop: "1px solid var(--border-default-grey)",
    margin: 0
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


export function ListRouteItem({ route, closeDrawer, userInfo, companies, isLastRoute = false, isSubRoute = false }) {
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
              isSubRoute={true}
            />
          ))}
      </section>
      {
        !isLastRoute &&
        <hr className={` hr-unstyled ${classes.navDivider}`} />
      }
    </>

  ) : (
    <div
      className={
        classes.navListItemWrapper +
        (isSubRoute ? "" : ` ${classes.mainLeafNavListItemWrapper}`)
      }
      key={route.path || route.label}
    >
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

export function NavigationMenu({ open, setOpen, fullScreen = false }) {
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

  const userName = formatPersonName(userInfo);
  const userEmail = userInfo?.email || "email non renseigné";
  
  const filteredRoutes = routes.filter(
    (r) =>
      !r.menuItemFilter || r.menuItemFilter({ userInfo, companies })
  );

  return (
    <Navigation open={open} setOpen={setOpen} fullScreen={fullScreen}>
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
                iconId={displayCurrentMission ? "fr-icon-play-circle-line" : "fr-icon-add-line"}
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
                Historique
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
          {
            filteredRoutes.map((route, index) =>
              <ListRouteItem
                userInfo={userInfo}
                companies={companies}
                key={route.path || route.label}
                route={route}
                closeDrawer={() => setOpen(false)}
                isLastRoute={index === filteredRoutes.length - 1}
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
          paddingLeft: '0',
          paddingTop: '0',
          paddingBottom: '0',
          paddingRight: '2.5rem',
        }
      }}
      className={classes.companyDrowndown}
    >
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
];

const commonHeaderProps = {
  brandTop: <>RÉPUBLIQUE<br />FRANÇAISE</>,
  homeLinkProps: {
    to: '/',
    title: 'Accueil - Mobilic'
  },
  operatorLogo: {
    alt: 'Mobilic',
    imgUrl: MobilicLogoWithText,
    orientation: 'horizontal'
  },
};

function AppHeader() {
  const store = useStoreSyncedWithLocalStorage();

  const location = useLocation();
  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);
  const classes = useStyles();
  const userInfo = store.userInfo();
  const isLgDown = useIsWidthDown("lg");

  const openNavigationMenu = React.useCallback(() => {
    setOpenNavDrawer(true);
  }, []);

  const quickAccessItemsConnected = React.useMemo(() => [
    <span style={{ color: 'var(--text-action-high-grey)' }}>{formatPersonName(userInfo)}</span>,
    <HeaderCompaniesDropdown />,
    {
      iconId: '',
      buttonProps: {
        type: "button",
        disabled: false,
        onClick: openNavigationMenu
      },
      text: <span className="fr-icon-menu-fill fr-icon--sm" aria-label="Menu" title="Menu"></span>,
    },
  ], [userInfo, openNavigationMenu]);

  const navigation = React.useMemo(() => [
    {
      linkProps: { to: '/', target: '_self' },
      text: 'Accueil',
      isActive: location.pathname === '/'
    },
    {
      linkProps: { to: '/resources/home', target: '_self' },
      text: 'Documentation',
      isActive: location.pathname === '/resources/home'
    },
    {
      linkProps: { to: '/partners', target: '_self' },
      text: 'Partenaires et logiciels',
      isActive: location.pathname === '/partners'
    },
    {
      linkProps: { to: '/certificate', target: '_self' },
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
          {"Centre d'aide"}
          <span
            className="fr-icon-external-link-line fr-icon--sm fr-ml-2v"
            aria-hidden="true"
          />
        </>
      ),
      isActive: false,
    }
  ], [location.pathname]);

  if (store.userId()) {
    return(
      <>
        {
          isLgDown ? (
            <MobileHeaderConnected openNavigationMenu={openNavigationMenu} />
          ) : (
            <Header
              {...commonHeaderProps}
              id="fr-header-simple-header-connected"
              quickAccessItems={quickAccessItemsConnected}
              classes={{
                root: "mobilic-dsfr-header",
                toolsLinks: classes.headerToolsLinks,
              }}
            />
          )
        }

        {
          openNavDrawer &&
          <NavigationMenu
            key={1}
            open={openNavDrawer}
            setOpen={setOpenNavDrawer}
            fullScreen={isLgDown}
          />
        }
      </>
    )
  } else {
    return (
      <Header
        {...commonHeaderProps}
        id="fr-header-simple-header"
        navigation={navigation}
        quickAccessItems={quickAccessItemsPublic}
      />
    )
  }
}

export function MobilicHeader({ forceMobile = false }) {
  const store = useStoreSyncedWithLocalStorage();
  const controllerId = store.controllerId();

  return controllerId ? (
    <ControllerHeader />
  ) : (
    <HeaderComponent fitContainer={forceMobile}>
      <AppHeader />
    </HeaderComponent>
  );
}
