import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { useAdminCompanies } from "../store/store";
import {
  useCertificationInfo,
  useSendCertificationInfoResult,
  useShouldDisplayScenariis
} from "../utils/certificationInfo";
import { getCertificateBadge } from "../../common/routes";
import Badge from "@mui/material/Badge";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Employees } from "./Employees";
import Grid from "@mui/material/Grid";
import { LinkButton } from "../../common/LinkButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import VehicleAdmin from "./Vehicles";
import KnownAddressAdmin from "./KnownAddresses";
import SettingAdmin from "./Settings";
import CompanyApiPanel from "./CompanyApiPanel";
import CompanyTeamsPanel from "./CompanyTeamsPanel";
import CertificationPanel from "./CertificationPanel/CertificationPanel";

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
  const classes = usePanelStyles();
  const { companyWithInfo } = useCertificationInfo();
  const [shouldDisplayBadge] = useShouldDisplayScenariis();
  const certificateBadge = useMemo(() => {
    if (!shouldDisplayBadge) {
      return null;
    }
    return getCertificateBadge(companyWithInfo);
  }, [companyWithInfo, shouldDisplayBadge]);
  const [sendSuccess, , sendLoad] = useSendCertificationInfoResult();
  React.useEffect(async () => {
    if (certificateBadge) {
      await sendLoad();
    }
  }, [certificateBadge]);
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
              panelInfos.onClick && shouldDisplayBadge
                ? () => panelInfos.onClick(sendSuccess)
                : null
            }
          >
            {panelInfos.view === "certificat" ? (
              <Badge invisible={!certificateBadge} {...certificateBadge}>
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

  return [
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
            <Typography className={classes.companyName} variant="h3">
              {currentCompanyName}
            </Typography>
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
    </Paper>,
    <Paper className={classes.subPanel} variant="outlined" key={2}>
      {company ? subPanel.component({ company, containerRef }) : null}
    </Paper>
  ];
}

export default CompanyPanel;
