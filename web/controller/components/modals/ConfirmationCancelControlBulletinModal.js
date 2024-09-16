import React from "react";
import ConfirmationDSFR from "./ConfirmationDSFR";

export default function ConfirmationCancelControlBulletinModal(props) {
  return (
    <ConfirmationDSFR
      title="Vous avez des modifications non enregistrées"
      content="En annulant, vous perdrez les modifications effectuées."
      confirmButtonLabel="Enregistrer mes modifications"
      cancelButtonLabel="Annuler mes modifications"
      {...props}
    ></ConfirmationDSFR>
  );
}
