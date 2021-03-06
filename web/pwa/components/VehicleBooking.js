import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { VehicleInput } from "./VehicleInput";
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
          <Typography>
            ⚠️ Le nouveau véhicule remplacera l'ancien sur toute la période de
            la mission.
          </Typography>
        </Box>
        <VehicleInput
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
