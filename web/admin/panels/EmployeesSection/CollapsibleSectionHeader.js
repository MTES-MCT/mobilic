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
    margin: 0
  },
  openSection: {
    color: fr.colors.decisions.text.title.blueFrance.default,
    fontWeight: 500
  },
  closedSection: {
    color: fr.colors.decisions.text.default.grey.default,
    fontWeight: 400
  }
}));

const CollapsibleSectionHeader = ({ label, open, onToggle }) => {
  const classes = useStyles();

  return (
    <h3
      className={`${classes.sectionLabel} fr-text--md ${
        open ? classes.openSection : classes.closedSection
      }`}
    >
      <button
        type="button"
        className={classes.expandBtn}
        onClick={onToggle}
        aria-expanded={open}
      >
        <div
          className={`fr-icon-arrow-${open ? "down" : "right"}-s-line fr-icon--sm ${open ? classes.openSection : classes.closedSection}`}
          aria-hidden="true"
        />
        {label}
      </button>
    </h3>
  );
};

export default CollapsibleSectionHeader;
