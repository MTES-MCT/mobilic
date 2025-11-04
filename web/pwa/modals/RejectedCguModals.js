import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Modal, { modalStyles } from "../../common/Modal";
import { prettyFormatDay } from "common/utils/time";
import { useIsAdmin } from "../../common/hooks/useIsAdmin";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { CircularProgress, Link, Stack } from "@mui/material";
import { useExportsContext } from "../../admin/utils/contextExports";

export default function RejectedCguModal({ expiryDate, onRevert, userId }) {
  const { isAdmin } = useIsAdmin();
  const classes = modalStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const [isEnabledDownload, setIsEnabledDownload] = React.useState(true);
  const { updateExports, nbExports } = useExportsContext()

  useEffect(() => updateExports(), [userId])

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
        "Votre demande a été prise en compte. Le fichier sera prêt d'ici quelques minutes.",
        null,
        9000
      );
      updateExports()
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
        <Stack direction="column" rowGap={2}>
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
          <Typography>
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
          {!!nbExports && <Stack direction="row" columnGap={1} alignItems="center">
            <CircularProgress color="inherit" size="1rem" />
            <div>Export des données en cours de préparation...</div>
          </Stack>}
        </Stack>
      }
      actions={
        <>
          <Link href="/logout" className="fr-btn fr-btn--secondary">
            Se&nbsp;déconnecter
          </Link>
          <Button
            onClick={downloadUserData}
            iconPosition="left"
            iconId="fr-icon-download-line"
            disabled={!isEnabledDownload}
          >
            Télécharger l'ensemble des données
          </Button>
        </>
      }
    />
  );
}
