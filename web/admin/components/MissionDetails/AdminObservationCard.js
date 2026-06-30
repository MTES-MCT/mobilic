import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { formatDay, formatTimeOfDay } from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { fr } from "@codegouvfr/react-dsfr";
import { DeleteIcon } from "common/utils/icons";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    background: fr.colors.decisions.background.alt.grey.default,
    borderRadius: 0
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
    width: "100%"
  },
  submitter: {
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.text.active.blueFrance.default
  },
  time: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.text.mention.grey.default,
    flexGrow: 1
  },
  text: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.text.default.grey.default
  },
  deleteIcon: {
    fontSize: "16px !important",
    color: fr.colors.decisions.text.actionHigh.blueFrance.default
  }
}));

export function AdminObservationCard({ comment, onDelete }) {
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  const canDelete =
    onDelete &&
    (comment.submitter?.id ?? store.userId()) === store.userId();

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography className={classes.submitter}>
          {comment.submitter
            ? formatPersonName(comment.submitter)
            : formatPersonName(store.userInfo())}
        </Typography>
        <Typography className={classes.time}>
          le {formatDay(comment.receptionTime, true)} à{" "}
          {formatTimeOfDay(comment.receptionTime)}
        </Typography>
        {canDelete && (
          <IconButton
            size="small"
            aria-label="Supprimer l'observation"
            onClick={() =>
              modals.open("confirmation", {
                title: "Confirmer suppression de l'observation",
                handleConfirm: onDelete
              })
            }
          >
            <DeleteIcon className={classes.deleteIcon} />
          </IconButton>
        )}
      </Box>
      <Typography className={classes.text}>{comment.text}</Typography>
    </Box>
  );
}
