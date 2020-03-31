import React from "react";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  useApi,
  VEHICLE_CREATE_MUTATION,
  VEHICLE_EDIT_MUTATION
} from "../../common/utils/api";
import { useAdminStore } from "../utils/store";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import { AugmentedTable } from "../components/AugmentedTable";

const useStyles = makeStyles(theme => ({
  exportButton: {
    marginLeft: theme.spacing(4)
  },
  filters: {
    marginBottom: theme.spacing(2)
  },
  tableTitle: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2)
  }
}));

function VehicleAdmin() {
  const api = useApi();
  const adminStore = useAdminStore();
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
  const vehicles = adminStore.vehicles;
  return (
    <AugmentedTable
      columns={columns}
      entries={vehicles}
      editable={true}
      onRowEdit={async (vehicle, { alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(VEHICLE_EDIT_MUTATION, {
            id: vehicle.id,
            alias
          });
          adminStore.setVehicles(oldVehicles => {
            const newVehicles = [...oldVehicles];
            const vehicleIndex = oldVehicles.findIndex(
              v => v.id === vehicle.id
            );
            if (vehicleIndex >= 0)
              newVehicles[vehicleIndex] = apiResponse.data.editVehicle.vehicle;
            return newVehicles;
          });
        } catch (err) {
          console.log(err);
        }
      }}
      onRowAdd={async ({ registrationNumber, alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(VEHICLE_CREATE_MUTATION, {
            registrationNumber,
            alias,
            companyId: adminStore.companyId
          });
          adminStore.setVehicles(oldVehicles => [
            apiResponse.data.createVehicle.vehicle,
            ...oldVehicles
          ]);
        } catch (err) {
          console.log(err);
        }
      }}
      addButtonLabel="Ajouter un véhicule"
    />
  );
}

const COMPANY_SUB_PANELS = [
  {
    label: "Véhicules",
    view: "vehicles",
    component: <VehicleAdmin />
  },
  {
    label: "Employés",
    view: "employees",
    component: null
  }
];

function SubNavigationToggle({ view, setView }) {
  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={(e, newView) => setView(newView)}
    >
      {COMPANY_SUB_PANELS.map(panelInfos => (
        <ToggleButton key={panelInfos.view} value={panelInfos.view}>
          {panelInfos.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function CompanyPanel() {
  const [view, setView] = React.useState("vehicles");

  const classes = useStyles();
  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);
  return [
    <Paper className={classes.filters} variant="outlined" key={0}>
      <Box p={2} className="flex-row-center">
        <SubNavigationToggle view={view} setView={setView} />
      </Box>
    </Paper>,
    <Paper variant="outlined" key={1}>
      <Box p={2}>{subPanel.component}</Box>
    </Paper>
  ];
}
