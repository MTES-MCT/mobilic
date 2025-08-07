import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

export function EmployeeProgressBar({ progressData }) {
  if (!progressData) {
    return null;
  }

  const getProgressColor = color => {
    switch (color) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
        return "info";
      default:
        return "primary";
    }
  };

  return (
    <Box sx={{ marginBottom: 3, maxWidth: 400 }}>
      <Typography mb={1}>
        Salariés inscrits sur Mobilic : {progressData.registeredEmployees} sur{" "}
        {progressData.declaredNbWorkers}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: "300px" }}>
          <LinearProgress
            variant="determinate"
            value={progressData.percentage}
            color={getProgressColor(progressData.color)}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5
              }
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {progressData.percentage}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
