import React from "react";
import { RULE_RESPECT_STATUS } from "common/utils/regulation/rules";
import Box from "@mui/material/Box";
import { ALERT_TYPE_PROPS } from "common/utils/regulation/alertTypes";
import { Link } from "../../common/LinkButton";
import { useRegulationDrawer } from "../../landing/ResourcePage/RegulationDrawer";
import { ChevronRight } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  moreInfoIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.25),
    color: theme.palette.primary.main
  }
}));

export function RegulationCheck({ check }) {
  const openRegulationDrawer = useRegulationDrawer();

  const classes = useStyles();
  let color;
  let emoji;

  if (!check) return null;

  if (check.status === RULE_RESPECT_STATUS.success) {
    color = "success.main";
    emoji = "👏";
  } else if (check.status === RULE_RESPECT_STATUS.pending) {
    color = "warning.main";
    emoji = "🙂";
  } else {
    color = "error.main";
    emoji = "😢";
  }

  const alertProps = ALERT_TYPE_PROPS[check.rule];
  const rule = alertProps.rule;
  const message = alertProps.format(check.status, check.extra || {});

  return (
    <Box color={color} py={1} className="flex-row">
      <span>{` ${emoji}`}</span>
      <Box pl={1}>
        <Link
          variant="body2"
          color="inherit"
          onClick={e => {
            e.preventDefault();
            openRegulationDrawer(rule, true);
          }}
        >
          {message}
          <ChevronRight className={classes.moreInfoIcon} />
        </Link>
      </Box>
    </Box>
  );
}
