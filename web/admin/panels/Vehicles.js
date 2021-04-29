import React from "react";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { AugmentedTable } from "../components/AugmentedTable";
import {
  CREATE_VEHICLE_MUTATION,
  EDIT_VEHICLE_MUTATION,
  TERMINATE_VEHICLE_MUTATION
} from "common/utils/apiQueries";
import * as Sentry from "@sentry/browser";
import { formatApiError } from "common/utils/errors";
import { usePanelStyles } from "./Company";

export default function VehicleAdmin({ company }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const companyId = company ? company.id : null;

  const [triggerAddVehicle, setTriggerAddVehicle] = React.useState({
    value: false
  });

  const classes = usePanelStyles();

  const vehicleColumns = [
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

  return [
    <Box key={3} className={classes.title}>
      <Typography variant="h4">Véhicules ({vehicles.length})</Typography>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => setTriggerAddVehicle({ value: true })}
      >
        Ajouter un véhicule
      </Button>
    </Box>,
    <Typography key={4} className={classes.explanation}>
      Les véhicules que vous ajoutez ici seront proposés aux salariés lorsqu'ils
      renseigneront les informations d'une mission dans leur outil mobile.
    </Typography>,
    <AugmentedTable
      key={5}
      columns={vehicleColumns}
      entries={vehicles}
      triggerRowAdd={triggerAddVehicle}
      afterRowAdd={() => setTriggerAddVehicle({ value: false })}
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
          alerts.error(formatApiError(err), "vehicleAlreadyRegistered", 6000);
        }
      }}
      onRowDelete={vehicle =>
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
            } catch (err) {
              Sentry.captureException(err);
              console.log(err);
            }
          }
        })
      }
    />
  ];
}
