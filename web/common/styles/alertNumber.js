// Styles communs pour les badges d'alerte (alertNumber)

export const alertNumberBase = theme => ({
  display: "inline-flex",
  whiteSpace: "pre",
  color: "var(--text-inverted-warning)",
  paddingLeft: theme.spacing ? theme.spacing(1) : "8px",
  paddingRight: theme.spacing ? theme.spacing(1) : "8px",
  height: theme.spacing ? theme.spacing(3) : "24px",
  minWidth: theme.spacing ? theme.spacing(3) : "24px",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "0.75rem"
});
