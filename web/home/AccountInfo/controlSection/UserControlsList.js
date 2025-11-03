import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { textualPrettyFormatDayHour } from "common/utils/time";
import { useUserControls } from "common/utils/useUserControls";

export default function UserControlsList({ userId, onControlClick }) {
  const { userControls, loading, error } = useUserControls(userId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Erreur lors du chargement des contrôles: {error.message}
      </Alert>
    );
  }

  if (userControls.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="textSecondary">Aucun contrôle trouvé.</Typography>
      </Box>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Lieu de contrôle</TableCell>
          <TableCell width={40}></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {userControls.map(control => (
          <TableRow
            key={control.id}
            hover
            sx={{ cursor: onControlClick ? "pointer" : "default" }}
            onClick={() => onControlClick && onControlClick(control)}
          >
            <TableCell>
              {textualPrettyFormatDayHour(control.creationTime, true)}
            </TableCell>
            <TableCell>
              {control.controlBulletin?.locationLieu || "Non renseigné"}
            </TableCell>
            <TableCell align="right">
              <ChevronRightIcon
                sx={{
                  color: "textSecondary",
                  fontSize: "1.2rem"
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
