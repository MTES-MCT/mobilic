import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import React from "react";
import { MobilicLogoBlueIcon } from "common/utils/icons";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  icon: {
    position: "absolute",
    zIndex: -1,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  },
  iconContainer: {
    position: "relative",
    width: "100px",
    height: "100px",
    lineHeight: "100px"
  },
  index: {
    fontWeight: "bold",
    fontSize: "2.25rem",
    verticalAlign: "middle",
    display: "inline-block"
  }
}));

export function SetupMobilicBlock({ index, when, title, content }) {
  const classes = useStyles();
  return (
    <Stack direction="column" alignItems="center" gap={2} maxWidth={340}>
      <Box className={classes.iconContainer}>
        <MobilicLogoBlueIcon className={classes.icon} />
        <Typography className={classes.index} color="white">
          {index}
        </Typography>
      </Box>
      <Typography variant="button" color="primary">
        {when}
      </Typography>
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body1">{content}</Typography>
    </Stack>
  );
}
