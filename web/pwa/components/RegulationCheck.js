import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import WarningIcon from "@material-ui/icons/Warning";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { RULE_RESPECT_STATUS } from "common/utils/regulation/rules";
import Box from "@material-ui/core/Box";
import { ALERT_TYPE_PROPS } from "common/utils/regulation/alertTypes";
import { Link } from "../../common/LinkButton";
import { useRegulationDrawer } from "../../landing/ResourcePage/RegulationDrawer";

export function RegulationCheck({ check, rule }) {
  const openRegulationDrawer = useRegulationDrawer();

  let color;
  let icon;
  let emoji;

  if (!check) return null;

  if (check.status === RULE_RESPECT_STATUS.success) {
    color = "success.main";
    icon = props => <CheckIcon {...props} />;
    emoji = "👏";
  } else if (check.status === RULE_RESPECT_STATUS.pending) {
    color = "warning.main";
    icon = props => <ScheduleIcon {...props} />;
    emoji = "🙂";
  } else {
    color = "error.main";
    icon = props => <WarningIcon {...props} />;
    emoji = "😢";
  }

  const alertProps = ALERT_TYPE_PROPS[check.rule];
  const message = alertProps.format(check.status, check.extra || {});

  return (
    <Box color={color} py={1} className="flex-row">
      {icon({
        className: "regulation-check-icon",
        color: "inherit",
        fontSize: "small"
      })}
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
          <span>{` ${emoji}`}</span>
        </Link>
      </Box>
    </Box>
  );
}
