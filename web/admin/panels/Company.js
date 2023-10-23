import React, { useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
import Box from "@mui/material/Box";
import VehicleAdmin from "./Vehicles";
import KnownAddressAdmin from "./KnownAddresses";
import SettingAdmin from "./Settings";
import CompanyApiPanel from "./CompanyApiPanel";
import CompanyTeamsPanel from "./CompanyTeamsPanel";
import CertificationPanel from "./CertificationPanel/CertificationPanel";
import { useApi } from "common/utils/api";
import {
  SNOOZE_CERTIFICATION_INFO,
  UPDATE_COMPANY_NAME
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import EditableTextField from "../../common/EditableTextField";

export const usePanelStyles = makeStyles(theme => ({
  navigation: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    flexShrink: 0,
    top: "0",
    zIndex: 500,
    textAlign: "left",
    flexWrap: "wrap",
    [theme.breakpoints.up("md")]: {
      position: "sticky"
    },
    [theme.breakpoints.down("lg")]: {
      position: "static"
    }
  },
  subPanel: {
    padding: theme.spacing(2),
    textAlign: "left"
  },
  createCompanyButton: {
    marginTop: theme.spacing(1),
    flexShrink: 0
  },
  explanation: {
    marginBottom: theme.spacing(2),
    fontStyle: "italic",
    textAlign: "justify"
  },
  companyName: {
    marginBottom: theme.spacing(1)
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
  vehiclesAlert: {
    marginRight: theme.spacing(10),
    marginBottom: theme.spacing(2)
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
  addNewTokenAlert: {
    marginBottom: theme.spacing(2)
  },
  addNewTokenExplanation: {
    fontSize: "0.875rem"
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
  warningOneTeamNoAdmin: {
    marginBottom: theme.spacing(2)
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
  const api = useApi();
  const adminStore = useAdminStore();
  const classes = usePanelStyles();
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
    <>
      {COMPANY_SUB_PANELS.map(panelInfos => (
        <ToggleButtonGroup
          key={panelInfos.view}
          value={view}
          exclusive
          onChange={(e, newView) => {
            if (newView) setView(newView);
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
    </>
  );
}

function CompanyPanel({ width, containerRef }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const classes = usePanelStyles({ width });
  const location = useLocation();

  const [view, setView] = React.useState("employees");
  const [, company] = useAdminCompanies();

  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);
  const currentCompanyName = company ? company.name : "";

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const tab = queryString.get("tab");
    if (COMPANY_SUB_PANELS.find(tabs => tabs.view === tab)) {
      setView(tab);
    }
  }, [location]);

  const updateCompanyName = useCallback(async (companyId, newName) => {
    try {
      const response = await api.graphQlMutate(
        UPDATE_COMPANY_NAME,
        { companyId, newName },
        { context: { nonPublicApi: false } }
      );

      const id = response?.data?.updateCompanyName?.id;
      if (id) {
        adminStore.dispatch({
          type: ADMIN_ACTIONS.updateCompanyName,
          payload: { companyId, companyName: newName }
        });
      } else {
        console.log("CompanyId is falsy:", typeof id);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, []);

  return [
    <>
      <Paper
        className={`${classes.navigation} flex-row-center`}
        variant="outlined"
        key={1}
      >
        <Grid
          container
          spacing={5}
          justifyContent="space-between"
          alignItems="center"
          style={{ flex: "1 1 auto" }}
        >
          <Grid item>
            <Box>
              <EditableTextField
                text={currentCompanyName}
                onSave={newName => {
                  updateCompanyName(company.id, newName);
                }}
                className={classes.companyName}
                maxLength={255}
              />
              <SubNavigationToggle view={view} setView={setView} />
            </Box>
          </Grid>
          <Grid item>
            <LinkButton
              className={classes.createCompanyButton}
              size="small"
              variant="contained"
              color="primary"
              to="/signup/company"
            >
              Inscrire une nouvelle entreprise
            </LinkButton>
          </Grid>
        </Grid>
      </Paper>
      ,
      <Paper className={classes.subPanel} variant="outlined" key={2}>
        {company ? subPanel.component({ company, containerRef }) : null}
      </Paper>
    </>
  ];
}

export default CompanyPanel;
