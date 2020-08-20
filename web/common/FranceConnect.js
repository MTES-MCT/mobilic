import React from "react";
import Button from "@material-ui/core/Button";
import { FranceConnectIcon } from "common/utils/icons";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
  svg: {
    color: "#034EA2",
    "&:hover": { color: "#1E88E5" }
  }
});

export function FranceConnectContainer({ onButtonClick, ...props }) {
  const classes = useStyles();
  return (
    <Box {...props}>
      <Button onClick={onButtonClick}>
        <FranceConnectIcon className={classes.svg} scale={0.75} />
      </Button>
      <Link
        style={{ display: "block" }}
        variant="body1"
        href="https://www.franceconnect.gouv.fr"
        target="_blank"
        rel="noreferrer"
      >
        Qu'est-ce que FranceConnect ?
      </Link>
    </Box>
  );
}
