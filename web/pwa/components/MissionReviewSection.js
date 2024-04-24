import React from "react";
import omit from "lodash/omit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  button: {
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25)
  }
}));

export function MissionReviewSection({
  title,
  displayExpandToggle,
  onEdit,
  editButtonLabel,
  headingLevel = "",
  children,
  ...other
}) {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(false);
  const className = `unshrinkable ${other.className || ""}`;
  return (
    <Box px={2} py={2} className={className} {...omit(other, ["className"])}>
      <Box className="flex-row-space-between full-width">
        <Typography
          align="left"
          className="bold"
          component={headingLevel || undefined}
        >
          {title}
        </Typography>
        {onEdit && (
          <Button
            color="primary"
            size="small"
            variant="contained"
            className={classes.button}
            onClick={onEdit}
          >
            {editButtonLabel || "Modifier"}
          </Button>
        )}
        {displayExpandToggle && (
          <Button
            color="primary"
            size="small"
            onClick={() => setExpand(!expand)}
            endIcon={expand ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          >
            {expand ? "Masquer" : "Afficher"}
          </Button>
        )}
      </Box>
      {!displayExpandToggle || expand ? children : null}
    </Box>
  );
}
