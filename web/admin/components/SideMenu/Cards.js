import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { InviteCompaniesCard } from "./InviteCompaniesCard";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function Cards() {
  return (
    <Box ml={2}>
      <InviteCompaniesCard />
    </Box>
  );
}

export function Card({ onClick, svg, buttonTitle }) {
  return (
    <Paper variant="outlined">
      <Button
        onClick={onClick}
        priority="secondary"
        style={{ boxShadow: "none" }}
      >
        <Stack direction="column" gap={2}>
          <img alt="" src={svg} style={{ flexShrink: 1 }} width={244} />
          <Typography
            variant="body1"
            className="fr-icon-arrow-right-line fr-btn--icon-right"
          >
            {buttonTitle}
          </Typography>
        </Stack>
      </Button>
    </Paper>
  );
}
