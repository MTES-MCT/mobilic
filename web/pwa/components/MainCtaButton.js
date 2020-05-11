import React from "react";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

const useStyles = makeStyles(theme => ({
  cta: {
    backgroundColor: theme.palette.primary.dark,
    "&:hover": {
      backgroundColor: theme.palette.primary.main
    }
  }
}));

export function MainCtaButton(props) {
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      className={classes.cta}
      variant="contained"
      color="primary"
      onClick={async () => {
        setLoading(true);
        try {
          await props.onClick();
          setLoading(false);
        } catch (err) {
          setLoading(false);
          throw err;
        }
      }}
      {...props}
    >
      <span style={{ position: "relative", visibility: loading && "hidden" }}>
        {props.children}
      </span>
      {loading && (
        <CircularProgress
          style={{ position: "absolute" }}
          color="inherit"
          size="1rem"
        />
      )}
    </Button>
  );
}
