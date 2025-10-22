import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { textualPrettyFormatDayHour } from "../../../../common/utils/time";
import { useDownloadBDC } from "../../../controller/utils/useDownloadBDC";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import classNames from "classnames";
import { Description } from "../../../common/typography/Description";
import { ControllerControlBackButton } from "../../../controller/components/utils/ControllerControlBackButton";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: "4px",
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default,
    padding: "12px"
  },
  button: {
    justifyContent: "center",
    alignSelf: "center",
    width: "100%"
  },
  fileIcon: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&::before": {
      "--icon-size": "2rem !important"
    }
  }
}));

export default function UserControlDetail({ control, onClose }) {
  const downloadBDC = useDownloadBDC(control.id);
  const classes = useStyles();

  if (!control) {
    return (
      <Card m={2}>
        <CardContent>
          <Typography variant="h6">Contrôle non trouvé</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%">
      <Box p={2} borderBottom="1px solid #e0e0e0">
        {onClose && (
          <Box mb={2}>
            <ControllerControlBackButton onClick={onClose}>
              Fermer
            </ControllerControlBackButton>
          </Box>
        )}
        <Typography variant="h6">Détail du contrôle</Typography>
      </Box>

      <Box flex={1} sx={{ overflow: "auto" }}>
        <Stack direction="column" spacing={2} p={2}>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">Lieu</Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {control.controlBulletin?.locationLieu || "Non renseigné"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">Date</Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {textualPrettyFormatDayHour(control.creationTime, true)}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column">
            <Typography variant="body1">Infraction(s) constatée(s)</Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {control.nbReportedInfractions || 0}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column">
            <Typography variant="body1">Numéro contrôleur</Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {control.controllerUser?.grecoId
                ? control.controllerUser.grecoId
                : "Non renseigné"}
            </Typography>
          </Box>

          {control.controlBulletin && (
            <Stack
              direction="column"
              className={classes.card}
              spacing={3}
              sx={{
                maxWidth: { xs: "100%", md: "70%" }
              }}
            >
              <Box display="flex" gap={2}>
                <Box
                  component="span"
                  className={classNames(
                    "fr-icon-file-text-fill",
                    classes.fileIcon
                  )}
                  aria-hidden="true"
                />

                <Box display="flex" flexDirection="column">
                  <Typography variant="h6">Bulletin de contrôle</Typography>
                  <Description noMargin>Fichier PDF</Description>
                </Box>
              </Box>

              <Button
                priority="secondary"
                size="medium"
                onClick={e => {
                  e.preventDefault();
                  downloadBDC();
                }}
                iconId="fr-icon-download-line"
                iconPosition="left"
                className={classes.button}
              >
                Télécharger
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
