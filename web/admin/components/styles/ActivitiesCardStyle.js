import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

const grey = fr.colors.decisions.text.default.grey.default;
const borderGrey = fr.colors.decisions.border.default.grey.default;
const bgAltGrey = fr.colors.decisions.background.alt.grey.default;
const borderPlainGrey = fr.colors.decisions.border.plain.grey.default;
const blueFrance = fr.colors.decisions.text.actionHigh.blueFrance.default;

export const useActivitiesCardStyles = makeStyles(theme => ({
  table: {
    borderCollapse: "collapse",
    border: `1px solid ${borderGrey}`
  },
  headerRow: {
    background: bgAltGrey,
    borderBottom: `2px solid ${borderPlainGrey}`,
    "& th": {
      fontWeight: 700,
      fontSize: 14,
      lineHeight: "24px",
      color: grey,
      padding: "8px 16px",
      textTransform: "none"
    }
  },
  cellType: {
    minWidth: 100
  },
  cellTag: {
    textAlign: "left",
    padding: "0 8px"
  },
  cellTime: {
    minWidth: 80,
    maxWidth: 96
  },
  cellDuration: {
    minWidth: 120
  },
  cellAction: {
    width: 64,
    textAlign: "center"
  },
  activityRow: {
    borderTop: `1px solid ${borderGrey}`,
    "&:first-child": {
      borderTop: "none"
    },
    "& td": {
      padding: "8px 16px",
      fontSize: 14,
      lineHeight: "24px",
      color: grey,
      height: 40,
      boxSizing: "content-box",
      verticalAlign: "middle",
      borderBottom: "none"
    },
    "& td:first-child": {
      fontWeight: 700
    }
  },
  clickableRow: {
    cursor: "pointer"
  },
  dismissedRow: {
    "& td": {
      color: "#7B7B7B",
      fontWeight: 500
    }
  },
  historyRow: {
    "& td": {
      borderBottom: "none"
    },
    "&:hover": {
      background: "none"
    }
  },
  historySubRow: {
    padding: "0 16px 8px",
    height: "auto",
    boxSizing: "border-box"
  },
  historyAuthor: {
    color: blueFrance,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "24px"
  },
  historyDate: {
    color: "#7B7B7B",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "24px",
    marginLeft: 4
  },
  historyText: {
    color: grey,
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "24px"
  },
  tag: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0px 6px",
    height: 20,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: "20px",
    whiteSpace: "nowrap",
    textTransform: "uppercase"
  },
  tagModification: {
    color: fr.colors.decisions.background.flat.yellowTournesol.default,
    backgroundColor: fr.colors.decisions.background.contrast.yellowTournesol.default
  },
  tagSuppression: {
    color: grey,
    backgroundColor: fr.colors.decisions.background.contrast.grey.default
  },
  tagAjout: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    backgroundColor:
      fr.colors.decisions.background.contrast.blueFrance.default
  },
  durationCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    "& .fr-icon-time-line": {
      color: grey
    }
  },
  editButton: {
    width: 32,
    height: 32,
    padding: 8,
    border: `1px solid ${blueFrance}`,
    borderRadius: 0,
    boxSizing: "border-box"
  },
  editButtonIcon: {
    fontSize: 16,
    color: blueFrance
  },
  chevron: {
    fontSize: 20,
    color: blueFrance,
    display: "block",
    margin: "auto",
    transition: "transform 0.2s"
  },
  chevronExpanded: {
    transform: "rotate(180deg)"
  },
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  listActivitiesGrid: {
    marginBottom: theme.spacing(5)
  },
  chartContainer: {
    textAlign: "center"
  }
}));
