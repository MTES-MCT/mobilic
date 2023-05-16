import { useApi } from "common/utils/api";
import { USER_CONTROLS_QUERY } from "common/utils/apiQueries";
import Stack from "@mui/material/Stack";
import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { currentUserId } from "common/utils/cookie";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { prettyFormatDayHour } from "common/utils/time";
import { Alert } from "@mui/material";

const useStyles = makeStyles(theme => ({
  section: {
    width: "100%"
  },
  mainTitle: {
    marginBottom: theme.spacing(1),
    textAlign: "left"
  },
  alert: {
    marginBottom: theme.spacing(2)
  },
  explanation: {
    fontSize: "0.875rem"
  },
  controlHistory: {
    color: theme.palette.grey[600]
  }
}));

export function UserControlSection() {
  const classes = useStyles();

  const api = useApi();
  const [controlsDate, setControlsDate] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(async () => {
    setLoading(true);
    const apiResponse = await api.graphQlQuery(USER_CONTROLS_QUERY, {
      userId: currentUserId()
    });
    setControlsDate(apiResponse.data.user.controlsDate);
    setLoading(false);
  }, []);

  return (
    <Box my={6} mb={6} className={classes.section}>
      <Grid container>
        <Grid item xs={12}>
          <Typography className={classes.mainTitle} variant="h5">
            Mes contrôles en bord de route
          </Typography>
        </Grid>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : (
          <>
            {controlsDate.length > 0 && (
              <Stack direction="column">
                <Alert severity="info" className={classes.alert}>
                  <Typography className={classes.explanation}>
                    Votre employeur est responsable en cas de contrôle en bord
                    de route
                  </Typography>
                </Alert>
                <Typography
                  align="left"
                  className={classes.controlHistory}
                  variant="overline"
                >
                  HISTORIQUE DES CONTRÔLES
                </Typography>
                <Typography align="left">
                  {controlsDate.map(prettyFormatDayHour).join(" ; ")}
                </Typography>
              </Stack>
            )}
          </>
        )}
        {controlsDate.length === 0 && !loading && (
          <Typography>
            Vous n'avez pas de contrôle en bord de route enregistré dans
            Mobilic.
          </Typography>
        )}
      </Grid>
    </Box>
  );
}
