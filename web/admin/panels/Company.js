import React from "react";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  useApi,
  CREATE_VEHICLE_MUTATION,
  EDIT_VEHICLE_MUTATION,
  TERMINATE_VEHICLE_MUTATION
} from "common/utils/api";
import { useAdminStore } from "../utils/store";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import { AugmentedTable } from "../components/AugmentedTable";
import { useModals } from "common/utils/modals";
import { Employees } from "./Employees";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import { LinkButton } from "../../common/LinkButton";
import * as Sentry from "@sentry/browser";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";

const useStyles = makeStyles(theme => ({
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
    padding: theme.spacing(2)
  },
  createCompanyButton: {
    marginTop: theme.spacing(1),
    flexShrink: 0
  }
}));

function VehicleAdmin({ companyId }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const columns = [
    {
      label: "Immatriculation",
      name: "registrationNumber",
      create: true,
      sortable: true
    },
    {
      label: "Nom usuel",
      name: "alias",
      create: true,
      edit: true,
      sortable: true
    }
  ];
  const vehicles = adminStore.vehicles.filter(v => v.companyId === companyId);
  return (
    <AugmentedTable
      columns={columns}
      entries={vehicles}
      editable={true}
      onRowEdit={async (vehicle, { alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            EDIT_VEHICLE_MUTATION,
            {
              id: vehicle.id,
              alias
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.setVehicles(oldVehicles => {
            const newVehicles = [...oldVehicles];
            const vehicleIndex = oldVehicles.findIndex(
              v => v.id === vehicle.id
            );
            if (vehicleIndex >= 0)
              newVehicles[vehicleIndex] = {
                ...apiResponse.data.vehicles.editVehicle,
                companyId: companyId
              };
            return newVehicles;
          });
        } catch (err) {
          Sentry.captureException(err);
          console.log(err);
        }
      }}
      disableAdd={({ registrationNumber }) => !registrationNumber}
      onRowAdd={async ({ registrationNumber, alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            CREATE_VEHICLE_MUTATION,
            {
              registrationNumber,
              alias,
              companyId
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.setVehicles(oldVehicles => [
            {
              ...apiResponse.data.vehicles.createVehicle,
              companyId: companyId
            },
            ...oldVehicles
          ]);
        } catch (err) {
          Sentry.captureException(err);
          console.log(err);
        }
      }}
      onRowDelete={(vehicle, callback) =>
        modals.open("confirmation", {
          textButtons: true,
          title: "Confirmer suppression",
          handleConfirm: async () => {
            try {
              await api.graphQlMutate(
                TERMINATE_VEHICLE_MUTATION,
                {
                  id: vehicle.id
                },
                { context: { nonPublicApi: true } }
              );
              adminStore.setVehicles(oldVehicles =>
                oldVehicles.filter(v => v.id !== vehicle.id)
              );
              callback();
            } catch (err) {
              Sentry.captureException(err);
              console.log(err);
            }
          }
        })
      }
      addButtonLabel="Ajouter un véhicule"
    />
  );
}

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
  const [companyId, setCompanyId] = React.useState(0);

  const adminStore = useAdminStore();

  const companies = adminStore.companies;

  React.useEffect(() => {
    if (companies && companies.length > 0) {
      let defaultCompany = companies.find(c => c.isPrimary);
      if (!defaultCompany) defaultCompany = companies[0];
      setCompanyId(defaultCompany.id);
    } else setCompanyId(0);
  }, [companies]);

  const classes = useStyles({ width });
  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);
  return [
    <Paper
      className={`${classes.navigation} flex-row-center`}
      variant="outlined"
      key={1}
    >
      <LinkButton
        className={classes.createCompanyButton}
        size="small"
        variant="contained"
        color="primary"
        href="/signup/company"
      >
        Inscrire une nouvelle entreprise
      </LinkButton>
      <Grid
        container
        spacing={10}
        justify="center"
        alignItems="center"
        style={{ flex: "1 1 auto", width: "unset" }}
      >
        {companies && companies.length > 1 && (
          <Grid item>
            <TextField
              id="select-company-id"
              select
              label="Entreprise"
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
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
          <SubNavigationToggle view={view} setView={setView} />
        </Grid>
      </Grid>
    </Paper>,
    <Paper className={classes.subPanel} variant="outlined" key={2}>
      {companyId ? subPanel.component({ companyId, containerRef }) : null}
    </Paper>
  ];
}

export const CompanyPanel = withWidth()(_CompanyPanel);
