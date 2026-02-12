import React from "react";
import { ALERT_TYPE_PROPS_SIMPLER } from "common/utils/regulation/alertTypes";
import { useRegulationDrawer } from "../../landing/ResourcePage/RegulationDrawer";
import { makeStyles } from "@mui/styles";
import { Stack, Typography } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles((theme) => ({
  linkButton: {
    textDecoration: "underline",
    textUnderlineOffset: "6px"
  },
  card: {
    backgroundColor: "white",
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2)
  },
  warningTag: {
    color: fr.colors.decisions.background.flat.warning.default,
    backgroundColor: fr.colors.decisions.background.contrast.warning.default,
    fontSize: "0.75rem"
  },
  coloredBackground: {
    backgroundColor: "#FEF4F4"
  }
}));

export function SimplerRegulationCheck({
  regulationCheck,
  employeeView = false,
}) {
  const { alert, type } = regulationCheck;
  const extra = alert?.extra ? JSON.parse(alert.extra) : {};
  const alertProps = ALERT_TYPE_PROPS_SIMPLER[type];
  const rule = alertProps.rule;
  const tag = alertProps.getTag(extra);

  return (
    <Check
      rule={rule}
      tag={tag}
      title={alertProps.title}
      employeeView={employeeView}
    />
  );
}

function Check({ title, rule, tag, employeeView = false }) {
  const openRegulationDrawer = useRegulationDrawer();
  const classes = useStyles();

  if (employeeView) {
    return (
      <Stack
        direction="column"
        justifyContent="space-between"
        className={classes.coloredBackground}
        alignItems="start"
        p={2}
        rowGap={1}
      >
        <Typography fontWeight={500} textAlign="left">
          {title}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          {tag && (
            <Tag
              className={classes.warningTag}
              style={{ paddingRight: "0.5rem", paddingLeft: "0.5rem" }}
            >
              {tag}
            </Tag>
          )}
          <Button
            priority="tertiary no outline"
            onClick={() => openRegulationDrawer(rule, true)}
            size="small"
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            className={classes.linkButton}
          />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      className={classes.card}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" columnGap={2} alignItems="center">
        <Typography fontWeight={500}>{title}</Typography>
        {tag && <Tag className={classes.warningTag}>{tag}</Tag>}
      </Stack>
      <Button
        priority="tertiary no outline"
        onClick={() => openRegulationDrawer(rule, true)}
        size="small"
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
        className={classes.linkButton}
      >
        Détail du seuil
      </Button>
    </Stack>
  );
}
