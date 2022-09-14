import React from "react";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { AugmentedTable } from "../components/AugmentedTable";
import {
  CREATE_VEHICLE_MUTATION,
  EDIT_VEHICLE_MUTATION,
  TERMINATE_VEHICLE_MUTATION
} from "common/utils/apiQueries";

import { formatApiError } from "common/utils/errors";
import { usePanelStyles } from "./Company";
import { captureSentryException } from "common/utils/sentry";
import { ADMIN_ACTIONS } from "../store/reducers/root";

export default function VehicleAdmin({ company }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const companyId = company ? company.id : null;

  const tableRef = React.useRef();

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
        onClick={() => tableRef.current.newRow()}
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
      ref={tableRef}
      className={classes.vehiclesTable}
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
          adminStore.dispatch({
            type: ADMIN_ACTIONS.update,
            payload: {
              id: vehicle.id,
              entity: "vehicles",
              update: apiResponse.data.vehicles.editVehicle
            }
          });
        } catch (err) {
          captureSentryException(err);
        }
      }}
      validateRow={({ registrationNumber }) => !!registrationNumber}
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
          adminStore.dispatch({
            type: ADMIN_ACTIONS.create,
            payload: {
              entity: "vehicles",
              items: [
                {
                  ...apiResponse.data.vehicles.createVehicle,
                  companyId
                }
              ]
            }
          });
        } catch (err) {
          captureSentryException(err);
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
              adminStore.dispatch({
                type: ADMIN_ACTIONS.delete,
                payload: { id: vehicle.id, entity: "vehicles" }
              });
            } catch (err) {
              captureSentryException(err);
            }
          }
        })
      }
    />
  ];
}
