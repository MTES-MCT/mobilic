import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[600]
  },
  fieldValue: {
    fontWeight: props => (props.bold ? "bold" : 500),
    whiteSpace: "inherit"
  },
  actionButton: {
    fontSize: theme.typography.overline.fontSize,
    marginLeft: theme.spacing(4)
  }
}));

export function InfoItem({
  name,
  value,
  info,
  bold,
  actionTitle,
  action,
  alertComponent,
  titleProps = {}
}) {
  const classes = useStyles({ bold });

  return [
    <Grid key={1} container wrap="nowrap" spacing={0} alignItems="flex-start">
      <Grid item>
        <Typography
          align="left"
          className={classes.fieldName}
          variant="overline"
          {...titleProps}
        >
          {name}
        </Typography>
      </Grid>
      {action && (
        <Grid item>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={action}
            className={classes.actionButton}
          >
            {actionTitle}
          </Button>
        </Grid>
      )}
    </Grid>,
    <Typography key={2} noWrap align="left" className={classes.fieldValue}>
      {value}
    </Typography>,
    info && (
      <Alert key={3} severity="info">
        {info}
      </Alert>
    ),
    alertComponent
  ];
}
