import React from "react";
import Checkbox from "@mui/material/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { LoadingButton } from "common/components/LoadingButton";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatPersonName } from "common/utils/coworkers";
import { isoFormatLocalDate } from "common/utils/time";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  BATCH_TERMINATE_MODAL_OPEN,
  BATCH_TERMINATE_MODAL_SUBMIT
} from "common/utils/matomoTags";
import { BATCH_TERMINATE_EMPLOYMENTS_MUTATION } from "common/utils/apiQueries/employments";
import Notice from "../../common/Notice";
import Modal from "../../common/Modal";

export default function TerminateEmploymentModal({
  open,
  handleClose,
  inactiveEmployees,
  onSuccess
}) {
  const api = useApi();
  const { trackEvent } = useMatomo();
  const alerts = useSnackbarAlerts();
  const formatDateForInput = date =>
    date ? date.toISOString().split("T")[0] : "";

  const todayForMaxDate = React.useMemo(() => new Date(), []);
  const [selectedEmployees, setSelectedEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const hasTrackedOpen = React.useRef(false);

  React.useEffect(() => {
    if (open && inactiveEmployees?.length > 0) {
      const today = new Date();
      if (!hasTrackedOpen.current) {
        trackEvent(BATCH_TERMINATE_MODAL_OPEN);
        hasTrackedOpen.current = true;
      }
      setSelectedEmployees(
        inactiveEmployees.map(emp => ({
          ...emp,
          selected: true,
          endDate: today,
          error: null
        }))
      );
    }
    if (!open) {
      hasTrackedOpen.current = false;
    }
  }, [open, inactiveEmployees, trackEvent]);

  const toggleEmployee = employmentId => {
    setSelectedEmployees(prev =>
      prev.map(emp =>
        emp.employmentId === employmentId
          ? { ...emp, selected: !emp.selected }
          : emp
      )
    );
  };

  const updateEndDate = (employmentId, newDate) => {
    setSelectedEmployees(prev =>
      prev.map(emp =>
        emp.employmentId === employmentId
          ? { ...emp, endDate: newDate, error: null }
          : emp
      )
    );
  };

  const setEmployeeError = (employmentId, error) => {
    setSelectedEmployees(prev =>
      prev.map(emp =>
        emp.employmentId === employmentId ? { ...emp, error } : emp
      )
    );
  };

  const selectedCount = selectedEmployees.filter(emp => emp.selected).length;

  const handleSubmit = async e => {
    e.preventDefault();
    const toTerminate = selectedEmployees.filter(emp => emp.selected);
    if (toTerminate.length === 0) return;

    setLoading(true);

    try {
      const response = await api.graphQlMutate(
        BATCH_TERMINATE_EMPLOYMENTS_MUTATION,
        {
          employments: toTerminate.map(emp => ({
            employmentId: emp.employmentId,
            endDate: isoFormatLocalDate(emp.endDate)
          }))
        }
      );

      const results =
        response.data.employments.batchTerminateEmployments || [];

      let successCount = 0;
      let errorCount = 0;

      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          setEmployeeError(result.employmentId, result.error);
        }
      });

      if (successCount > 0) {
        trackEvent(BATCH_TERMINATE_MODAL_SUBMIT(successCount));
        alerts.success(
          `${successCount} détachement(s) effectué(s)`,
          "batch-terminate-success",
          6000
        );
        if (onSuccess) {
          onSuccess(results.filter(r => r.success).map(r => r.employmentId));
        }
      }

      if (errorCount === 0) {
        handleClose();
      }
    } catch (err) {
      alerts.error(
        "Une erreur est survenue lors du détachement",
        "batch-terminate-error",
        6000
      );
    }

    setLoading(false);
  };

  return (
    <Modal
      size="lg"
      open={open}
      handleClose={handleClose}
      title="Fin du rattachement"
      content={
        <>
          <Notice
            type="warning"
            description={
              <>
                Cette opération signale le départ d'un salarié : après la date
                choisie le salarié ne pourra plus enregistrer de temps de
                travail pour l'entreprise, ni accéder aux informations de
                l'entreprise.
                <br />
                En tant que gestionnaire, vous ne pourrez plus ajouter de
                missions dans le passé pour le compte de ce salarié.
              </>
            }
          />
          <form id="terminate-employment-form" onSubmit={handleSubmit}>
            <div className="fr-table fr-table--bordered fr-table--layout-fixed">
              <table>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      style={{
                        width: "10%",
                        minWidth: "auto",
                        borderRight: "1px solid var(--border-default-grey)"
                      }}
                    ></th>
                    <th scope="col" style={{ width: "45%" }}>Salarié</th>
                    <th scope="col" style={{ width: "45%" }}>
                      Date de fin de rattachement
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmployees.map(emp => (
                    <tr key={emp.employmentId}>
                      <td
                        style={{
                          textAlign: "center",
                          backgroundColor: "var(--background-alt-grey)",
                          borderRight: "1px solid var(--border-default-grey)"
                        }}
                      >
                        <Checkbox
                          checked={emp.selected}
                          onChange={() => toggleEmployee(emp.employmentId)}
                          inputProps={{
                            "aria-label": `Sélectionner ${formatPersonName(emp)}`
                          }}
                          sx={{ padding: 0 }}
                        />
                      </td>
                      <td>{formatPersonName(emp)}</td>
                      <td>
                        <Input
                          label={null}
                          hideLabel
                          disabled={!emp.selected}
                          style={{ marginBottom: 0, maxWidth: "200px" }}
                          state={emp.error ? "error" : "default"}
                          stateRelatedMessage={emp.error}
                          nativeInputProps={{
                            type: "date",
                            value: formatDateForInput(emp.endDate),
                            onChange: e =>
                              updateEndDate(
                                emp.employmentId,
                                e.target.value ? new Date(e.target.value) : null
                              ),
                            max: formatDateForInput(todayForMaxDate),
                            min: emp.startDate
                              ? formatDateForInput(new Date(emp.startDate))
                              : undefined
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </>
      }
      actions={
        <>
          <LoadingButton
            type="submit"
            form="terminate-employment-form"
            disabled={selectedCount === 0}
            loading={loading}
          >
            Mettre fin
          </LoadingButton>
        </>
      }
    />
  );
}
