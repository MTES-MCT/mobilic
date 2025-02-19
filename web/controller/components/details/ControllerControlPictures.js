import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Description } from "../../../common/typography/Description";
import { TitleContainer } from "../../../control/components/TitleContainer";

export function ControllerControlPictures() {
  return (
    <Stack spacing={0} sx={{ width: "100%" }}>
      <TitleContainer>
        <Typography variant="h5" component="h2">
          Photos du LIC
        </Typography>
        <Button
          priority="primary"
          size="small"
          onClick={() => {
            console.log("click");
          }}
        >
          Prendre en photo
        </Button>
      </TitleContainer>
      <Description noMargin>
        Ajoutez des photos du livret individuel de contrôle et retrouvez-les
        dans votre historique de contrôle afin de relever des infractions
        ultérieurement.
      </Description>
    </Stack>
  );
}
