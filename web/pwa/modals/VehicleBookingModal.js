import React from "react";
import Notice from "../../common/Notice";

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
          <Notice
            sx={{ marginY: 2 }}
            type="warning"
            description="Le nouveau véhicule remplacera l'ancien sur toute la période de la
              mission."
          />
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
