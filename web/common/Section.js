import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  section: {
    width: "100%"
  },
  sectionTitle: {
    marginBottom: theme.spacing(3),
    textAlign: "left"
  }
}));

export const Section = React.forwardRef((props, ref) => {
  const classes = useStyles();

  return (
    <Box ref={ref} my={6} mb={props.last ? 0 : 6} className={classes.section}>
      <Typography className={classes.sectionTitle} variant="h5">
        {props.title}
      </Typography>
      {props.children}
    </Box>
  );
});
