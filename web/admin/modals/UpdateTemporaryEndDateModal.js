import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { LoadingButton } from "common/components/LoadingButton";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { formatPersonName } from "common/utils/coworkers";
import { isoFormatLocalDate } from "common/utils/time";
import { UPDATE_TEMPORARY_END_DATE_MUTATION } from "common/utils/apiQueries/employments";
import Modal from "../../common/Modal";

export default function UpdateTemporaryEndDateModal({
  open,
  handleClose,
  employee,
  onSuccess,
}) {
  const api = useApi();
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const todayStr = isoFormatLocalDate(new Date());

  React.useEffect(() => {
    if (open && employee?.endDate) {
      setEndDate(employee.endDate);
    }
    if (!open) {
      setEndDate("");
      setError(null);
    }
  }, [open, employee]);

  const isPastDate = !!endDate && endDate < todayStr;
  const canSubmit = !!endDate && !isPastDate;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.graphQlMutate(
        UPDATE_TEMPORARY_END_DATE_MUTATION,
        {
          employmentId: employee.employmentId,
          endDate,
        },
      );

      const updatedEmployment =
        response.data.employments.updateTemporaryEndDate;

      if (onSuccess) {
        onSuccess(updatedEmployment);
      }

      handleClose();
    } catch (err) {
      setError(formatApiError(err));
    }

    setLoading(false);
  };

  if (!employee) return null;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Mise à jour de la fin de rattachement"
      size="sm"
      content={
        <>
          <p>
            <strong>{formatPersonName(employee)}</strong> sera automatiquement
            détaché(e) de l'entreprise à la date indiquée.
          </p>
          <Input
            label="Date de fin de rattachement"
            state={error || isPastDate ? "error" : "default"}
            stateRelatedMessage={
              error ||
              (isPastDate
                ? "La date de fin ne peut pas être antérieure à aujourd'hui. Pour mettre fin au rattachement maintenant, utilisez « Détacher »."
                : "")
            }
            nativeInputProps={{
              type: "date",
              value: endDate,
              onChange: (e) => setEndDate(e.target.value),
              min: todayStr,
            }}
          />
        </>
      }
      actions={
        <>
          <Button priority="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
          >
            Enregistrer la date
          </LoadingButton>
        </>
      }
    />
  );
}
