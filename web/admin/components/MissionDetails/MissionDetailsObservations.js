import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import { Event } from "../../../common/Event";
import { useMissionDetailsStyles } from "./MissionDetailsStyle";
import { useModals } from "common/utils/modals";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function MissionDetailsObservations({
  mission,
  missionActions,
  titleProps = {}
}) {
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
          <Typography variant="h5" {...titleProps} className={classes.vehicle}>
            Observations
          </Typography>
        </Grid>
        <Grid item>
          <Button
            priority="secondary"
            size="small"
            iconId="fr-icon-add-line"
            iconPosition="left"
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
