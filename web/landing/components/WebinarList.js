import React from "react";
import ListItem from "@mui/material/ListItem";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import {
  addZero,
  formatTimeOfDay,
  SHORT_DAYS,
  SHORT_MONTHS
} from "common/utils/time";
import Skeleton from "@mui/material/Skeleton";
import List from "@mui/material/List";
import { Button } from "@codegouvfr/react-dsfr/Button";

import { makeStyles } from "@mui/styles";
import { useWebinars } from "../useWebinars";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  webinarCard: {
    width: "100%",
    padding: theme.spacing(2),
    backgroundColor: "inherit",
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default
  },
  webinarDateDay: {
    fontWeight: 500,
    lineHeight: 1,
    textTransform: "uppercase"
  },
  webinarDateMonth: {
    fontWeight: 500,
    fontSize: "0.625rem",
    textTransform: "uppercase"
  },
  webinarDate: {
    fontSize: "2rem",
    lineHeight: 1,
    fontWeight: "bold",
    color: theme.palette.primary.main
  },
  webinarTime: {
    fontWeight: "bold"
  },
  webinarTitle: {
    textAlign: "left"
  },
  webinarButton: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  }
}));

export const WebinarList = ({ setCantDisplayWebinarsBecauseNoneOrError }) => {
  const classes = useStyles();

  const [webinars, webinarsLoaded] = useWebinars(
    setCantDisplayWebinarsBecauseNoneOrError
  );

  if (webinars.length === 0 && webinarsLoaded) return null;

  return (
    <List>
      {webinars.length > 0
        ? webinars.slice(0, 10).map((webinar, index) => {
            const webinarDate = new Date(webinar.time * 1000);
            return (
              <ListItem key={index} target="_blank" sx={{ paddingX: 0 }}>
                <ButtonBase
                  className={classes.webinarButton}
                  href={webinar.link}
                  target="_blank"
                >
                  <Box className={classes.webinarCard}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Stack direction="row" alignItems="center" columnGap={2}>
                        <Stack direction="column" alignItems="center">
                          <Typography className={classes.webinarDateDay}>
                            {SHORT_DAYS[webinarDate.getDay()]}
                          </Typography>
                          <Typography className={classes.webinarDate}>
                            {addZero(webinarDate.getDate())}
                          </Typography>
                          <Typography className={classes.webinarDateMonth}>
                            {SHORT_MONTHS[webinarDate.getMonth()]}{" "}
                            {webinarDate.getFullYear()}
                          </Typography>
                        </Stack>
                        <Typography className={classes.webinarTime}>
                          {formatTimeOfDay(webinar.time)}
                        </Typography>
                      </Stack>
                      <Typography className={classes.webinarTitle}>
                        {webinar.title}
                      </Typography>
                      <Button priority="tertiary no outline" size="small">
                        M'inscrire
                      </Button>
                    </Stack>
                  </Box>
                </ButtonBase>
              </ListItem>
            );
          })
        : [
            <ListItem key={-1}>
              <Skeleton variant="rectangular" width="100%" height={100} />
            </ListItem>,
            <ListItem key={-2}>
              <Skeleton variant="rectangular" width="100%" height={100} />
            </ListItem>
          ]}
    </List>
  );
};
