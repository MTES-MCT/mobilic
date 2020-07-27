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

const useStyles = makeStyles(theme => ({
  navigation: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    position: "sticky",
    top: "0",
    zIndex: 500
  },
  subPanel: {
    padding: theme.spacing(2)
  }
}));

function VehicleAdmin() {
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
  const vehicles = adminStore.vehicles;
  return (
    <AugmentedTable
      columns={columns}
      entries={vehicles}
      editable={true}
      onRowEdit={async (vehicle, { alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(EDIT_VEHICLE_MUTATION, {
            id: vehicle.id,
            alias
          });
          adminStore.setVehicles(oldVehicles => {
            const newVehicles = [...oldVehicles];
            const vehicleIndex = oldVehicles.findIndex(
              v => v.id === vehicle.id
            );
            if (vehicleIndex >= 0)
              newVehicles[vehicleIndex] = apiResponse.data.admin.editVehicle;
            return newVehicles;
          });
        } catch (err) {
          console.log(err);
        }
      }}
      onRowAdd={async ({ registrationNumber, alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(CREATE_VEHICLE_MUTATION, {
            registrationNumber,
            alias,
            companyId: adminStore.companyId
          });
          adminStore.setVehicles(oldVehicles => [
            apiResponse.data.admin.createVehicle,
            ...oldVehicles
          ]);
        } catch (err) {
          console.log(err);
        }
      }}
      onRowDelete={(vehicle, callback) =>
        modals.open("confirmation", {
          title: "Confirmer suppression",
          handleConfirm: async () => {
            try {
              await api.graphQlMutate(TERMINATE_VEHICLE_MUTATION, {
                id: vehicle.id
              });
              adminStore.setVehicles(oldVehicles =>
                oldVehicles.filter(v => v.id !== vehicle.id)
              );
              callback();
            } catch (err) {
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
    component: <Employees />
  },
  {
    label: "Véhicules",
    view: "vehicles",
    component: <VehicleAdmin />
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
  const [view, setView] = React.useState("employees");

  const classes = useStyles();
  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);
  return [
    <Paper
      className={`${classes.navigation} flex-row-center`}
      variant="outlined"
      key={0}
    >
      <SubNavigationToggle view={view} setView={setView} />
    </Paper>,
    <Paper className={classes.subPanel} variant="outlined" key={1}>
      {subPanel.component}
    </Paper>
  ];
}
