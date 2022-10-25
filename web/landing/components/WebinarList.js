import React from "react";
import ListItem from "@mui/material/ListItem";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  addZero,
  formatTimeOfDay,
  SHORT_DAYS,
  SHORT_MONTHS
} from "common/utils/time";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import List from "@mui/material/List";
import { HTTP_QUERIES } from "common/utils/apiQueries";

import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import { captureSentryException } from "common/utils/sentry";

const useStyles = makeStyles(theme => ({
  webinarCard: {
    width: "100%",
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: "inherit"
  },
  webinarDateDay: {
    fontWeight: "bold",
    fontSize: "120%",
    lineHeight: 1,
    letterSpacing: "3px",
    textTransform: "uppercase"
  },
  webinarDateMonth: {
    fontWeight: "bold",
    fontSize: "80%",
    textTransform: "uppercase"
  },
  webinarDate: {
    fontSize: "300%",
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
  const api = useApi();

  const [webinars, setWebinars] = React.useState([]);
  const [webinarsLoaded, setWebinarsLoaded] = React.useState(false);
  const [webinarsLoadError, setWebinarsLoadError] = React.useState(false);

  async function fetchWebinars() {
    try {
      const newWebinars = await api.jsonHttpQuery(
        HTTP_QUERIES.webinars,
        {},
        true
      );
      setWebinars(newWebinars);
      setWebinarsLoaded(true);
      setWebinarsLoadError(false);
    } catch (err) {
      setWebinarsLoadError(true);
      captureSentryException(err);
    }
  }

  React.useEffect(() => {
    if (webinars.length === 0 && !webinarsLoaded) {
      fetchWebinars();
    }
  }, []);

  React.useEffect(() => {
    if ((webinarsLoaded && webinars.length === 0) || webinarsLoadError) {
      setCantDisplayWebinarsBecauseNoneOrError(true);
    } else setCantDisplayWebinarsBecauseNoneOrError(false);
  }, [webinars, webinarsLoaded, webinarsLoadError]);

  if (webinars.length === 0 && webinarsLoaded) return null;

  return (
    <List>
      {webinars.length > 0
        ? webinars.slice(0, 10).map((webinar, index) => {
            const webinarDate = new Date(webinar.time * 1000);
            return (
              <ListItem key={index} target="_blank">
                <ButtonBase
                  className={classes.webinarButton}
                  href={webinar.link}
                  target="_blank"
                >
                  <Card className={classes.webinarCard}>
                    <Grid
                      container
                      alignItems="center"
                      spacing={1}
                      sx={{
                        spacing: { xs: 2, sm: 6 },
                        wrap: { xs: "wrap", sm: "nowrap" }
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={6}
                        sm={"auto"}
                        direction="column"
                        alignItems="center"
                        style={{ maxWidth: 120 }}
                      >
                        <Grid item>
                          <Typography className={classes.webinarDateDay}>
                            {SHORT_DAYS[webinarDate.getDay()]}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography className={classes.webinarDate}>
                            {addZero(webinarDate.getDate())}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography className={classes.webinarDateMonth}>
                            {SHORT_MONTHS[webinarDate.getMonth()]}{" "}
                            {webinarDate.getFullYear()}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item xs={6} sm={"auto"}>
                        <Typography className={classes.webinarTime}>
                          {formatTimeOfDay(webinar.time)}
                        </Typography>
                      </Grid>
                      <Grid item style={{ flexGrow: 1, maxWidth: 620 }}>
                        <Typography className={classes.webinarTitle}>
                          {webinar.title}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Button color="primary" style={{ paddingLeft: 0 }}>
                          M'inscrire
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
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
