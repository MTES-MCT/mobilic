import some from "lodash/some";
import {
  countExpendituresByType,
  EXPENDITURES,
  regroupExpendituresSpendingDateByType
} from "common/utils/expenditures";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import { MissionInfoCard } from "./MissionInfoCard";
import React from "react";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";

export const useStyles = makeStyles(theme => ({
  noExpenditureLabel: {
    color: theme.palette.grey[500],
    fontStyle: "italic"
  }
}));

export function ExpendituresCard({
  title,
  editModalTitle,
  expenditures,
  onEditExpenditures,
  minSpendingDate,
  maxSpendingDate,
  loading
}) {
  const classes = useStyles();
  const modals = useModals();

  const expenditureCount = Array.isArray(expenditures)
    ? countExpendituresByType(expenditures)
    : expenditures;
  const hasExpenditures = some(
    expenditureCount,
    (count, exp) => count && count > 0
  );

  return (
    <MissionInfoCard
      loading={loading}
      title={title}
      onActionButtonClick={
        onEditExpenditures && Array.isArray(expenditures)
          ? () => {
              modals.open("expenditures", {
                currentExpenditures: regroupExpendituresSpendingDateByType(
                  expenditures
                ),
                title: editModalTitle,
                missionStartTime: minSpendingDate,
                missionEndTime: maxSpendingDate,
                handleSubmit: exps => onEditExpenditures(exps, expenditures)
              });
            }
          : null
      }
      actionButtonLabel="Modifier"
    >
      {hasExpenditures ? (
        <Grid spacing={1} container>
          {Object.keys(expenditureCount).map(exp => {
            const expProps = EXPENDITURES[exp];
            const expCount = expenditureCount[exp];
            const label =
              expCount > 1 ? `${expCount} ${expProps.plural}` : expProps.label;
            return (
              expCount > 0 && (
                <Grid item key={exp}>
                  <Chip label={label} />
                </Grid>
              )
            );
          })}
        </Grid>
      ) : (
        <Typography className={classes.noExpenditureLabel}>
          Aucun frais n'a été enregistré pour cette journée
        </Typography>
      )}
    </MissionInfoCard>
  );
}
