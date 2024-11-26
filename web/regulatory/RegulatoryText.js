import React from "react";
import Notice from "../common/Notice";
import { Description } from "../common/typography/Description";

export function RegulatoryTextDayBeforeAndAfter() {
  return (
    <Description sx={{ marginY: 1 }}>
      Les seuils affichés prennent en compte le temps de travail du jour suivant
      et du jour précédent.
    </Description>
  );
}

export function RegulatoryTextWeekBeforeAndAfter() {
  return (
    <Description sx={{ marginY: 1 }}>
      Les seuils hebdomadaires prennent en compte le temps de travail de la
      semaine complète.
    </Description>
  );
}

export function RegulatoryTextNotCalculatedYet() {
  return (
    <Notice
      description="Les seuils réglementaires ne sont pas encore calculés. Ils apparaîtront
        suite à la validation du salarié."
    />
  );
}
