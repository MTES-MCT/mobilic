import React from "react";
import Grid from "@mui/material/Grid";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";

export function AccordionActions({ open, onDelete }) {
  return (
    <>
      <Grid item>
        {open ? (
          <div
            className="fr-icon-arrow-up-s-line fr-icon--sm"
            style={{ color: fr.colors.decisions.text.actionHigh.blueFrance.default }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="fr-icon-arrow-down-s-line fr-icon--sm"
            style={{ color: fr.colors.decisions.text.actionHigh.blueFrance.default }}
            aria-hidden="true"
          />
        )}
      </Grid>
      {onDelete && (
        <Grid item>
          <Button
            size="small"
            iconId="fr-icon-delete-line"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            priority="tertiary no outline"
            title="Supprimer l'infraction"
            aria-label="Supprimer l'infraction"
          />
        </Grid>
      )}
    </>
  );
}
