import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[700],
    fontSize: "0.875rem"
  },
  fieldValue: {
    fontWeight: props => (props.bold ? "bold" : 400),
    whiteSpace: "inherit"
  },
  valuePlaceholder: {
    color: theme.palette.grey[600]
  },
  actionButton: {
    fontSize: "0.875rem",
    textTransform: props => (props.uppercaseTitle ? "uppercase" : "none")
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
  titleProps = {},
  uppercaseTitle = true,
  valuePlaceholder
}) {
  const classes = useStyles({ bold });

  const title = React.useMemo(
    () => actionTitle || (value ? "Modifier" : "Ajouter")
  );

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="column">
          <Typography
            align="left"
            className={classes.fieldName}
            variant={uppercaseTitle ? "overline" : "subtitle1"}
            {...titleProps}
          >
            {name}
          </Typography>
          <Typography
            noWrap
            align="left"
            className={value ? classes.fieldValue : classes.valuePlaceholder}
          >
            {value || valuePlaceholder}
          </Typography>
        </Stack>
        {action && (
          <Grid item>
            <Button
              size="small"
              color="primary"
              variant={value ? "outlined" : "contained"}
              onClick={action}
              className={classes.actionButton}
            >
              {title}
            </Button>
          </Grid>
        )}
      </Stack>
      {info && <Alert severity="info">{info}</Alert>}
      {alertComponent}
    </>
  );
}
