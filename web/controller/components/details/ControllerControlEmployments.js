import React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Notice from "../../../common/Notice";
import { EmploymentInfoCard } from "../../../common/EmploymentInfoCard";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  subSectionBody: {
    marginBottom: theme.spacing(2)
  }
}));

export function ControllerControlEmployments({ employments, businesses }) {
  const classes = useStyles();

  return (
    <div>
      <Typography
        variant="h6"
        component="h2"
        className={classes.subSectionBody}
      >
        Entreprise(s) de rattachement
      </Typography>
      <Grid container spacing={2} direction="column">
        {employments.map(e => (
          <Grid item key={e.id}>
            <EmploymentInfoCard
              key={e.id}
              employment={e}
              hideRole
              hideStatus
              hideActions
              lightenIfEnded={false}
              headingComponent="h3"
              spacing={2}
            />
          </Grid>
        ))}
      </Grid>
      {businesses && businesses.length > 1 && (
        <Notice
          type="warning"
          sx={{ marginTop: 2 }}
          description={
            <>{`Attention, veuillez noter que ce salarié effectue des missions pour différents secteurs d’activité 
              (${businesses.join(", ")}).`}</>
          }
        />
      )}
    </div>
  );
}
