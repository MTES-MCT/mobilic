import React from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { HTTP_QUERIES } from "common/utils/apiQueries";

const useStyles = makeStyles(theme => ({
  modalFooter: {
    marginLeft: "auto"
  }
}));

export default function ExportExcelOne({ open, handleClose, controlId }) {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  return (
    <Modal isOpen={open} hide={handleClose} size="lg">
      <ModalTitle>Exportez le contrôle #{controlId}</ModalTitle>
      <ModalContent>
        <p>
          Mobilic permet d'exporter les données des salariés contrôlés au format
          Excel (.xlsx).
        </p>
      </ModalContent>
      <ModalFooter>
        <Button
          title="téléchargement"
          className={classes.modalFooter}
          onClick={async () =>
            alerts.withApiErrorHandling(async () => {
              const options = {
                control_id: controlId
              };
              await api.downloadFileHttpQuery(HTTP_QUERIES.controlExcelExport, {
                json: options
              });
            }, "download-control-export")
          }
        >
          Télécharger
        </Button>
      </ModalFooter>
    </Modal>
  );
}
