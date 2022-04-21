import React from "react";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { useAdminCompanies } from "../store/store";
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

function CompanyPanel({ width, containerRef }) {
  const [view, setView] = React.useState("employees");

  const [, company] = useAdminCompanies();

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
