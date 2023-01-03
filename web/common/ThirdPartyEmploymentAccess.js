import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[600]
  },
  fieldValue: {
    fontWeight: 500,
    whiteSpace: "inherit"
  },
  clientRow: {
    display: "flex",
    flexWrap: "noWrap",
    justifyContent: "space-between",
    marginTop: theme.spacing(1)
  }
}));

const ThirdPartyEmploymentAccess = ({ clients }) => {
  const classes = useStyles();

  if (!clients || clients.length === 0) return null;

  const removeClientAccess = clientId => {
    // TODO
  };

  return (
    <>
      <Typography align="left" className={classes.fieldName} variant="overline">
        Autorisations d'accès aux services tiers
      </Typography>
      {clients.map(client => (
        <div key={client.id} className={classes.clientRow}>
          <Typography noWrap align="left" className={classes.fieldValue}>
            Logiciel {client.name}
          </Typography>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => removeClientAccess(client.id)}
            className={classes.actionButton}
          >
            Retirer l'accès
          </Button>
        </div>
      ))}
      {/* </div> */}
    </>
  );
};

export default ThirdPartyEmploymentAccess;
