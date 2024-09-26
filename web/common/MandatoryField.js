import React from "react";
import { MandatorySuffix } from "./forms/MandatorySuffix";

export const MandatoryField = () => {
  return (
    <p className="fr-hint-text">
      <MandatorySuffix /> Informations obligatoires
    </p>
  );
};
