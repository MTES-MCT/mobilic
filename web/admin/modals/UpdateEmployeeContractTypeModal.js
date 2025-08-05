import React from "react";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { snoozeContractType } from "common/utils/updateContractType";
import Modal from "../../common/Modal";
import Notice from "../../common/Notice";

export default function UpdateEmployeeContractTypeModal({
  onStartSetup,
  onClose
}) {
  const handleSnooze = () => {
    snoozeContractType();
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = () => {
    onStartSetup();
  };

  return (
    <Modal
      open={true}
      handleClose={handleSnooze}
      size="sm"
      title="Nombre de salariés concernés par Mobilic et type de contrat"
      content={
        <>
          <p>
            Ces informations sont nécessaires au calcul de votre certificat.
            Elles seront ensuite modifiable depuis votre espace.
          </p>
          <Notice
            type="warning"
            description={
              <>
                Vous avez jusqu'au 20/08/2025 pour renseigner cette information{" "}
              </>
            }
          />
        </>
      }
      actions={
        <>
          <Button priority="secondary" onClick={handleSnooze}>
            Reporter à plus tard
          </Button>
          <Button onClick={handleSubmit}>Commencer</Button>
        </>
      }
    />
  );
}
