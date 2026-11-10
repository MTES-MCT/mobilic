import React from "react";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { LoadingButton } from "common/components/LoadingButton";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { isoFormatLocalDate } from "common/utils/time";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { BATCH_INVITE_MODAL_SUBMIT } from "common/utils/matomoTags";
import useListEntries from "../hooks/useListEntries";
import ListInput, { entryLabel } from "../components/ListInput";

const useStyles = makeStyles((theme) => ({
  entryRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1, 0),
    "&:not(:last-child)": {
      borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
  },
  checkboxGroup: {
    flex: 1,
    marginBottom: 0,
  },
  dateInputGroup: {
    flexShrink: 0,
    width: theme.spacing(27.5),
    marginBottom: 0,
  },
  dateLabel: {
    fontSize: "0.875rem",
  },
}));

function entrySafeId(prefix, entry) {
  return `${prefix}-${entry.value.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

export default function InviteEmployeesListModal({
  open,
  handleClose,
  handleSubmit,
  allowTemporaryEmployees = false,
}) {
  const classes = useStyles();
  const { trackEvent } = useMatomo();
  const list = useListEntries();
  const [step, setStep] = React.useState(1);
  const [temporarySet, setTemporarySet] = React.useState(new Set());
  const [endDates, setEndDates] = React.useState({});
  const [adminSet, setAdminSet] = React.useState(new Set());

  const skipStep2 = !allowTemporaryEmployees;
  const todayStr = isoFormatLocalDate(new Date());

  const _handleClose = () => {
    list.reset();
    setStep(1);
    setTemporarySet(new Set());
    setEndDates({});
    setAdminSet(new Set());
    handleClose();
  };

  const handleRemoveEntry = (value) => {
    list.removeEntry(value);
    setTemporarySet((prev) => {
      const s = new Set(prev);
      s.delete(value);
      return s;
    });
    setEndDates((prev) => {
      const { [value]: _, ...rest } = prev;
      return rest;
    });
    setAdminSet((prev) => {
      const s = new Set(prev);
      s.delete(value);
      return s;
    });
  };

  const goNext = () => {
    if (step === 1) {
      const final = list.finalizeEntries();
      if (!final || final.length === 0) return;
      setStep(skipStep2 ? 3 : 2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const goPrev = () => {
    if (step === 3) setStep(skipStep2 ? 1 : 2);
    else if (step === 2) setStep(1);
  };

  const toggleTemporary = (value) => {
    setTemporarySet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
        setAdminSet((pa) => {
          const s = new Set(pa);
          s.delete(value);
          return s;
        });
      }
      return next;
    });
  };

  const toggleAdmin = (value) => {
    setAdminSet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const isStep2Valid = React.useMemo(() => {
    for (const value of temporarySet) {
      if (!endDates[value] || endDates[value] < todayStr) return false;
    }
    return true;
  }, [temporarySet, endDates, todayStr]);

  const nonTemporaryEntries = React.useMemo(
    () => list.entries.filter((e) => !temporarySet.has(e.value)),
    [list.entries, temporarySet],
  );

  const allTemporary =
    list.entries.length > 0 && nonTemporaryEntries.length === 0;

  const canProceedStep1 = list.entries.length > 0 || !!list.text.trim();

  const handleFinalSubmit = async () => {
    const apiEntries = list.entries.map((entry) => {
      const isTemp = temporarySet.has(entry.value);
      return {
        ...(entry.type === "id"
          ? { userId: parseInt(entry.value, 10) }
          : { mail: entry.value }),
        hasAdminRights: !isTemp && adminSet.has(entry.value),
        isTemporary: isTemp,
        ...(isTemp ? { endDate: endDates[entry.value] } : {}),
      };
    });
    trackEvent(BATCH_INVITE_MODAL_SUBMIT(apiEntries.length));
    const success = await handleSubmit({ invitations: apiEntries });
    if (success) _handleClose();
  };

  const renderCheckboxRow = (entry, { checked, onChange, showDate }) => {
    const cbId = entrySafeId("cb", entry);
    const dateId = entrySafeId("date", entry);
    return (
      <div key={entry.value} className={classes.entryRow}>
        <div
          className={`${fr.cx("fr-checkbox-group")} ${classes.checkboxGroup}`}
        >
          <input
            type="checkbox"
            id={cbId}
            checked={checked}
            onChange={onChange}
          />
          <label className={fr.cx("fr-label")} htmlFor={cbId}>
            {entryLabel(entry)}
          </label>
        </div>
        {checked && showDate && (
          <div
            className={`${fr.cx("fr-input-group")} ${classes.dateInputGroup}`}
          >
            <label
              className={`${fr.cx("fr-label")} ${classes.dateLabel}`}
              htmlFor={dateId}
            >
              Fin du rattachement
            </label>
            <input
              className={fr.cx("fr-input")}
              type="date"
              id={dateId}
              value={endDates[entry.value] || ""}
              onChange={(e) =>
                setEndDates((prev) => ({
                  ...prev,
                  [entry.value]: e.target.value,
                }))
              }
              min={todayStr}
            />
          </div>
        )}
      </div>
    );
  };

  let title, content, actions;

  if (step === 1) {
    title = "Inviter une liste de salariés";
    content = (
      <>
        <p>
          Invitez plusieurs salariés en une fois, en renseignant leur adresse
          e-mail ou identifiant Mobilic, ou en copiant une liste dans l'encadré
          ci-dessous.
        </p>
        <ListInput list={list} removeEntry={handleRemoveEntry} />
      </>
    );
    actions = (
      <>
        <Button disabled={!canProceedStep1} onClick={goNext}>
          Suivant
        </Button>
      </>
    );
  } else if (step === 2) {
    title = "Sélectionner les salariés temporaires";
    content = (
      <>
        <p>
          Indiquez les salariés temporaires et renseignez leur date de fin de
          rattachement. Ils seront automatiquement détachés à cette date.
        </p>
        {list.entries.map((entry) =>
          renderCheckboxRow(entry, {
            checked: temporarySet.has(entry.value),
            onChange: () => toggleTemporary(entry.value),
            showDate: true,
          }),
        )}
      </>
    );
    actions = (
      <>
        <Button onClick={goPrev} priority="secondary">
          Précédent
        </Button>
        {allTemporary ? (
          <LoadingButton disabled={!isStep2Valid} onClick={handleFinalSubmit}>
            Inviter les salariés
          </LoadingButton>
        ) : (
          <Button disabled={!isStep2Valid} onClick={goNext}>
            Suivant
          </Button>
        )}
      </>
    );
  } else {
    title = "Donner l'accès gestionnaire";
    content = (
      <>
        <p>Choisissez les salariés qui auront les accès gestionnaire.</p>
        {nonTemporaryEntries.map((entry) =>
          renderCheckboxRow(entry, {
            checked: adminSet.has(entry.value),
            onChange: () => toggleAdmin(entry.value),
            showDate: false,
          }),
        )}
      </>
    );
    actions = (
      <>
        <Button onClick={goPrev} priority="secondary">
          Précédent
        </Button>
        <LoadingButton onClick={handleFinalSubmit}>
          Inviter les salariés
        </LoadingButton>
      </>
    );
  }

  return (
    <Modal
      open={open}
      handleClose={_handleClose}
      title={title}
      content={content}
      actions={actions}
    />
  );
}
