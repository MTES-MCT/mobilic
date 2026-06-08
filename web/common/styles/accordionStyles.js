import { makeStyles } from "@mui/styles";

export const useAccordionSummaryStyles = makeStyles(theme => ({
  summary: {
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  summaryRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  summaryLeft: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  summaryIcons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0
  },
  arrowIcon: {
    transition: "transform 0.2s",
    display: "block"
  },
  arrowIconOpen: {
    transform: "rotate(180deg)"
  },
  deleteButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    color: "var(--text-action-high-blue-france)"
  },
  alertBadge: {
    borderRadius: "1rem",
    backgroundColor: `${theme.palette.info.main} !important`,
    color: "white !important"
  },
  errorAlertBadge: {
    borderRadius: "1rem",
    backgroundColor: `${theme.palette.error.main} !important`,
    color: "white !important"
  }
}));
