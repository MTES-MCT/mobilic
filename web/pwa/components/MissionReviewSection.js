import React from "react";
import omit from "lodash/omit";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
  children,
  ...other
}) {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(false);
  const className = `unshrinkable ${other.className || ""}`;
  return (
    <Box px={2} py={2} className={className} {...omit(other, ["className"])}>
      <Box className="flex-row-space-between full-width">
        <Typography align="left" className="bold">
          {title}
        </Typography>
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
        {onEdit && (
          <Button
            color="primary"
            size="small"
            variant="contained"
            className={classes.button}
            onClick={onEdit}
          >
            {editButtonLabel || "Editer"}
          </Button>
        )}
      </Box>
      {!displayExpandToggle || expand ? children : null}
    </Box>
  );
}
