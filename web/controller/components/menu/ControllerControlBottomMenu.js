import React from "react";
import { makeStyles } from "@mui/styles";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Box } from "@mui/material";
import { useControl } from "../../utils/contextControl";

const useStyles = makeStyles(theme => ({
  textButton: {
    textDecoration: "underline"
  }
}));

export function ControllerControlBottomMenu({ editBDC, downloadBDC }) {
  const classes = useStyles();
  const { canDownloadBDC, bdcAlreadyExists } = useControl();

  return (
    <Box padding={2}>
      <ButtonsGroup
        buttons={[
          bdcAlreadyExists
            ? {
                children: "Télécharger le bulletin de contrôle",
                onClick: downloadBDC,
                iconId: "fr-icon-download-line",
                iconPosition: "left",
                disabled: !canDownloadBDC
              }
            : {
                children: "Éditer un bulletin de contrôle",
                onClick: editBDC,
                priority: "secondary"
              },
          ...(bdcAlreadyExists
            ? [
                {
                  children: "Modifier le bulletin de contrôle",
                  priority: "tertiary no outline",
                  className: classes.textButton,
                  onClick: editBDC
                }
              ]
            : [])
        ]}
        inlineLayoutWhen="md and up"
        alignment="center"
      />
    </Box>
  );
}
