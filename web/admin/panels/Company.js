import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { useAdminCompanies } from "../store/store";
import { Employees } from "./EmployeesSection/Employees";
import VehicleAdmin from "./Vehicles";
import KnownAddressAdmin from "./KnownAddresses";
import SettingAdmin from "./Settings";
import CompanyApiPanel from "./CompanyApiPanel";
import CompanyTeamsPanel from "./CompanyTeamsPanel";
import { usePageTitle } from "../../common/UsePageTitle";
import CompanyDetails from "../../home/CompanyDetails";
import { fr } from "@codegouvfr/react-dsfr";

export const usePanelStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehiclesTable: {
    marginRight: theme.spacing(10),
  },
  knownAddressesTable: {
    marginRight: theme.spacing(10),
  },
  buttonAddToken: {
    textAlign: "right",
  },
  addNewTokenSection: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: theme.spacing(4),
  },
  validateNewClientIdButton: {
    marginRight: theme.spacing(2),
  },
  newClientIdField: {
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    padding: theme.spacing(4),
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  subPanel: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    textAlign: "left",
  },
  tertiaryHeader: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(4),
  },
  separator: {
    border: `1px solid ${theme.palette.divider}`,
    marginLeft: `-${theme.spacing(4)}`,
    marginRight: `-${theme.spacing(4)}`,
    padding: 0,
  },
  navButton: {
    padding: theme.spacing(2),
    border: "none",
    cursor: "pointer",
    "&.active": {
      color: fr.colors.decisions.text.actionHigh.blueFrance.default,
      fontWeight: "regular",
      borderBottom: `2px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
    },
  },
}));

const COMPANY_SUB_PANELS = [
  {
    label: "Salariés",
    view: "employees",
    component: (props) => <Employees {...props} />,
  },
  {
    label: "Véhicules",
    view: "vehicles",
    component: (props) => <VehicleAdmin {...props} />,
  },
  {
    label: "Adresses",
    view: "addresses",
    component: (props) => <KnownAddressAdmin {...props} />,
  },
  {
    label: "Paramètres",
    view: "settings",
    component: (props) => <SettingAdmin {...props} />,
  },
  {
    label: "Groupe(s)",
    view: "teams",
    component: (props) => <CompanyTeamsPanel {...props} />,
  },
  {
    label: "API",
    view: "api",
    component: (props) => <CompanyApiPanel {...props} />,
  },
];

function SubNavigationToggle({ view }) {
  usePageTitle("Entreprise(s) - Mobilic");
  const classes = usePanelStyles();
  const history = useHistory();

  return (
    <div className={classes.tertiaryHeader}>
      {COMPANY_SUB_PANELS.map((panelInfos) => (
        <button
          key={panelInfos.view}
          onClick={() => history.push(`?tab=${panelInfos.view}`)}
          className={`${classes.navButton}${
            view === panelInfos.view ? " active" : ""
          }`}
        >
          {panelInfos.label}
        </button>
      ))}
    </div>
  );
}

function CompanyPanel({ containerRef }) {
  const classes = usePanelStyles();
  const location = useLocation();
  const history = useHistory();

  const [view, setView] = React.useState("employees");
  const [, company] = useAdminCompanies();

  const subPanel = COMPANY_SUB_PANELS.find((sp) => sp.view === view);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const tab = queryString.get("tab");
    if (COMPANY_SUB_PANELS.find((tabs) => tabs.view === tab)) {
      setView(tab);
    } else {
      history.push(`?tab=employees`);
    }
  }, [location]);

  return (
    <div className={classes.root}>
      <div>
        <div className={classes.top}>
          <CompanyDetails company={company} />
        </div>
        <SubNavigationToggle view={view} />
        <div className={classes.separator} />
      </div>
      <div className={classes.subPanel}>
        {company ? subPanel.component({ company, containerRef }) : null}
      </div>
    </div>
  );
}

export default CompanyPanel;
