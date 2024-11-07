import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import { Stack } from "@mui/material";
import Notice from "../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";

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
              priority={value ? "secondary" : "primary"}
              onClick={action}
            >
              {title}
            </Button>
          </Grid>
        )}
      </Stack>
      {info && <Notice description={info} />}
      {alertComponent}
    </>
  );
}
