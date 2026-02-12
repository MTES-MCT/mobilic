import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function EmployeeProgressBar({ progressData }) {
  const theme = useTheme();

  if (!progressData) {
    return null;
  }

  const getProgressColor = color => {
    switch (color) {
      case "info":
        return { backgroundColor: theme.palette.primary.main };
      case "warning":
        return { backgroundColor: theme.palette.warning.light };
      case "success":
        return { color: "success" };
      case "error":
        return { color: "error" };
      default:
        return { backgroundColor: theme.palette.primary.main };
    }
  };

  const colorProps = getProgressColor(progressData.color);

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Typography mb={1}>
        Inscrits sur Mobilic : {progressData.registeredEmployees} sur{" "}
        {progressData.declaredNbWorkers}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: "300px" }}>
          <LinearProgress
            variant="determinate"
            value={progressData.percentage}
            {...(colorProps.color ? { color: colorProps.color } : {})}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                ...(colorProps.backgroundColor && {
                  backgroundColor: colorProps.backgroundColor
                })
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
