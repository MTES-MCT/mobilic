import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { AdminObservationCard } from "./AdminObservationCard";
import { useMissionDetailsStyles } from "./MissionDetailsStyle";
import { useModals } from "common/utils/modals";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Description } from "../../../common/typography/Description";

export function MissionDetailsObservations({
  mission,
  missionActions,
  titleProps = {},
  addEmployeeAction = null
}) {
  const classes = useMissionDetailsStyles();
  const modals = useModals();
  return (
  <>
    <Box
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
        <Box className={classes.comments}>
          {mission.comments.map(comment => (
            <AdminObservationCard
              key={comment.id}
              comment={comment}
              onDelete={() => missionActions.deleteComment(comment)}
            />
          ))}
        </Box>
      ) : (
        <Description>Aucune observation sur cette mission</Description>
      )}
    </Box>
    {addEmployeeAction && (
      <Box className={classes.addEmployeeButton}>
        <Button
          priority="tertiary"
          iconId="fr-icon-add-line"
          iconPosition="right"
          onClick={addEmployeeAction}
        >
          Ajouter un coéquipier
        </Button>
      </Box>
    )}
    <Box className={classes.separator} />
  </>
  );
}
