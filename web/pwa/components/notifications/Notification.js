import React from "react";

import { fr } from "@codegouvfr/react-dsfr";
import { Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  container: ({ read }) => ({
    borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    backgroundColor: read ? "transparent" : "var(--background-alt-blue-france)"
  }),
  title: ({ read }) => ({
    color: read
      ? fr.colors.decisions.background.flat.grey.default
      : fr.colors.decisions.background.flat.blueFrance.default,
    fontSize: "0.875rem",
    fontWeight: "bold",
    position: "relative",
    marginLeft: read ? "0" : "1.2rem",
    "&::before": {
      content: read ? '""' : '""',
      position: "absolute",
      left: "-24px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "var(--background-flat-red-marianne)",
      display: read ? "none" : "block"
    }
  }),
  content: ({ read }) => ({
    color: read
      ? fr.colors.decisions.text.mention.grey.default
      : fr.colors.decisions.background.flat.blueFrance.default,
    fontSize: "0.875rem",
    fontWeight: 400
  }),
  link: ({ read }) => ({
    color: read
      ? fr.colors.decisions.text.mention.grey.default
      : fr.colors.decisions.background.flat.blueFrance.default,
    fontSize: "0.875rem",
    fontWeight: 400,
    padding: 0,
    borderBottom: `1px solid ${
      read
        ? fr.colors.decisions.border.default.grey.default
        : fr.colors.decisions.background.flat.blueFrance.default
    }`
  })
}));

export const Notification = ({ title, content, historyOnClick, read }) => {
  console.log("Notification render:", { title: title?.substring(0, 20), read });
  const classes = useStyles({ read });
  return (
    <Stack direction="column" width="100%" p={2} className={classes.container}>
      <div className={classes.title}>{title}</div>
      <div className={classes.content}>{content}</div>
      <Button
        priority="tertiary no outline"
        size="small"
        onClick={historyOnClick}
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
        className={classes.link}
      >
        Afficher l'historique
      </Button>
    </Stack>
  );
};
