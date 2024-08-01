import React from "react";
import { Typography } from "@mui/material";
import { Button, Link } from "@dataesr/react-dsfr";
import Modal, { modalStyles } from "../../common/Modal";
import { prettyFormatDay } from "common/utils/time";
import { useIsAdmin } from "../../common/hooks/useIsAdmin";

export default function RejectedCguModal({ expiryDate, onRevert }) {
  const { isAdmin } = useIsAdmin();
  const classes = modalStyles();
  return (
    <Modal
      open={true}
      handleClose={null}
      size="sm"
      zIndex={3500}
      content={
        <>
          <Typography>
            Attention,{" "}
            <span className={classes.warningText}>
              <b>
                votre compte sera supprimé le{" "}
                {prettyFormatDay(expiryDate, true)}
              </b>
            </span>{" "}
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
            générales d’utilisation en{" "}
            <button
              className={`fr-link fr-link--md ${classes.underlined}`}
              title="cliquant ici pour accepter les CGU"
              onClick={onRevert}
            >
              cliquant ici
            </button>
            .
          </Typography>
        </>
      }
      actions={
        <>
          <Button
            onClick={() => {}}
            icon="fr-icon-download-line"
            iconPosition="left"
          >
            Télécharger l'ensemble des données
          </Button>
          <Link href="/logout" className="fr-btn fr-btn--secondary">
            Se déconnecter
          </Link>
        </>
      }
    />
  );
}
