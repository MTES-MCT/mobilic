import omit from "lodash/omit";
import Typography from "@material-ui/core/Typography";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Skeleton from "@material-ui/lab/Skeleton";

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
          justify="space-between"
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
              <Button color="primary" onClick={onActionButtonClick}>
                {actionButtonLabel}
              </Button>
            </Grid>
          )}
        </Grid>
      )}
      {loading ? (
        <Skeleton variant={"rect"} width="100%" height={300} />
      ) : (
        children
      )}
    </Card>
  );
}
