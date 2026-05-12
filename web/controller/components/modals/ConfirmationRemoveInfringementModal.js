import React from "react";
import ConfirmationDSFR from "./ConfirmationDSFR";

export default function ConfirmationRemoveInfringementModal(props) {
  return (
    <ConfirmationDSFR
      title="Suppression de l'infraction"
      content="Votre sélection sera perdue."
      confirmButtonLabel="Confirmer"
      cancelButtonLabel="Annuler"
      {...props}
    ></ConfirmationDSFR>
  );
}