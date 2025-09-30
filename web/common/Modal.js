import React from "react";
import { makeStyles } from "@mui/styles";
import { Dialog } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

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
  centerTitle = false
}) {
  const classes = useStyles();

  const closeButton = (
    <button
      className={fr.cx("fr-btn--close", "fr-btn")}
      type="button"
      onClick={handleClose}
      title="Fermer la fenêtre modale"
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
    >
      <div className={fr.cx("fr-modal__body")}>
        <div className={fr.cx("fr-modal__header")}>
          {!!handleClose && closeButton}
        </div>
        <div className={fr.cx("fr-modal__content")}>
          <h1
            id="dialog-title"
            className={fr.cx("fr-modal__title")}
            style={centerTitle ? { textAlign: "center" } : {}}
          >
            {title}
          </h1>
          {content}
        </div>
        {actions && (
          <div className={fr.cx("fr-modal__footer")}>
            <ul
              className={fr.cx(
                "fr-btns-group",
                "fr-btns-group--right",
                "fr-btns-group--inline-reverse",
                "fr-btns-group--inline-lg",
                "fr-btns-group--icon-left"
              )}
            >
              {React.Children.toArray(actions.props.children)
                .reverse()
                .map((action, i) => (
                  <li key={i}>
                    {React.cloneElement(action, {
                      className: fr.cx("fr-btn", action.props.className)
                    })}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
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
