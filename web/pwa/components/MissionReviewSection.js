import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";

export function MissionReviewSection({
  title,
  displayExpandToggle,
  className,
  children
}) {
  const [expand, setExpand] = React.useState(false);
  return (
    <Box px={2} py={1} className={className}>
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
      </Box>
      {!displayExpandToggle || expand ? children : null}
    </Box>
  );
}
