import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  sectionTitle: {
    marginBottom: theme.spacing(2)
  },
  smallTextButton: {
    fontSize: "0.7rem"
  }
}));

export function MissionDetailsSection({
  className,
  children,
  title,
  action,
  actionButtonLabel
}) {
  const classes = useStyles();

  return (
    <Box py={4} className={className}>
      <Grid
        container
        spacing={2}
        justify="space-between"
        alignItems="center"
        className={classes.sectionTitle}
      >
        <Grid item>
          <Typography variant="h3">{title}</Typography>
        </Grid>
        {action && (
          <Grid item>
            <Button
              aria-label={actionButtonLabel}
              color="primary"
              variant="outlined"
              size="small"
              className={classes.smallTextButton}
              onClick={action}
            >
              {actionButtonLabel}
            </Button>
          </Grid>
        )}
      </Grid>
      {children}
    </Box>
  );
}
