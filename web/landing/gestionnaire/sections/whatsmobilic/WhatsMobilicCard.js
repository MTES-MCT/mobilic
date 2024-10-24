import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import React from "react";
import Stack from "@mui/material/Stack";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ADMIN_FAQ } from "common/utils/matomoTags";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  card: {
    borderBottom: `solid 4px ${theme.palette.primary.main}`,
    textAlign: "left",
    paddingTop: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingRight: theme.spacing(4),
    maxWidth: "580px"
  },
  moreInfo: {
    textDecoration: "underline",
    fontStyle: "italic",
    marginTop: theme.spacing(2)
  }
}));

export function WhatsMobilicCard({ id, title, content, link }) {
  const classes = useStyles();
  const { trackEvent } = useMatomo();

  return (
    <Paper variant="outlined" className={classes.card}>
      <Button
        onClick={() => trackEvent(ADMIN_FAQ(id))}
        linkProps={{
          href: link,
          target: "_blank",
          rel: "noopener noreferrer"
        }}
        priority="secondary"
      >
        <Stack direction="column" gap={2}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body1">{content}</Typography>
          <Typography variant="body1" className={classes.moreInfo}>
            Plus d'infos
          </Typography>
        </Stack>
      </Button>
    </Paper>
  );
}
