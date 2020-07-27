import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[600]
  },
  fieldValue: {
    fontWeight: props => (props.bold ? "bold" : 500)
  }
}));

export function InfoItem({ name, value, info, bold }) {
  const classes = useStyles({ bold });

  return (
    <Box>
      <Typography className={classes.fieldName} variant="overline">
        {name}
      </Typography>
      <Typography noWrap className={classes.fieldValue}>
        {value}
      </Typography>
      {info && <Alert severity="info">{info}</Alert>}
    </Box>
  );
}
