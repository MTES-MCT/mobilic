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
import { useSnackbarAlerts } from "../common/Snackbar";
import { isoFormatLocalDate } from "common/utils/time";
import { ADMIN_VIEWS } from "./utils/navigation";
import { ADMIN_ACTIONS } from "./store/reducers/root";
import { MissionDrawerContextProvider } from "./components/MissionDrawer";
import CertificationCommunicationModal from "../pwa/components/CertificationCommunicationModal";
import { shouldUpdateBusinessType } from "common/utils/updateBusinessType";
import { shouldDisplayContractTypeModal } from "common/utils/updateContractType";
import UpdateCompanyBusinessTypeModal from "./modals/UpdateCompanyBusinessTypeModal";
import UpdateEmployeeContractTypeModal from "./modals/UpdateEmployeeContractTypeModal";
import ContractTypeSetupPanel from "./panels/ContractTypeSetupPanel";
import { Main } from "../common/semantics/Main";

import { SideMenu } from "./components/SideMenu/SideMenu";

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

function AdminComponent() {
  const api = useApi();
  const adminStore = useAdminStore();
  const withLoadingScreen = useLoadingScreen();
  const { path } = useRouteMatch();
  const alerts = useSnackbarAlerts();

  const classes = useStyles();
  const [shouldRefreshData, setShouldRefreshData] = React.useState({
    value: true
  });
  const [
    companiesToAcceptCertificateCommunication,
    setCompaniesToAcceptCertificateCommunication
  ] = React.useState([]);
  const [showContractTypeSetup, setShowContractTypeSetup] = React.useState(
    false
  );
  const [showContractTypeModal, setShowContractTypeModal] = React.useState(
    false
  );

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
              setCompaniesToAcceptCertificateCommunication(
                companies?.filter(
                  company =>
                    !!company.isCertified &&
                    company.acceptCertificationCommunication === null
                )
              );
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

  async function refreshData() {
    if (adminStore.companyId) {
      loadDataCompanyDetails();
    } else {
      loadDataCompaniesList();
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
      refreshData();
  }, [location]);

  React.useEffect(() => {
    if (adminStore.companyId) loadDataCompanyDetails();
  }, [adminStore.companyId]);

  React.useEffect(() => {
    const { userId, companyId, employments } = adminStore;
    if (!userId || !companyId || !employments || employments.length === 0) {
      return;
    }
    const employment = employments.find(
      employment =>
        employment.companyId === companyId && employment.user?.id === userId
    );
    if (!employment) {
      return;
    }
    const { shouldSeeCertificateInfo, id } = employment;
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateShouldSeeCertificateInfo,
      payload: { shouldSeeCertificateInfo }
    });
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateEmploymentId,
      payload: { employmentId: id }
    });
  }, [adminStore.userId, adminStore.companyId, adminStore.employments]);

  const ref = React.useRef(null);

  const shouldRefreshDataSetter = val => setShouldRefreshData({ value: val });

  const defaultView = views.find(view => view.isDefault);

  const shouldShowContractTypeModal = () => {
    if (!adminStore.business || !adminStore.business.businessType) {
      return false;
    }

    if (!shouldDisplayContractTypeModal()) {
      return false;
    }
    const eligibleEmployments =
      adminStore.employments?.filter(
        emp =>
          emp.companyId === adminStore.companyId &&
          emp.isAcknowledged &&
          emp.user.firstName &&
          emp.user.lastName &&
          (!emp.endDate || emp.endDate >= isoFormatLocalDate(new Date()))
      ) || [];

    return eligibleEmployments.some(emp => !emp.contractType);
  };

  React.useEffect(() => {
    if (
      shouldShowContractTypeModal() &&
      !showContractTypeModal &&
      !showContractTypeSetup
    ) {
      setShowContractTypeModal(true);
    }
  }, [
    adminStore.business,
    adminStore.employments,
    adminStore.companyId,
    showContractTypeModal,
    showContractTypeSetup
  ]);

  const handleStartContractTypeSetup = () => {
    setShowContractTypeModal(false);
    setShowContractTypeSetup(true);
  };

  const handleCloseContractTypeSetup = () => {
    setShowContractTypeSetup(false);
  };

  const handleSnoozeContractType = () => {
    setShowContractTypeModal(false);
  };

  return (
    <>
      {!!adminStore.business &&
        !adminStore.business.businessType &&
        shouldUpdateBusinessType() && <UpdateCompanyBusinessTypeModal />}
      {showContractTypeModal && (
        <UpdateEmployeeContractTypeModal
          onStartSetup={handleStartContractTypeSetup}
          onClose={handleSnoozeContractType}
        />
      )}
      <Header />
      <MissionDrawerContextProvider
        width={width}
        setShouldRefreshData={shouldRefreshDataSetter}
        refreshData={refreshData}
      >
        {companiesToAcceptCertificateCommunication?.length > 0 && (
          <CertificationCommunicationModal
            companies={companiesToAcceptCertificateCommunication}
            onClose={() => setCompaniesToAcceptCertificateCommunication([])}
          />
        )}
        <Main maxWidth={false} className={classes.container} disableGutters>
          {isMdUp && <SideMenu views={views} />}
          <Container
            className={`scrollable ${classes.panelContainer}`}
            maxWidth={false}
            ref={ref}
          >
            <Switch>
              {showContractTypeSetup ? (
                <ContractTypeSetupPanel
                  onClose={handleCloseContractTypeSetup}
                />
              ) : (
                <>
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
                    <Route
                      path="*"
                      render={() => <Redirect push to={defaultView.path} />}
                    />
                  )}
                </>
              )}
            </Switch>
          </Container>
        </Main>
      </MissionDrawerContextProvider>
    </>
  );
}

export default function Admin(props) {
  return (
    <LoadingScreenContextProvider>
      <AdminStoreProvider>
        <AdminComponent {...props} />
      </AdminStoreProvider>
    </LoadingScreenContextProvider>
  );
}
