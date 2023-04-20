import React from "react";

import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    justifyContent: "center",
    width: "100%"
  },
  infractionBox: {
    maxWidth: "345px"
  },
  selected: {
    borderColor: theme.palette.primary.main,
    border: "2px solid"
  }
}));

export function ControllerControlNoLicInfractionsComponent({ infractions }) {
  console.log(infractions);
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      {infractions.map(infraction => (
        <Card
          key={infraction.code}
          className={`${classes.infractionBox} ${classes.selected}`}
          variant="outlined"
        >
          <CardActionArea>
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                color="primary"
              >
                {infraction.code}
              </Typography>
              <Typography variant="h5">{infraction.description}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
