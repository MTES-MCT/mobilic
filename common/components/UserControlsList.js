import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from "@mui/material";
import { formatDateTime } from "../utils/time";
import { useUserControls } from "../utils/useUserControls";
import { useDownloadBDC } from "../../web/controller/utils/useDownloadBDC";
import { useSnackbarAlerts } from "../../web/common/Snackbar";

export default function UserControlsList({ userId, onControlClick }) {
  const { userControls, loading, error } = useUserControls(userId);
  const downloadBDC = useDownloadBDC();
  const alerts = useSnackbarAlerts();

  const handleDownloadControl = async control => {
    try {
      await downloadBDC(control.controlBulletin?.id);
    } catch (err) {
      alerts.error(
        "Erreur lors du téléchargement du bulletin de contrôle",
        "",
        6000
      );
    }
  };

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
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mes contrôles
          </Typography>
          <Typography color="text.secondary">Aucun contrôle trouvé.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Mes contrôles ({userControls.length})
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Infractions</TableCell>
              <TableCell>Contrôleur</TableCell>
              <TableCell>Actions</TableCell>
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
                  {formatDateTime(control.creationTime, { withSeconds: false })}
                </TableCell>
                <TableCell>
                  {control.controlBulletin?.locationLieu || "Non renseigné"}
                </TableCell>
                <TableCell>{control.nbReportedInfractions || 0}</TableCell>
                <TableCell>
                  {control.controllerUser
                    ? `${control.controllerUser.firstName} ${control.controllerUser.lastName}`
                    : "Non renseigné"}
                </TableCell>
                <TableCell>
                  {control.controlBulletin && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        handleDownloadControl(control);
                      }}
                    >
                      Télécharger
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
