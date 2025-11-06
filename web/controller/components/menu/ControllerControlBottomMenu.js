import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Description } from "../../../common/typography/Description";
import { TitleContainer } from "../../../control/components/TitleContainer";
import classNames from "classnames";
import { useControlBulletinActions } from "../../hooks/useControlBulletinActions";
import { useControl } from "../../utils/contextControl";
import ControlSendEmailModal from "../modals/ControlSendEmailModal";
import ControlSendEmailNoLicModal from "../modals/ControlSendEmailNoLicModal";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { now, HOUR, formatDateTime } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: "4px",
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default,
    padding: "12px"
  },
  button: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      justifyContent: "center"
    }
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
  },
  badge: {
    fontSize: "0.60rem",
    fontWeight: 500,
    borderRadius: "1rem",
    padding: "0.20rem 0.5rem"
  },
  badgeIcon: {
    marginRight: cx("0.25rem", "!important"),
    "&::before": {
      "--icon-size": "1rem !important"
    }
  },
  checkboxAndBadge: {
    marginLeft: "5px !important"
  }
}));

export function ControllerControlBottomMenu({
  editBDC,
  downloadBDC,
  isNoLicContext = false
}) {
  const {
    canDownloadBDC,
    bdcAlreadyExists,
    controlId,
    controlData,
    setControlData
  } = useControl();

  const classes = useStyles();
  const [openSendNoLicModal, setOpenSendNoLicModal] = React.useState(false);

  const sentToAdmin = controlData?.sentToAdmin;

  const isBulletinAvailableForDriver = React.useMemo(() => {
    if (!controlData?.controlBulletinUpdateTime) {
      return false;
    }
    return controlData.controlBulletinUpdateTime <= now() - HOUR;
  }, [controlData?.controlBulletinUpdateTime]);

  const {
    handDelivered,
    openSendModal,
    isLoading,
    setOpenSendModal,
    handleHandDeliveredChange,
    handleSend
  } = useControlBulletinActions({
    controlId,
    controlData,
    onControlDataUpdate: setControlData
  });

  const handleSendNoLic = React.useCallback(
    async emailAddress => {
      const success = await handleSend([emailAddress]);
      if (success) {
        if (setControlData) {
          setControlData(prev => ({ ...prev, sentToAdmin: true }));
        }
        setOpenSendNoLicModal(false);
      }
    },
    [handleSend, setControlData]
  );

  const bulletinExists = bdcAlreadyExists || canDownloadBDC;
  return (
    <Stack
      direction="column"
      p={3}
      rowGap={3}
      maxWidth="100%"
      sx={{
        maxWidth: { xs: "100%", md: "70%" }
      }}
    >
      <TitleContainer>
        <Typography variant="h5" component="h2">
          Bulletin de contrôle
        </Typography>
        <Button
          priority={bulletinExists ? "tertiary" : "primary"}
          size="small"
          onClick={e => {
            e.preventDefault();
            editBDC();
          }}
          iconId={!bulletinExists ? "fr-icon-add-line" : ""}
        >
          {bulletinExists ? "Modifier" : "Créer"}
        </Button>
      </TitleContainer>

      {bulletinExists ? (
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
              className={classNames("fr-icon-file-text-fill", classes.fileIcon)}
              aria-hidden="true"
            />

            <Box display="flex" flexDirection="column">
              <Typography variant="h6">Bulletin {controlId}</Typography>
              <Description noMargin>
                modifié le{" "}
                {formatDateTime(controlData.controlBulletinUpdateTime, true)}{" "}
              </Description>
            </Box>
          </Box>
          <Box
            display="flex"
            className={classes.checkboxAndBadge}
            flexDirection="column"
            gap={2}
          >
            <Checkbox
              size="small"
              options={[
                {
                  label: "Remis au format papier",
                  nativeInputProps: {
                    checked: handDelivered,
                    onChange: handleHandDeliveredChange
                  }
                }
              ]}
            />

            {isBulletinAvailableForDriver && (
              <Badge severity="info" noIcon className={classes.badge}>
                <i
                  className={classNames(
                    "fr-icon-success-line",
                    classes.badgeIcon
                  )}
                ></i>
                Remis au format numérique
              </Badge>
            )}

            {sentToAdmin && (
              <Badge severity="info" noIcon className={classes.badge}>
                <i
                  className={classNames(
                    "fr-icon-success-line",
                    classes.badgeIcon
                  )}
                ></i>
                Envoyé par e-mail à l'entreprise
              </Badge>
            )}
          </Box>
          <Box display="flex" gap={2} justifyContent={"space-between"}>
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
              disabled={!canDownloadBDC}
            >
              Télécharger
            </Button>
            {!sentToAdmin && (
              <Button
                priority="primary"
                size="medium"
                onClick={e => {
                  e.preventDefault();
                  if (isNoLicContext) {
                    setOpenSendNoLicModal(true);
                  } else {
                    setOpenSendModal(true);
                  }
                }}
                iconId="fr-icon-send-plane-line"
                iconPosition="left"
                className={classes.button}
                disabled={!canDownloadBDC}
              >
                Envoyer
              </Button>
            )}
          </Box>
        </Stack>
      ) : (
        <Description>
          Éditez un bulletin de contrôle pour le télécharger au format PDF et le
          retrouver plus tard dans votre historique des contrôles.
        </Description>
      )}

      {bulletinExists &&
        (isNoLicContext ? (
          <ControlSendEmailNoLicModal
            open={openSendNoLicModal}
            handleClose={() => setOpenSendNoLicModal(false)}
            handleSend={handleSendNoLic}
            isLoading={isLoading}
          />
        ) : (
          <ControlSendEmailModal
            open={openSendModal}
            handleClose={() => setOpenSendModal(false)}
            handleSend={async shouldSendToAdmin => {
              if (shouldSendToAdmin) {
                const success = await handleSend();
                if (success) {
                  if (setControlData) {
                    setControlData(prev => ({ ...prev, sentToAdmin: true }));
                  }
                  setOpenSendModal(false);
                }
              } else {
                setOpenSendModal(false);
              }
            }}
            isLoading={isLoading}
          />
        ))}
    </Stack>
  );
}
