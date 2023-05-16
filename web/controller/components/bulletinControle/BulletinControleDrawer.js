import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlBulletinControleLIC } from "./ControllerControlBulletinControleLIC";
import Box from "@mui/material/Box";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function BulletinControleDrawer({
  isOpen,
  onClose,
  bulletinControle,
  onSavingBulletinControle,
  controlData
}) {
  const classes = useStyles();
  const [mustConfirmBeforeClosing, setMustConfirmBeforeClosing] = useState(
    false
  );
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const modals = useModals();

  const saveControlBulletin = async ({ newBulletinControle, onSuccess }) =>
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            controlId: controlData?.id,
            userFirstName: newBulletinControle.userFirstName,
            userLastName: newBulletinControle.userLastName,
            userBirthDate: newBulletinControle.userBirthDate,
            userNationality: newBulletinControle.userNationality,
            licPaperPresented: newBulletinControle.licPaperPresented,
            siren: newBulletinControle.siren,
            companyName: newBulletinControle.companyName,
            companyAddress: newBulletinControle.companyAddress,
            vehicleRegistrationNumber:
              newBulletinControle.vehicleRegistrationNumber,
            vehicleRegistrationCountry:
              newBulletinControle.vehicleRegistrationCountry,
            missionAddressBegin: newBulletinControle.missionAddressBegin,
            missionAddressEnd: newBulletinControle.missionAddressEnd,
            transportType: newBulletinControle.transportType,
            articlesNature: newBulletinControle.articlesNature,
            licenseNumber: newBulletinControle.licenseNumber,
            licenseCopyNumber: newBulletinControle.licenseCopyNumber,
            observation: newBulletinControle.observation
          },
          { context: { nonPublicApi: true } }
        );
        controlData.controlBulletin =
          apiResponse.data.controllerSaveControlBulletin.controlBulletin;
        alerts.success("Le bulletin de contrôle a été enregistré.", "", 3000);
        if (onSuccess) {
          onSuccess();
        }
        setMustConfirmBeforeClosing(false);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });

  const closeDrawer = (forceClose = false) => {
    if (!forceClose && mustConfirmBeforeClosing) {
      modals.open("confirmationCancelControlBulletinModal", {
        confirmButtonLabel: "Revenir à mes modifications",
        handleCancel: () => {
          onClose();
        },
        handleConfirm: () => {}
      });
    } else {
      onClose();
    }
  };

  return [
    <SwipeableDrawer
      key={0}
      anchor="right"
      open={isOpen}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={() => closeDrawer()}
      PaperProps={{
        className: classes.missionDrawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
    >
      <Box m={2}>
        <ControllerControlBulletinControleLIC
          bulletinControle={bulletinControle}
          onSavingBulletinControle={onSavingBulletinControle}
          onClose={closeDrawer}
          controlData={controlData}
          setMustConfirmBeforeClosing={setMustConfirmBeforeClosing}
          saveControlBulletin={saveControlBulletin}
        />
      </Box>
    </SwipeableDrawer>
  ];
}
