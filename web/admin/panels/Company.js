import React from "react";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useAdminStore } from "../utils/store";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import { Employees } from "./Employees";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import { LinkButton } from "../../common/LinkButton";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import VehicleAdmin from "./Vehicles";
import KnownAddressAdmin from "./KnownAddresses";
import SettingAdmin from "./Settings";

export const usePanelStyles = makeStyles(theme => ({
  navigation: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    flexShrink: 0,
    position: ({ width }) => (isWidthUp("md", width) ? "sticky" : "static"),
    top: "0",
    zIndex: 500,
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
  }
}));

const COMPANY_SUB_PANELS = [
  {
    label: "Employés",
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
  }
];

function SubNavigationToggle({ view, setView }) {
  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={(e, newView) => {
        if (newView) setView(newView);
      }}
      size="small"
    >
      {COMPANY_SUB_PANELS.map(panelInfos => (
        <ToggleButton key={panelInfos.view} value={panelInfos.view}>
          {panelInfos.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function _CompanyPanel({ width, containerRef }) {
  const [view, setView] = React.useState("employees");

  const [selectedCompanyId, setSelectedCompanyId] = React.useState(null);
  const [company, setCompany] = React.useState(null);

  const adminStore = useAdminStore();

  const companies = adminStore.companies;

  React.useEffect(() => {
    if (!selectedCompanyId && companies && companies.length > 0) {
      const defaultCompany = companies[0];
      setSelectedCompanyId(defaultCompany.id);
      setCompany(defaultCompany);
    } else if (selectedCompanyId && companies) {
      setCompany(companies.find(c => c.id === selectedCompanyId));
    } else setCompany(null);
  }, [companies]);

  const classes = usePanelStyles({ width });
  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);

  const currentCompanyName = company ? company.name : "";

  return [
    <Paper
      className={`${classes.navigation} flex-row-center`}
      variant="outlined"
      key={1}
    >
      <Grid
        container
        spacing={5}
        justify="space-between"
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
        {companies && companies.length > 1 && (
          <Grid item>
            <TextField
              id="select-company-id"
              select
              label="Entreprise"
              value={company ? company.id : 0}
              onChange={e => {
                setSelectedCompanyId(e.target.value);
                setCompany(companies.find(c => c.id === e.target.value));
              }}
              helperText="Voir une autre entreprise"
            >
              {companies.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
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

const CompanyPanel = withWidth()(_CompanyPanel);

export default CompanyPanel;
