import React from "react";
import Typography from "@mui/material/Typography";
import { Button, Link } from "@dataesr/react-dsfr";
import Modal, { modalStyles } from "../../common/Modal";
import { prettyFormatDay } from "common/utils/time";
import { useIsAdmin } from "../../common/hooks/useIsAdmin";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";

export default function RejectedCguModal({ expiryDate, onRevert, userId }) {
  const { isAdmin } = useIsAdmin();
  const classes = modalStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const [isEnabledDownload, setIsEnabledDownload] = React.useState(true);

  const downloadUserData = async () => {
    setIsEnabledDownload(false);
    trackLink({
      href: `/users/download_full_data_when_CGU_refused`,
      linkType: "download"
    });

    try {
      await api.jsonHttpQuery(HTTP_QUERIES.downloadFullDataWhenCGUrefused, {
        json: { user_id: userId }
      });
      alerts.success(
        "Votre demande a été prise en compte. Le fichier sera envoyé par email d'ici quelques minutes.",
        null,
        9000
      );
    } catch (err) {
      alerts.error(
        formatApiError(err),
        "download_full_data_when_CGU_refused",
        6000
      );
    }
  };

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
            onClick={downloadUserData}
            icon="fr-icon-download-line"
            iconPosition="left"
            disabled={!isEnabledDownload}
          >
            Recevoir les données par&nbsp;e&#8209;mail
          </Button>
          <Link href="/logout" className="fr-btn fr-btn--secondary">
            Se&nbsp;déconnecter
          </Link>
        </>
      }
    />
  );
}
