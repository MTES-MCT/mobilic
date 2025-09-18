import React from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { InviteCompaniesCard } from "./InviteCompaniesCard";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { JoinWebinarsCard } from "./JoinWebinarsCard";

export function Cards() {
  return (
    <Stack mx={2} rowGap={2}>
      <JoinWebinarsCard />
      <InviteCompaniesCard />
    </Stack>
  );
}

export function Card({ onClick, svg, buttonTitle }) {
  return (
    <Paper variant="outlined">
      <Button
        onClick={onClick}
        priority="secondary"
        style={{
          boxShadow: "none",
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0
        }}
      >
        <Stack direction="column" gap={2}>
          <img alt="" src={svg} style={{ flexShrink: 1 }} width={244} />
          <Typography
            variant="body1"
            className="fr-icon-arrow-right-line fr-btn--icon-right"
            fontWeight="500"
          >
            {buttonTitle}
          </Typography>
        </Stack>
      </Button>
    </Paper>
  );
}
