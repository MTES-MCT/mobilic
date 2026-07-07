import React from "react";
import { useIsWidthUp } from "common/utils/useWidth";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { FieldTitle } from "../../../common/typography/FieldTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Box from "@mui/material/Box";


const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: "4px",
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default,
    padding: "8px 12px 12px 12px",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "50%"
    }
  },
  value: {
    fontWeight: 700,
    fontSize: "1.25rem",
    flexGrow: 1
  },
  button: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      justifyContent: "center"
    }
  },
  compactCard: {
    "& .fr-card__content": {
      padding: props => props.isOnDesktop ? "0.5rem  2rem" : "0.5rem 1rem",
      fontSize: props => props.isOnDesktop ? "1rem" : "0.875rem"
    },
    "& .fr-card__end": {
      display: "none"
    },
    "& .fr-card__footer": {
      padding: props => props.isOnDesktop ? "0.5rem 2rem" : "0.5rem 1rem",
      fontSize: props => props.isOnDesktop ? "1rem" : "0.875rem"
    }
  },
  smallIcon: {
    "&::before": {
      "--icon-size": props => props.isOnDesktop ? "1rem !important" : "0.75rem !important"
    }
  }
}));
export function ControllerControlNbCard({
  label,
  buttonLabel,
  nbElem,
  onClick
}) {
  const isOnDesktop = useIsWidthUp("md");
  const classes = useStyles({ isOnDesktop });
  return (
    <Stack direction="column" rowGap={1} className={classes.card} flexGrow={1}>
      <FieldTitle component="h2" flexGrow={1}>
        {label}
      </FieldTitle>
      <Box display="flex" flexWrap="wrap" alignItems="center" rowGap={1}>
        <Typography className={classes.value}>{nbElem}</Typography>
        <Button
          priority="secondary"
          size="small"
          onClick={e => {
            e.preventDefault();
            onClick();
          }}
          iconId="fr-icon-arrow-right-s-line"
          iconPosition="right"
          className={classes.button}
        >
          {buttonLabel}
        </Button>
      </Box>
    </Stack>
  );
}

export function ControllerControlNbCards({
  nbAlerts = null,
  nbWorkingDays = null,
  daysAddedPosterioriNumber = null,
  daysModifiedNumber = null,
  onChangeTab
}) {
  const isOnDesktop = useIsWidthUp("md");
  const classes = useStyles({ isOnDesktop });
  return (
    <Stack direction="row" columnGap={1}>
      
      {(nbWorkingDays || nbWorkingDays === 0) && (
        <Card 
        className={`fr-card ${classes.compactCard}`} style={{ flexGrow: 1, boxShadow: "0 5px var(--text-action-high-blue-france)" }}
        background
        border
        desc={
          <Stack direction="column" rowGap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
                <i className={`fr-icon-corner-down-right-line ${classes.smallIcon}`} style={{ color: "var(--text-action-high-blue-france)" }} aria-hidden="true" />
                <Typography component="span" variant="body2" color="text.secondary">
                  dont ajoutées à posteriori
                </Typography>
              </Box>
              <Box minWidth="60px" display="flex" justifyContent="center">
                <Typography component="span" fontWeight={600} fontSize={15} style={{ color: "var(--text-action-high-blue-france)" }}>
                  {daysAddedPosterioriNumber || 0}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
                <i className={`fr-icon-corner-down-right-line ${classes.smallIcon}`} style={{ color: "var(--text-action-high-blue-france)" }} aria-hidden="true" />
                <Typography component="span" variant="body2" color="text.secondary">
                  dont modifiées
                </Typography>
              </Box>
              <Box minWidth="60px" display="flex" justifyContent="center">
                <Typography component="span" fontWeight={600} fontSize={15} style={{ color: "var(--text-action-high-blue-france)" }}>
                  {daysModifiedNumber || 0}
                </Typography>
              </Box>
            </Box>
          </Stack>
        }
        footer={<a href="#" className="fr-link fr-icon-arrow-right-line fr-link--icon-right" onClick={(e) => { e.preventDefault(); onChangeTab("history"); }}>Voir le détail</a>}
        size="medium"
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Typography component="span" variant="body1" fontWeight={600}>
              Journées enregistrées
            </Typography>
            <Box minWidth="60px" display="flex" justifyContent="center">
              <Badge noIcon severity="info">{nbWorkingDays}</Badge>
            </Box>
          </Box>
        }
        titleAs="h3"/>
      )}
      {(nbAlerts || nbAlerts === 0) && (
        <ControllerControlNbCard
          label="Alertes réglementaires"
          buttonLabel="Alertes"
          nbElem={nbAlerts}
          onClick={() => onChangeTab("alerts")}
        />
      )}
    </Stack>
  );
}
