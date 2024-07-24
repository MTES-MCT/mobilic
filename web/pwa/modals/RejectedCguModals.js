import React from "react";
import { Typography } from "@mui/material";
import { Button } from "@dataesr/react-dsfr";
import Modal, { modalStyles } from "../../common/Modal";
import { prettyFormatDay } from "common/utils/time";
import { useIsAdmin } from "../../common/hooks/useIsAdmin";

export default function RejectedCguModal({ refusalDate }) {
  const classes = modalStyles();
  const { isAdmin } = useIsAdmin();
  return (
    <Modal
      open={true}
      handleClose={null}
      size="sm"
      zIndex={3500}
      title={
        <>
          <span
            className={`fr-icon-warning-fill ${classes.warningIcon}`}
            aria-hidden="true"
          ></span>
          Votre compte va être supprimé
        </>
      }
      content={
        <>
          <Typography>
            Attention,{" "}
            <b>votre compte sera supprimé le {prettyFormatDay(refusalDate)}</b>{" "}
            car vous avez refusé nos conditions générales d’utilisation.{" "}
            {isAdmin ? (
              <>
                Pour rappel, vous avez pour obligation de conserver les temps de
                travail de vos salariés pendant 5 ans.
                <b>Veuillez les télécharger</b> avant la suppression du compte.
              </>
            ) : (
              <>
                <b>Veillez à télécharger l'ensemble de vos données</b> avant la
                suppression du compte, car cela pourrait vous être utile en cas
                de différend avec votre employeur.
              </>
            )}
          </Typography>
          <Typography sx={{ marginTop: 1 }}>
            S’il s’agit d’une erreur, vous pouvez accepter nos conditions
            générales d’utilisation en cliquant ici.
          </Typography>
        </>
      }
      actions={
        <Button
          onClick={() => {}}
          icon="fr-icon-download-line"
          iconPosition="left"
        >
          Télécharger l'ensemble des données
        </Button>
      }
    />
  );
}
