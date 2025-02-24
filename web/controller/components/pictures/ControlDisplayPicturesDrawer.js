import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React from "react";
import { makeStyles } from "@mui/styles";
import { ControlBulletinHeader } from "../controlBulletin/ControlBulletinHeader";
import Notice from "../../../common/Notice";
import { useControl } from "../../utils/contextControl";
import { Stack } from "@mui/material";
import { useInfractions } from "../../utils/contextInfractions";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  buttonGroup: {
    paddingLeft: theme.spacing(2),
    width: "100%"
  }
}));

export function ControlDisplayPicturesDrawer({ isOpen, onClose }) {
  const classes = useStyles();
  const { controlData } = useControl();
  const { setIsReportingInfractions } = useInfractions();

  const reportInfractions = () => {
    if (onClose) {
      onClose();
    }
    setIsReportingInfractions(true);
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={isOpen}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={onClose}
      PaperProps={{
        className: classes.missionDrawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
    >
      <ControlBulletinHeader onCloseDrawer={onClose} backLinkLabel="Fermer" />
      <Notice
        type="warning"
        description="Ne pas diffuser. Ne pas verser au PV."
      />
      {controlData.pictures && (
        <Stack direction="column" rowGap={2} m={2}>
          {controlData.pictures.map((picture, index) => (
            <img key={`picture__${index}`} src={picture} />
          ))}
        </Stack>
      )}
      <ButtonsGroup
        className={classes.buttonGroup}
        buttons={[
          {
            onClick: () => reportInfractions(),
            children: "Relever des infractions",
            iconPosition: "right",
            iconId: "fr-icon-arrow-right-s-line"
          }
        ]}
      />
    </SwipeableDrawer>
  );
}
