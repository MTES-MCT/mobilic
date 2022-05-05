import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { VehicleFieldForApp } from "./VehicleFieldForApp";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { LoadingButton } from "common/components/LoadingButton";

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
    <Dialog onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle
        title={`Corriger le véhicule`}
        handleClose={handleClose}
      />
      <DialogContent>
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
      </DialogContent>
      <CustomDialogActions>
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
      </CustomDialogActions>
    </Dialog>
  );
}
