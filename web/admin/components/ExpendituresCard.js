import some from "lodash/some";
import {
  countExpendituresByType,
  EXPENDITURES,
  regroupExpendituresSpendingDateByType
} from "common/utils/expenditures";
import Chip from "@mui/material/Chip";
import { MissionInfoCard } from "./MissionInfoCard";
import React from "react";
import Grid from "@mui/material/Grid";
import { useModals } from "common/utils/modals";
import { Description } from "../../common/typography/Description";

export function ExpendituresCard({
  title,
  editModalTitle,
  expenditures,
  onEditExpenditures,
  minSpendingDate,
  maxSpendingDate,
  loading,
  titleProps = {}
}) {
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
      titleProps={titleProps}
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
        <Description>
          Aucun frais n'a été enregistré pour cette journée
        </Description>
      )}
    </MissionInfoCard>
  );
}
