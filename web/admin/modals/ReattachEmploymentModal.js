import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { LoadingButton } from "common/components/LoadingButton";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatPersonName } from "common/utils/coworkers";
import { isoFormatLocalDate } from "common/utils/time";
import { REATTACH_EMPLOYMENT_MUTATION } from "common/utils/apiQueries/employments";
import Modal from "../../common/Modal";

export default function ReattachEmploymentModal({
  open,
  handleClose,
  employee,
  onSuccess,
  allowTemporaryEmployees
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [attachmentType, setAttachmentType] = React.useState("permanent");
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const todayStr = isoFormatLocalDate(new Date());

  React.useEffect(() => {
    if (open && employee) {
      const defaultTemporary =
        employee.isTemporary && allowTemporaryEmployees;
      setAttachmentType(defaultTemporary ? "temporary" : "permanent");
      setEndDate("");
    }
    if (!open) {
      setAttachmentType("permanent");
      setEndDate("");
    }
  }, [open, employee, allowTemporaryEmployees]);

  const isTemporary = attachmentType === "temporary";
  const canSubmit =
    !isTemporary || (!!endDate && endDate >= todayStr);

  const handleSubmit = async () => {
    if (!employee || !canSubmit) return;

    setLoading(true);

    try {
      const response = await api.graphQlMutate(REATTACH_EMPLOYMENT_MUTATION, {
        userId: employee.userId,
        companyId: employee.companyId,
        ...(isTemporary ? { isTemporary: true, endDate } : {})
      });

      const { employment: newEmployment, emailSent } =
        response.data.employments.reattachEmployment;

      if (emailSent) {
        alerts.success(
          `${formatPersonName(employee)} a été rattaché(e) à l'entreprise`,
          "reattach-success",
          6000
        );
      } else {
        alerts.warning(
          `${formatPersonName(employee)} a été rattaché(e), mais l'email de notification n'a pas pu être envoyé`,
          "reattach-warning",
          6000
        );
      }

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
      title="Rattachement d'un salarié"
      size="sm"
      content={
        <>
          <p>
            <strong>{formatPersonName(employee)}</strong> sera rattaché(e) à
            votre entreprise et pourra de nouveau enregistrer du temps de
            travail.
          </p>
          {allowTemporaryEmployees && (
            <>
              <RadioButtons
                legend="Type de rattachement"
                orientation="vertical"
                options={[
                  {
                    label: "Permanent",
                    nativeInputProps: {
                      checked: attachmentType === "permanent",
                      onChange: () => setAttachmentType("permanent")
                    }
                  },
                  {
                    label: "Temporaire",
                    nativeInputProps: {
                      checked: attachmentType === "temporary",
                      onChange: () => setAttachmentType("temporary")
                    }
                  }
                ]}
              />
              {isTemporary && (
                <Input
                  label="Date de fin de rattachement"
                  nativeInputProps={{
                    type: "date",
                    value: endDate,
                    onChange: e => setEndDate(e.target.value),
                    min: todayStr
                  }}
                />
              )}
            </>
          )}
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
            Confirmer
          </LoadingButton>
        </>
      }
    />
  );
}
