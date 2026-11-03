import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles((theme) => ({
  expandBtn: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    cursor: "pointer",
    border: "none",
    background: "none",
    padding: 0,
    font: "inherit",
    color: "inherit",
    textAlign: "left"
  },
  sectionLabel: {
    margin: 0,
    color: fr.colors.decisions.text.title.blueFrance.default,
    fontWeight: 500
  },
  arrowIcon: {
    color: fr.colors.decisions.background.active.blueFrance.default
  }
}));

const CollapsibleSectionHeader = ({ label, open, onToggle }) => {
  const classes = useStyles();

  return (
    <h3 className={`${classes.sectionLabel} fr-text--md`}>
      <button
        type="button"
        className={classes.expandBtn}
        onClick={onToggle}
        aria-expanded={open}
      >
        <div
          className={`fr-icon-arrow-${open ? "down" : "up"}-s-line fr-icon--sm ${classes.arrowIcon}`}
          aria-hidden="true"
        />
        {label}
      </button>
    </h3>
  );
};

export default CollapsibleSectionHeader;
