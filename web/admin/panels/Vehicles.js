import React from "react";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { AugmentedTable } from "../components/AugmentedTable";
import { usePanelStyles } from "./Company";
import { captureSentryException } from "common/utils/sentry";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { Button } from "@codegouvfr/react-dsfr/Button";
import {
  CREATE_VEHICLE_MUTATION,
  EDIT_VEHICLE_MUTATION,
  TERMINATE_VEHICLE_MUTATION,
} from "common/utils/apiQueries/admin";
import BatchInviteModal from "../modals/BatchInviteModal";
import { BATCH_ADD_VEHICLES_SUBMIT } from "common/utils/matomoTags";

const useStyles = makeStyles(() => ({
  augmentedTable: {
    "& table.MuiTable-root": {
      borderTop: "none !important",
      tableLayout: "fixed",
    },
    "& tr.MuiTableRow-head": {
      backgroundColor: "#EEEEEE !important",
      borderTop: "none !important",
      borderBottom: "2px solid #3A3A3A !important",
      "& th": {
        textTransform: "none",
        borderBottom: "none",
        background: "transparent !important",
      },
    },
    "& tr.MuiTableRow-root:not(.MuiTableRow-head)": {
      borderBottom: "1px solid #CECECE",
    },
    "& .MuiIconButton-root": {
      width: 32,
      height: 32,
      border: "1px solid #000091",
      borderRadius: 0,
      padding: 8,
      "& + .MuiIconButton-root": {
        marginLeft: "16px !important",
      },
      color: "#000091 !important",
      "& .MuiSvgIcon-root": {
        fontSize: 16,
        color: "inherit !important",
      },
    },
  },
}));

function isValidRegistrationNumber(value) {
  return /^(?=.*\d)(?=.*[A-Z])[A-Z0-9-]{4,}$/i.test(value);
}

function normalizeRegistrationNumber(token) {
  return { type: "vehicle", value: token.toUpperCase() };
}

export default function VehicleAdmin({ company }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const companyId = company ? company.id : null;

  const [batchModalOpen, setBatchModalOpen] = React.useState(false);

  const classes = usePanelStyles();
  const tableClasses = useStyles();

  const vehicleColumns = [
    {
      label: "Immatriculation",
      name: "registrationNumber",
      sortable: true,
      format: (registrationNumber) => registrationNumber?.toUpperCase(),
    },
    {
      label: "Nom usuel",
      name: "alias",
      edit: true,
      sortable: true,
    },
  ];
  const vehicles = adminStore.vehicles.filter((v) => v.companyId === companyId);

  const handleBatchAddVehicles = async ({ entries }) => {
    let successCount = 0;
    const failedEntries = [];

    for (const registrationNumber of entries) {
      try {
        const apiResponse = await api.graphQlMutate(
          CREATE_VEHICLE_MUTATION,
          {
            registrationNumber,
            alias: null,
            companyId,
          },
          { context: { nonPublicApi: true } },
        );
        adminStore.dispatch({
          type: ADMIN_ACTIONS.create,
          payload: {
            entity: "vehicles",
            items: [
              {
                ...apiResponse.data.vehicles.createVehicle,
                companyId,
              },
            ],
          },
        });
        successCount++;
      } catch (err) {
        captureSentryException(err);
        failedEntries.push(registrationNumber);
      }
    }

    if (failedEntries.length === 0) {
      alerts.success("Véhicule(s) ajouté(s)", "batch-vehicle-success", 6000);
    } else if (successCount > 0) {
      alerts.warning(
        `${successCount} véhicule(s) ajouté(s), ${failedEntries.length} en erreur (doublon ou format invalide).`,
        "batch-vehicle-warning",
        6000,
      );
    } else {
      alerts.error(
        "Aucun véhicule n'a pu être ajouté. Vérifiez les immatriculations saisies.",
        "batch-vehicle-error",
        6000,
      );
    }

    return { failedEntries };
  };

  return (
    <>
      <Box className={classes.title}>
        <Typography variant="h4" component="h2">
          Véhicules ({vehicles.length})
        </Typography>
        <Button size="small" onClick={() => setBatchModalOpen(true)}>
          Ajouter vos véhicules
        </Button>
      </Box>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Les véhicules que vous ajoutez ici seront proposés aux salariés
        lorsqu'ils renseigneront les informations d'une mission dans leur outil
        mobile.
      </Typography>
      <Box sx={{ marginRight: 10 }}>
        <AugmentedTable
          columns={vehicleColumns}
          entries={vehicles}
          className={tableClasses.augmentedTable}
          onRowEdit={async (vehicle, { alias }) => {
            try {
              const apiResponse = await api.graphQlMutate(
                EDIT_VEHICLE_MUTATION,
                {
                  id: vehicle.id,
                  alias,
                },
                { context: { nonPublicApi: true } },
              );
              adminStore.dispatch({
                type: ADMIN_ACTIONS.update,
                payload: {
                  id: vehicle.id,
                  entity: "vehicles",
                  update: apiResponse.data.vehicles.editVehicle,
                },
              });
            } catch (err) {
              captureSentryException(err);
            }
          }}
          defaultSortBy="registrationNumber"
          onRowDelete={(vehicle) =>
            modals.open("confirmation", {
              textButtons: true,
              title: "Confirmer suppression",
              handleConfirm: async () => {
                try {
                  await api.graphQlMutate(
                    TERMINATE_VEHICLE_MUTATION,
                    {
                      id: vehicle.id,
                    },
                    { context: { nonPublicApi: true } },
                  );
                  adminStore.dispatch({
                    type: ADMIN_ACTIONS.delete,
                    payload: { id: vehicle.id, entity: "vehicles" },
                  });
                } catch (err) {
                  captureSentryException(err);
                }
              },
            })
          }
        />
      </Box>
      <BatchInviteModal
        open={batchModalOpen}
        handleClose={() => setBatchModalOpen(false)}
        handleSubmit={handleBatchAddVehicles}
        title="Ajouter des véhicules"
        description={
          <p>
            Ajoutez plusieurs véhicules en une fois en renseignant leur
            immatriculation ou en copiant une liste dans l'encadré ci-dessous.
          </p>
        }
        inputLabel="Immatriculations"
        inputHintText="Saisissez les immatriculations au format AA-123-AA, et séparez-les par un espace, une virgule ou un point-virgule. Une immatriculation ne doit pas contenir d'espace."
        placeholder="BB-222-CC, CC-333-DD, DD-444-EE"
        acceptButtonTitle="Ajouter"
        validationFn={isValidRegistrationNumber}
        normalizeFn={normalizeRegistrationNumber}
        validationErrorMessage="Le format saisi n'est pas valide. Une immatriculation doit contenir au moins une lettre et un chiffre."
        trackingEventFn={BATCH_ADD_VEHICLES_SUBMIT}
      />
    </>
  );
}
