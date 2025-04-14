import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { ControlBulletinHeader } from "../controlBulletin/ControlBulletinHeader";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { ControlTakePictures } from "./ControlTakePictures";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControlTakePicturesDrawer({ isOpen, onClose }) {
  const classes = useStyles();

  const [isTakingPictures, setIsTakingPictures] = useState(false);

  const backLabel = React.useMemo(
    () => (isTakingPictures ? "Retour" : "Fermer"),
    [isTakingPictures]
  );

  const _onClose = () => {
    setIsTakingPictures(false);
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={isOpen}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={_onClose}
      PaperProps={{
        className: classes.missionDrawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
    >
      <Box m={2} mt={0}>
        <ControlBulletinHeader
          onCloseDrawer={_onClose}
          backLinkLabel={backLabel}
        />
        {isTakingPictures ? (
          <ControlTakePictures onClose={_onClose} />
        ) : (
          <>
            <Typography variant="h2" component="h1" mb={2}>
              Prendre en photo le livret individuel de contrôle
            </Typography>
            <Typography mb={4}>
              Pour faciliter l’analyse des infractions, vous pouvez prendre en
              photo les feuillets quotidiens dans l’ordre chronologique, du plus
              ancien au plus récent, puis les récapitulatifs hebdomadaires.
            </Typography>
            <ButtonsGroup
              buttons={[
                {
                  children: "Commencer",
                  onClick: () => setIsTakingPictures(true)
                },
                {
                  children: "Annuler",
                  priority: "secondary",
                  onClick: () => _onClose()
                }
              ]}
              inlineLayoutWhen="sm and up"
              alignment="right"
            />
          </>
        )}
      </Box>
    </SwipeableDrawer>
  );
}
