import React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Button } from "@codegouvfr/react-dsfr/Button";
import EmailSvg from "common/assets/images/email.svg";

export function Cards() {
  return (
    <Box ml={2}>
      <Paper variant="outlined">
        <Button
          onClick={() => console.log("click")}
          priority="secondary"
          style={{ boxShadow: "none" }}
        >
          <Stack direction="column" gap={2}>
            <img alt="" src={EmailSvg} style={{ flexShrink: 1 }} width={244} />
            <Typography
              variant="body1"
              className="fr-icon-arrow-right-line fr-btn--icon-right"
            >
              Faire connaître Mobilic
            </Typography>
          </Stack>
        </Button>
      </Paper>
    </Box>
  );
}
