import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { Event } from "../../../common/Event";
import { useMissionDetailsStyles } from "./MissionDetailsStyle";
import { useModals } from "common/utils/modals";

export function MissionDetailsObservations({ mission, missionActions }) {
  const classes = useMissionDetailsStyles();
  const modals = useModals();
  return (
    <Box
      pb={4}
      style={{ alignItems: "center" }}
      className={classes.observationSection}
    >
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h5" className={classes.vehicle}>
            Observations
          </Typography>
        </Grid>
        <Grid item>
          <Button
            aria-label="Ajouter une observation"
            color="primary"
            variant="outlined"
            size="small"
            className={classes.smallTextButton}
            onClick={() => {
              modals.open("commentInput", {
                handleContinue: missionActions.createComment
              });
            }}
          >
            Ajouter une observation
          </Button>
        </Grid>
      </Grid>
      {mission.comments.length > 0 ? (
        <List className={classes.comments}>
          {mission.comments.map(comment => (
            <Event
              key={comment.id}
              text={comment.text}
              time={comment.receptionTime}
              submitter={comment.submitter}
              submitterId={comment.submitterId}
              withFullDate={true}
              cancel={() => missionActions.deleteComment(comment)}
            />
          ))}
        </List>
      ) : (
        <Typography className={classes.noCommentText}>
          Aucune observation sur cette mission
        </Typography>
      )}
    </Box>
  );
}
