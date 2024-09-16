import React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

import { LoadingButton } from "common/components/LoadingButton";
import { VehicleFieldForApp } from "../components/VehicleFieldForApp";
import Modal from "../../common/Modal";

export default function UpdateVehicleModal({
  open,
  currentVehicle,
  company,
  handleClose,
  handleSubmit
}) {
  const [vehicle, setVehicle] = React.useState(null);

  React.useEffect(() => {
    setVehicle(currentVehicle);
  }, [open, currentVehicle]);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Corriger le véhicule"
      content={
        <>
          <Box my={2}>
            <Alert severity="warning">
              Le nouveau véhicule remplacera l'ancien sur toute la période de la
              mission.
            </Alert>
          </Box>
          <VehicleFieldForApp
            label="Nom ou immatriculation du véhicule"
            vehicle={vehicle}
            setVehicle={setVehicle}
            companyId={company ? company.id : null}
          />
        </>
      }
      actions={
        <LoadingButton
          color="primary"
          disabled={!vehicle}
          variant="contained"
          onClick={async () => {
            await handleSubmit(vehicle);
            handleClose();
          }}
        >
          OK
        </LoadingButton>
      }
    />
  );
}
