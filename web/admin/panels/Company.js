import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { useAdminCompanies } from "../store/store";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Employees } from "./Employees";
import { LinkButton } from "../../common/LinkButton";
import VehicleAdmin from "./Vehicles";
import KnownAddressAdmin from "./KnownAddresses";
import SettingAdmin from "./Settings";
import CompanyApiPanel from "./CompanyApiPanel";
import CompanyTeamsPanel from "./CompanyTeamsPanel";
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
    label: "API",
    view: "api",
    component: props => <CompanyApiPanel {...props} />
  }
];

function SubNavigationToggle({ view, setView }) {
  usePageTitle("Entreprise(s) - Mobilic");
  const classes = usePanelStyles();
  const history = useHistory();

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
          >
            {panelInfos.label}
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
      <Box>
        <Stack direction="row" justifyContent="space-between">
          <Paper variant="outlined" sx={{ padding: 2, maxWidth: "640px" }}>
            <Stack direction="column" spacing={2}>
              <CompanyDetails company={company} />
            </Stack>
          </Paper>
          <Box>
            <LinkButton
              className={classes.createCompanyButton}
              priority="primary"
              size="small"
              to="/signup/company"
            >
              Inscrire une nouvelle entreprise
            </LinkButton>
          </Box>
        </Stack>
      </Box>
      <SubNavigationToggle view={view} setView={setView} />
      <Paper className={classes.subPanel} variant="outlined">
        {company ? subPanel.component({ company, containerRef }) : null}
      </Paper>
    </Stack>
  );
}

export default CompanyPanel;
