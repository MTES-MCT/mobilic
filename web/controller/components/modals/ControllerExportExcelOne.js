import React from "react";
import { Modal, ModalTitle, ModalContent } from "@dataesr/react-dsfr";

export default function ExportExcelOne({ open, handleClose }) {
  return (
    <Modal isOpen={open} hide={handleClose} size="lg">
      <ModalTitle>Exportez le contrôle XXXX</ModalTitle>
      <ModalContent>
        <p>
          Mobilic permet d'exporter les données des salariés contrôlés au format
          Excel (.xlsx)
        </p>
        <p>Conditions d’export</p>
        <p>
          Le téléchargement produit un fichier Excel qui contient les données
          d’activité du contrôle Mobilic sélectionné. Les données du salarié
          sont limitées à une période qui ne peut pas dépasser les 28 jours
          précédents le contôle (ainsi que la journée “en cours” lors du
          contôle).
        </p>
      </ModalContent>
    </Modal>
  );
}
