import React from "react";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation
} from "react-router-dom";
import Container from "@mui/material/Container";
import "./assets/admin.scss";
import {
  loadCompaniesList,
  loadCompanyDetails
} from "./utils/loadCompaniesData";
import { useApi } from "common/utils/api";
import { AdminStoreProvider, useAdminStore } from "./store/store";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";

import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { useIsWidthUp, useWidth } from "common/utils/useWidth";
import { SideMenu } from "./components/SideMenu";
import { useSnackbarAlerts } from "../common/Snackbar";
import { ADMIN_VIEWS } from "./utils/navigation";
import { ADMIN_ACTIONS } from "./store/reducers/root";
import { MissionDrawerContextProvider } from "./components/MissionDrawer";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "stretch",
    overflowY: "hidden"
  },
  panelContainer: {
    flex: "100 1 auto",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
}));

function _Admin() {
  const api = useApi();
  const adminStore = useAdminStore();
  const withLoadingScreen = useLoadingScreen();
  const { path } = useRouteMatch();
  const alerts = useSnackbarAlerts();

  const classes = useStyles();
  const [shouldRefreshData, setShouldRefreshData] = React.useState({
    value: true
  });

  const location = useLocation();
  const width = useWidth();
  const isMdUp = useIsWidthUp("md");

  const views = ADMIN_VIEWS.map(view => {
    const absPath = `${path}${view.path}`;
    return {
      ...view,
      path: absPath
    };
  });

  async function loadDataCompaniesList() {
    const userId = adminStore.userId;
    if (userId) {
      setShouldRefreshData({ value: false });
      shouldRefreshData.value = false;
      withLoadingScreen(
        async () =>
          await alerts.withApiErrorHandling(
            async () => {
              const companies = await loadCompaniesList(api, userId);
              adminStore.dispatch({
                type: ADMIN_ACTIONS.updateCompaniesList,
                payload: { companiesPayload: companies }
              });

              const companyId = companies[0].id;

              adminStore.dispatch({
                type: ADMIN_ACTIONS.updateCompanyId,
                payload: { companyId: companyId }
              });
            },
            "load-companies-list",
            null,
            () => setShouldRefreshData(true)
          )
      );
    }
  }

  async function loadDataCompanyDetails() {
    const userId = adminStore.userId;
    const companyId = adminStore.companyId;
    if (userId && companyId) {
      setShouldRefreshData({ value: false });
      withLoadingScreen(
        async () =>
          await alerts.withApiErrorHandling(
            async () => {
              const minDate = adminStore.activitiesFilters.minDate;
              const companies = await loadCompanyDetails(
                api,
                userId,
                minDate,
                companyId
              );
              adminStore.dispatch({
                type: ADMIN_ACTIONS.updateCompanyDetails,
                payload: { companiesPayload: companies, minDate }
              });
            },
            "load-company-details",
            null
          )
      );
    }
  }

  React.useEffect(() => {
    if (shouldRefreshData.value) loadDataCompaniesList();
  }, [adminStore.userId]);

  React.useEffect(() => {
    if (
      location.pathname.startsWith("/admin/activities") &&
      shouldRefreshData.value
    )
      if (adminStore.companyId) {
        loadDataCompanyDetails();
      } else {
        loadDataCompaniesList();
      }
  }, [location]);

  React.useEffect(() => {
    if (adminStore.companyId) loadDataCompanyDetails();
  }, [adminStore.companyId]);

  const ref = React.useRef(null);

  const shouldRefreshDataSetter = val => setShouldRefreshData({ value: val });

  const defaultView = views.find(view => view.isDefault);
  return [
    <Header key={0} />,
    <MissionDrawerContextProvider
      key={1}
      width={width}
      setShouldRefreshData={shouldRefreshDataSetter}
    >
      <Container
        key={1}
        maxWidth={false}
        disableGutters
        className={classes.container}
      >
        {isMdUp && <SideMenu views={views} />}
        <Container
          className={`scrollable ${classes.panelContainer}`}
          maxWidth={false}
          ref={ref}
        >
          <Switch color="secondary">
            {views.map(view => (
              <Route
                key={view.label}
                path={view.path}
                render={() => (
                  <view.component
                    containerRef={ref}
                    setShouldRefreshData={val =>
                      setShouldRefreshData(shouldRefreshDataSetter)
                    }
                  />
                )}
              />
            ))}
            {defaultView && (
              <Redirect key="default" push from="*" to={defaultView.path} />
            )}
          </Switch>
        </Container>
      </Container>
    </MissionDrawerContextProvider>
  ];
}

export default function Admin(props) {
  return (
    <LoadingScreenContextProvider>
      <AdminStoreProvider>
        <_Admin {...props} />
      </AdminStoreProvider>
    </LoadingScreenContextProvider>
  );
}
