import React, { useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { useAdminCompanies, useAdminStore } from "../store/store";
import {
  useCertificationInfo,
  useShouldDisplayBadge
} from "../utils/certificationInfo";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ADMIN_CERTIFICATE_TAB_WITH_BADGE,
  ADMIN_CERTIFICATE_TAB_WITHOUT_BADGE
} from "common/utils/matomoTags";
import { getCertificateBadge } from "../../common/routes";
import Badge from "@mui/material/Badge";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Employees } from "./Employees";
import Grid from "@mui/material/Grid";
import { LinkButton } from "../../common/LinkButton";
import VehicleAdmin from "./Vehicles";
import KnownAddressAdmin from "./KnownAddresses";
import SettingAdmin from "./Settings";
import CompanyApiPanel from "./CompanyApiPanel";
import CompanyTeamsPanel from "./CompanyTeamsPanel";
import CertificationPanel from "./CertificationPanel/CertificationPanel";
import { useApi } from "common/utils/api";
import { SNOOZE_CERTIFICATION_INFO } from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { usePageTitle } from "../../common/UsePageTitle";
import CompanyDetails from "../../home/CompanyDetails";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export const usePanelStyles = makeStyles(theme => ({
  navigation: {
    flexShrink: 0,
    textAlign: "left",
    flexWrap: "wrap"
  },
  subPanel: {
    padding: theme.spacing(2),
    textAlign: "left"
  },
  createCompanyButton: {
    marginTop: theme.spacing(1),
    flexShrink: 0
  },
  title: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  vehiclesTable: {
    marginRight: theme.spacing(10)
  },
  knownAddressesTable: {
    marginRight: theme.spacing(10)
  },
  buttonAddToken: {
    textAlign: "right"
  },
  addNewTokenSection: {
    marginBottom: theme.spacing(4)
  },
  validateNewClientIdButton: {
    marginRight: theme.spacing(2)
  },
  newClientIdField: {
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  toggleButton: {
    minWidth: theme.spacing(13)
  },
  customBadge: {
    "& .MuiBadge-badge": {
      right: theme.spacing(-0.6)
    }
  }
}));

const COMPANY_SUB_PANELS = [
  {
    label: "Salariés",
    view: "employees",
    component: props => <Employees {...props} />
  },
  {
    label: "Véhicules",
    view: "vehicles",
    component: props => <VehicleAdmin {...props} />
  },
  {
    label: "Adresses",
    view: "addresses",
    component: props => <KnownAddressAdmin {...props} />
  },
  {
    label: "Paramètres",
    view: "settings",
    component: props => <SettingAdmin {...props} />
  },
  {
    label: "Groupe(s)",
    view: "teams",
    component: props => <CompanyTeamsPanel {...props} />
  },
  {
    label: "Certificat",
    view: "certificat",
    component: props => <CertificationPanel {...props} />,
    onClick: async action => {
      await action();
    }
  },
  {
    label: "API",
    view: "api",
    component: props => <CompanyApiPanel {...props} />
  }
];

function SubNavigationToggle({ view, setView }) {
  usePageTitle("Entreprise(s) - Mobilic");
  const api = useApi();
  const adminStore = useAdminStore();
  const classes = usePanelStyles();
  const history = useHistory();
  const { trackEvent } = useMatomo();
  const { companyWithInfo } = useCertificationInfo();
  const shouldDisplayBadge = useShouldDisplayBadge();
  const certificateBadge = useMemo(() => {
    if (!shouldDisplayBadge) {
      return null;
    }
    return getCertificateBadge(companyWithInfo);
  }, [companyWithInfo, shouldDisplayBadge]);

  const snoozeCertificationInfo = async () => {
    await api.graphQlMutate(
      SNOOZE_CERTIFICATION_INFO,
      { employmentId: adminStore.employmentId },
      { context: { nonPublicApi: true } }
    );
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateShouldSeeCertificateInfo,
      payload: { shouldSeeCertificateInfo: false }
    });
  };

  return (
    <Stack direction="row">
      {COMPANY_SUB_PANELS.map(panelInfos => (
        <ToggleButtonGroup
          key={panelInfos.view}
          value={view}
          exclusive
          onChange={(e, newView) => {
            if (newView) history.push(`?tab=${newView}`);
          }}
          size="small"
        >
          <ToggleButton
            value={panelInfos.view}
            className={classes.toggleButton}
            onClick={
              panelInfos.onClick
                ? () => {
                    if (shouldDisplayBadge) {
                      panelInfos.onClick(() => {
                        snoozeCertificationInfo();
                        trackEvent(ADMIN_CERTIFICATE_TAB_WITH_BADGE);
                      });
                    } else {
                      trackEvent(ADMIN_CERTIFICATE_TAB_WITHOUT_BADGE);
                    }
                  }
                : null
            }
          >
            {panelInfos.view === "certificat" ? (
              <Badge
                invisible={!certificateBadge}
                {...certificateBadge}
                className={classes.customBadge}
              >
                {panelInfos.label}
              </Badge>
            ) : (
              panelInfos.label
            )}
          </ToggleButton>
        </ToggleButtonGroup>
      ))}
    </Stack>
  );
}

function CompanyPanel({ width, containerRef }) {
  const classes = usePanelStyles({ width });
  const location = useLocation();
  const history = useHistory();

  const [view, setView] = React.useState("employees");
  const [, company] = useAdminCompanies();

  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const tab = queryString.get("tab");
    if (COMPANY_SUB_PANELS.find(tabs => tabs.view === tab)) {
      setView(tab);
    } else {
      history.push(`?tab=employees`);
    }
  }, [location]);

  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{ marginTop: "8px", paddingX: "8px" }}
    >
      <Box
        className={`${classes.navigation} flex-row-center`}
        sx={{ marginBottom: "4px" }}
      >
        <Grid
          container
          spacing={5}
          justifyContent="space-between"
          alignItems="flex-start"
          style={{ flex: "1 1 auto" }}
        >
          <Grid item>
            <Paper variant="outlined" sx={{ padding: 2, maxWidth: "640px" }}>
              <Stack direction="column" spacing={2}>
                <CompanyDetails company={company} />
              </Stack>
            </Paper>
          </Grid>
          <Grid item>
            <LinkButton
              className={classes.createCompanyButton}
              priority="primary"
              size="small"
              to="/signup/company"
            >
              Inscrire une nouvelle entreprise
            </LinkButton>
          </Grid>
        </Grid>
      </Box>
      <SubNavigationToggle view={view} setView={setView} />
      <Paper className={classes.subPanel} variant="outlined">
        {company ? subPanel.component({ company, containerRef }) : null}
      </Paper>
    </Stack>
  );
}

export default CompanyPanel;
