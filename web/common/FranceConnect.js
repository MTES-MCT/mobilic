import React from "react";
import Button from "@material-ui/core/Button";
import { FranceConnectIcon } from "common/utils/icons";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";

const useStyles = makeStyles(theme => ({
  svg: {
    color: "#034EA2",
    "&:hover": { color: "#1E88E5" }
  },
  text: {
    fontStyle: "italic",
    marginBottom: theme.spacing(1)
  },
  card: {
    backgroundColor: "inherit",
    padding: theme.spacing(2)
  }
}));

export function FranceConnectContainer({
  onButtonClick,
  helperText,
  ...props
}) {
  const classes = useStyles();
  return (
    <Box {...props}>
      <Card variant="outlined" className={classes.card}>
        <Typography className={classes.text} variant="body2">
          {helperText}
        </Typography>
        <Button onClick={onButtonClick}>
          <FranceConnectIcon className={classes.svg} scale={0.75} />
        </Button>
        <Link
          style={{ display: "block" }}
          variant="body1"
          href="https://franceconnect.gouv.fr"
          target="_blank"
          rel="noopener noreferrer"
        >
          Qu'est-ce que FranceConnect ?
        </Link>
      </Card>
    </Box>
  );
}
