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
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  expenditureChip: {
    "&.MuiChip-root": {
      backgroundColor: fr.colors.decisions.background.contrast.grey.default,
      borderRadius: 16,
      height: 32,
      padding: "4px 12px",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: "24px",
      color: fr.colors.decisions.text.label.grey.default
    },
    "& .MuiChip-label": {
      padding: 0
    }
  }
}));

export function ExpendituresCard({
  title,
  editModalTitle,
  expenditures,
  onEditExpenditures,
  minSpendingDate,
  maxSpendingDate,
  loading,
  titleProps = {},
  cardClassName = ""
}) {
  const modals = useModals();
  const classes = useStyles();

  const expenditureCount = Array.isArray(expenditures)
    ? countExpendituresByType(expenditures)
    : expenditures;
  const hasExpenditures = some(
    expenditureCount,
    (count, exp) => count && count > 0
  );

  return (
    <MissionInfoCard
      className={cardClassName}
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
      actionButtonLabel="Modifier les frais"
      actionButtonPriority="secondary"
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
                  <Chip label={label} className={classes.expenditureChip} />
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
