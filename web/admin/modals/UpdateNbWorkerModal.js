import React from "react";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useAdminCompanies, useAdminStore } from "../store/store";
import { useUpdateCompanyDetails } from "../../common/useUpdateCompanyDetails";
import { useApi } from "common/utils/api";
import { SNOOZE_NB_WORKER_INFO } from "common/utils/apiQueries";
import { clearUpdateTimeCookie, snooze } from "common/utils/updateNbWorker";
import Modal from "../../common/Modal";
import {
  NbWorkersInput,
  MIN_NB_WORKERS,
  MAX_NB_WORKERS
} from "../../common/forms/NbWorkersInput";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";

export default function UpdateNbWorkerModal() {
  const api = useApi();
  const adminStore = useAdminStore();
  const [, company] = useAdminCompanies();
  const alerts = useSnackbarAlerts();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = async () => {
    try {
      await api.graphQlMutate(
        SNOOZE_NB_WORKER_INFO,
        {
          employmentId: adminStore.employmentId
        },
        { context: { nonPublicApi: true } }
      );
      snooze();
      setIsOpen(false);
    } catch (err) {
      alerts.error(formatApiError(err), "", 6000);
    }
  };

  const {
    newNbWorkers,
    setNewNbWorkers,
    updateCompanyDetails
  } = useUpdateCompanyDetails(company, adminStore, () => {
    clearUpdateTimeCookie();
    setIsOpen(false);
  });

  const canSubmit = React.useMemo(
    () =>
      newNbWorkers &&
      newNbWorkers >= MIN_NB_WORKERS &&
      newNbWorkers <= MAX_NB_WORKERS &&
      newNbWorkers !== company?.nbWorkers,
    [newNbWorkers, company?.nbWorkers]
  );

  const handleSubmit = async () => {
    await updateCompanyDetails(false);
  };

  const canClose = !adminStore.shouldForceNbWorkerInfo;

  return (
    <Modal
      open={isOpen}
      handleClose={canClose ? handleClose : undefined}
      title="Nombre de chauffeurs et/ou travailleurs mobiles"
      content={
        <>
          <NbWorkersInput
            label="Veuillez renseigner le nombre de salariés concernés par Mobilic:"
            value={newNbWorkers}
            onChangeValue={setNewNbWorkers}
            required={false}
          />
          <p>Cette information est nécéssaire au calcul de votre certificat.</p>
        </>
      }
      actions={
        <>
          {canClose && (
            <Button onClick={handleClose} priority="secondary">
              Me le rappeler plus tard
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Confirmer
          </Button>
        </>
      }
    />
  );
}
