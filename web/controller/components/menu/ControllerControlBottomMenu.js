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
import { useEmploymentData } from "../../hooks/useEmploymentData";
import ControlSendEmailModal from "../modals/ControlSendEmailModal";
import ControlSendEmailNoLicModal from "../modals/ControlSendEmailNoLicModal";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

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
  controlId,
  controlTime,
  companyName,
  companySiren,
  employments,
  controlData,
  isNoLicContext = false
}) {
  const classes = useStyles();
  const [includePdf] = React.useState(true);
  const [openSendNoLicModal, setOpenSendNoLicModal] = React.useState(false);

  const { displayCompanyName, adminEmails } = useEmploymentData(
    employments,
    companySiren,
    companyName
  );

  const {
    handDelivered,
    openSendModal,
    sendToDriver,
    sendToAdmin,
    isLoading,
    setOpenSendModal,
    setSendToDriver,
    setSendToAdmin,
    handleHandDeliveredChange,
    handleSend
  } = useControlBulletinActions({
    controlId,
    controlData,
    adminEmails,
    displayCompanyName,
    controlTime,
    includePdf
  });

  const handleSendNoLic = React.useCallback(
    async emailAddress => {
      setSendToAdmin(true);
      await handleSend([emailAddress], controlData.companyName);
      setOpenSendNoLicModal(false);
    },
    [handleSend, setSendToAdmin]
  );

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
          priority="tertiary"
          size="small"
          onClick={e => {
            e.preventDefault();
            editBDC();
          }}
        >
          Modifier
        </Button>
      </TitleContainer>

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
            <Description noMargin>edité le {controlTime}</Description>
          </Box>
        </Box>
        <Box
          display="flex"
          className={classes.checkboxAndBadge}
          flexDirection="column"
          gap={2}
        >
          {(controlData?.sendToAdmin || sendToAdmin) && (
            <Badge severity="info" noIcon className={classes.badge}>
              <i
                className={classNames(
                  "fr-icon-success-line",
                  classes.badgeIcon
                )}
              ></i>
              Envoyé par e-mail à l'entreprise responsable
            </Badge>
          )}

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
          >
            Télécharger
          </Button>
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
          >
            Envoyer
          </Button>
        </Box>
      </Stack>

      {isNoLicContext ? (
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
          sendToDriver={sendToDriver}
          setSendToDriver={setSendToDriver}
          sendToAdmin={sendToAdmin}
          setSendToAdmin={setSendToAdmin}
          displayCompanyName={displayCompanyName}
          handleSend={handleSend}
          isLoading={isLoading}
          adminEmails={adminEmails}
        />
      )}
    </Stack>
  );
}
