import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { makeStyles } from "@mui/styles";
import { textualPrettyFormatDayHour } from "common/utils/time";
import { useUserControls } from "common/utils/useUserControls";

const useStyles = makeStyles(theme => ({
  table: {
    "& thead": {
      backgroundColor: "var(--background-contrast-grey)"
    },
    "& th": {
      fontWeight: 700,
      fontSize: "0.875rem",
      color: "var(--text-default-grey)",
      borderBottom: "2px solid var(--text-default-grey)"
    },
    "& tbody": {
      backgroundColor: "var(--background-alt-grey)"
    },
    "& tbody tr": {
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "var(--background-contrast-grey-hover) !important"
      }
    },
    "& td": {
      borderBottom: "1px solid var(--border-default-grey)"
    }
  }
}));

export default function UserControlsList({ userId, onControlClick }) {
  const classes = useStyles();
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
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Lieu de contrôle</TableCell>
          <TableCell width={40}>
            <span className="fr-sr-only">Actions</span>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {userControls.map(control => (
          <TableRow
            key={control.id}
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
