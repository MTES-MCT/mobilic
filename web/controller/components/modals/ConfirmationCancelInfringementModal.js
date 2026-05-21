import React from "react";
import ConfirmationDSFR from "./ConfirmationDSFR";

export default function ConfirmationCancelInfringementModal(props) {
  return (
    <ConfirmationDSFR
      title="Confirmation d'annulation"
      content="En fermant sans confirmer, votre sélection d'infractions sera perdue."
      confirmButtonLabel="Retour à la sélection"
      cancelButtonLabel="Abandonner"
      {...props}
    ></ConfirmationDSFR>
  );
}
