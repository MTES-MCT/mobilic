import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ButtonBase from "@material-ui/core/ButtonBase";
import Card from "@material-ui/core/Card/Card";
import Grid from "@material-ui/core/Grid";
import { isWidthDown } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {
  addZero,
  formatTimeOfDay,
  SHORT_DAYS,
  SHORT_MONTHS
} from "common/utils/time";
import Button from "@material-ui/core/Button";
import Skeleton from "@material-ui/lab/Skeleton";
import List from "@material-ui/core/List";
import { HTTP_QUERIES } from "common/utils/apiQueries";

import { useApi } from "common/utils/api";
import withWidth from "@material-ui/core/withWidth";
import makeStyles from "@material-ui/core/styles/makeStyles";
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

export const WebinarList = withWidth()(
  ({ width, setCantDisplayWebinarsBecauseNoneOrError }) => {
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
                        spacing={isWidthDown("xs", width) ? 2 : 6}
                        wrap={isWidthDown("xs", width) ? "wrap" : "nowrap"}
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
                          <Typography>
                            {formatTimeOfDay(webinar.time)}
                          </Typography>
                        </Grid>
                        <Grid item style={{ flexGrow: 1 }}>
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
                <Skeleton variant="rect" width="100%" height={100} />
              </ListItem>,
              <ListItem key={-2}>
                <Skeleton variant="rect" width="100%" height={100} />
              </ListItem>
            ]}
      </List>
    );
  }
);
