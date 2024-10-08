import React from "react";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: "1.5rem",
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2)
    }
  },
  content: {
    color: "rgba(0, 0, 0, 0.8)"
  },
  dialogPaper: {
    [theme.breakpoints.down("md")]: {
      margin: 0,
      position: "fixed",
      bottom: 0,
      width: "100%",
      maxWidth: "100%"
    }
  },
  closeButton: {
    position: "absolute",
    right: 8,
    top: 4,
    [theme.breakpoints.up("sm")]: {
      right: 16,
      top: 8
    }
  }
}));

export default function Modal({
  open,
  handleClose,
  title,
  content,
  actions,
  zIndex = 2000,
  size = "md",
  fullHeight = false
}) {
  const classes = useStyles();

  const closeButton = (
    <button
      className={`fr-link--close fr-link ${classes.closeButton}`}
      type="button"
      onClick={handleClose}
      title="Fermer la fenêtre modale"
      aria-controls="fr-modal"
    >
      Fermer
    </button>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="dialog-title"
      fullWidth
      maxWidth={size}
      classes={{ paper: classes.dialogPaper }}
      sx={{ zIndex }}
      {...(fullHeight ? { PaperProps: { style: { height: "100%" } } } : {})}
    >
      <DialogTitle id="dialog-title" className={classes.title}>
        {title}
      </DialogTitle>
      {!!handleClose && closeButton}
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Stack
          p={2}
          width="100%"
          columnGap={2}
          rowGap={2}
          alignItems="center"
          justifyContent="flex-start"
          sx={{
            flexDirection: {
              xs: "column",
              sm: "row-reverse"
            }
          }}
        >
          {actions}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export const modalStyles = makeStyles(theme => ({
  modalFooter: {
    marginLeft: "auto"
  },
  subtitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  filterGrid: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flexShrink: 0
  },
  flexGrow: {
    flexGrow: 1
  },
  warningIcon: {
    color: "#CE0500",
    marginRight: theme.spacing(1)
  },
  deleteButton: {
    color: "var(--red-marianne-main-472)",
    boxShadow: "inset 0 0 0 1px var(--red-marianne-main-472)"
  },
  warningText: {
    color: "#CE0500"
  },
  underlined: {
    textDecoration: "underline"
  },
  button: {
    [theme.breakpoints.down("md")]: {
      width: "100%",
      justifyContent: "center"
    }
  }
}));
