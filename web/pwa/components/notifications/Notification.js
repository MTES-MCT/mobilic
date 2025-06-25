import React from "react";

import { fr } from "@codegouvfr/react-dsfr";
import { Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  container: {
    borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
  },
  title: ({ read }) => ({
    color: read
      ? fr.colors.decisions.background.flat.grey.default
      : fr.colors.decisions.background.flat.blueFrance.default,
    fontSize: "0.875rem",
    fontWeight: "bold",
    position: "relative",
    ...(!read && {
      marginLeft: "1.2rem",
      "&::before": {
        content: '""',
        position: "absolute",
        left: "-24px", // adjust as needed
        top: "50%",
        transform: "translateY(-50%)",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "red"
      }
    })
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

export const Notification = ({
  title,
  content,
  historyOnClick,
  read = true
}) => {
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
