import React from "react";
import Button from "@mui/material/Button";
import { FranceConnectIcon } from "common/utils/icons";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";

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
        <Button aria-label="France Connect" onClick={onButtonClick}>
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
