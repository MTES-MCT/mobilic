import React from "react";
import Checkbox from "@mui/material/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { formatPersonName } from "common/utils/coworkers";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  BATCH_TERMINATE_MODAL_OPEN,
  BATCH_TERMINATE_MODAL_SUBMIT
} from "common/utils/matomoTags";
import Notice from "../../common/Notice";
import Modal from "../../common/Modal";

export default function TerminateEmploymentModal({
  open,
  handleClose,
  inactiveEmployees,
  terminateEmployment
}) {
  const { trackEvent } = useMatomo();
  const alerts = useSnackbarAlerts();
  const formatDateForInput = date =>
    date ? date.toISOString().split("T")[0] : "";

  const [selectedEmployees, setSelectedEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const hasTrackedOpen = React.useRef(false);
  const todayForMaxDate = React.useRef(null);

  React.useEffect(() => {
    if (open && inactiveEmployees?.length > 0) {
      if (!hasTrackedOpen.current) {
        trackEvent(BATCH_TERMINATE_MODAL_OPEN);
        hasTrackedOpen.current = true;
        // Create a fresh date when modal opens
        const today = new Date();
        todayForMaxDate.current = today;
        // Initialize selected employees only once when modal opens
        setSelectedEmployees(
          inactiveEmployees.map(emp => ({
            ...emp,
            selected: true,
            endDate: today,
            error: null
          }))
        );
      }
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
    let successCount = 0;
    let errorCount = 0;

    for (const emp of toTerminate) {
      try {
        await terminateEmployment(emp.employmentId, emp.endDate);
        successCount++;
      } catch (err) {
        errorCount++;
        const errorMessage = graphQLErrorMatchesCode(err, "INVALID_INPUTS")
          ? "La date de fin doit être postérieure à la date de début."
          : formatApiError(err);
        setEmployeeError(emp.employmentId, errorMessage);
      }
    }

    if (successCount > 0) {
      trackEvent(BATCH_TERMINATE_MODAL_SUBMIT(successCount));
      alerts.success(
        `${successCount} détachement(s) terminé(s)`,
        "batch-terminate-success",
        6000
      );
    }

    setLoading(false);
    if (errorCount === 0) {
      handleClose();
    }
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
                            max: formatDateForInput(todayForMaxDate.current),
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
