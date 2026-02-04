import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { LoadingButton } from "common/components/LoadingButton";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatPersonName } from "common/utils/coworkers";
import { REATTACH_EMPLOYMENT_MUTATION } from "common/utils/apiQueries/employments";
import Modal from "../../common/Modal";

export default function ReattachEmploymentModal({
  open,
  handleClose,
  employee,
  onSuccess
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!employee) return;

    setLoading(true);

    try {
      const response = await api.graphQlMutate(REATTACH_EMPLOYMENT_MUTATION, {
        userId: employee.userId,
        companyId: employee.companyId
      });

      const newEmployment = response.data.employments.reattachEmployment;

      alerts.success(
        `${formatPersonName(employee)} a été rattaché(e) à l'entreprise`,
        "reattach-success",
        6000
      );

      if (onSuccess) {
        onSuccess(newEmployment);
      }

      handleClose();
    } catch {
      alerts.error(
        "Une erreur est survenue lors du rattachement",
        "reattach-error",
        6000
      );
    }

    setLoading(false);
  };

  if (!employee) return null;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Rattacher le salarié"
      content={
        <p>
          <strong>{formatPersonName(employee)}</strong> sera rattaché(e) à votre
          entreprise.
        </p>
      }
      actions={
        <>
          <Button priority="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <LoadingButton onClick={handleSubmit} loading={loading}>
            Confirmer
          </LoadingButton>
        </>
      }
    />
  );
}
