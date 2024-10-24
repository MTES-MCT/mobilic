import omit from "lodash/omit";
import Typography from "@mui/material/Typography";
import React from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
    textAlign: "left"
  },
  titleContainer: {
    paddingBottom: theme.spacing(2)
  },
  extraPadding: {
    paddingBottom: theme.spacing(4)
  }
}));

export function MissionInfoCard({
  title,
  titleProps = {},
  extraPaddingBelowTitle = false,
  onActionButtonClick = null,
  loading = false,
  children,
  actionButtonLabel,
  ...other
}) {
  const classes = useStyles();

  return (
    <Card
      className={`${classes.container} ${other.className}`}
      variant="outlined"
      {...omit(other, ["className"])}
    >
      {title && (
        <Grid
          container
          spacing={2}
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
          className={`${classes.titleContainer} ${extraPaddingBelowTitle &&
            classes.extraPadding}`}
        >
          <Grid item>
            <Typography variant="h3" {...titleProps}>
              {title}
            </Typography>
          </Grid>
          {onActionButtonClick && (
            <Grid item>
              <Button
                priority="tertiary"
                size="small"
                onClick={onActionButtonClick}
              >
                {actionButtonLabel}
              </Button>
            </Grid>
          )}
        </Grid>
      )}
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={300} />
      ) : (
        children
      )}
    </Card>
  );
}
