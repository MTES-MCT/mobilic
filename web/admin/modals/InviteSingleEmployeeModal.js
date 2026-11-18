import React from "react";
import { useHistory } from "react-router-dom";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { LoadingButton } from "common/components/LoadingButton";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Modal from "../../common/Modal";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { isoFormatLocalDate } from "common/utils/time";
import { formatApiError } from "common/utils/errors";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  settingsHint: {
    marginTop: theme.spacing(1),
    display: "block",
  },
  toggleRow: {
    borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    paddingBottom: theme.spacing(1),
  },
}));

export default function InviteSingleEmployeeModal({
  open,
  handleClose,
  handleSubmit,
  allowTemporaryEmployees,
}) {
  const classes = useStyles();
  const history = useHistory();
  const [idOrEmail, setIdOrEmail] = React.useState("");
  const [hasAdminRights, setHasAdminRights] = React.useState(false);
  const [isTemporary, setIsTemporary] = React.useState(false);
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setIdOrEmail("");
      setHasAdminRights(false);
      setIsTemporary(false);
      setEndDate("");
      setError(null);
    }
  }, [open]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await handleSubmit({
        idOrEmail: idOrEmail.trim(),
        hasAdminRights,
        isTemporary,
        endDate: isTemporary ? endDate : null,
      });
      handleClose();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const todayStr = isoFormatLocalDate(new Date());
  const isEndDateValid = !isTemporary || (endDate && endDate >= todayStr);
  const canSubmit = !!idOrEmail.trim() && isEndDateValid;

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Invitation d'un nouveau salarié"
      size="sm"
      content={
        <div className={classes.form}>
          <Input
            label="Adresse e-mail ou identifiant Mobilic"
            hintText="Exemple : prenom.nom@domaine.fr ou 123456789"
            nativeInputProps={{
              value: idOrEmail,
              onChange: (e) => setIdOrEmail(e.target.value),
              type: "text",
            }}
            state={error ? "error" : "default"}
            stateRelatedMessage={error}
          />
          <div className={classes.toggleRow}>
            <ToggleSwitch
              label="Accès gestionnaire"
              labelPosition="left"
              checked={hasAdminRights}
              onChange={(checked) => setHasAdminRights(checked)}
              disabled={isTemporary}
            />
          </div>
          <div className={classes.toggleRow}>
            <ToggleSwitch
              label="Salarié temporaire"
              labelPosition="left"
              checked={isTemporary}
              disabled={!allowTemporaryEmployees}
              onChange={(checked) => {
                setIsTemporary(checked);
                if (checked) setHasAdminRights(false);
              }}
              helperText={
                !allowTemporaryEmployees ? (
                  <span className={classes.settingsHint}>
                    Option à activer dans les{" "}
                    <a
                      href="/admin/company?tab=settings"
                      className={fr.cx(
                        "fr-link",
                        "fr-link--sm",
                        "fr-icon-arrow-right-line",
                        "fr-link--icon-right",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClose();
                        history.push("/admin/company?tab=settings");
                      }}
                    >
                      paramètres
                    </a>
                  </span>
                ) : undefined
              }
            />
          </div>
          {isTemporary && (
            <Input
              label="Date de fin de rattachement"
              nativeInputProps={{
                type: "date",
                value: endDate,
                onChange: (e) => setEndDate(e.target.value),
                min: todayStr,
              }}
            />
          )}
        </div>
      }
      actions={
        <>
          <Button priority="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <LoadingButton
            onClick={onSubmit}
            loading={loading}
            disabled={!canSubmit}
          >
            Inviter
          </LoadingButton>
        </>
      }
    />
  );
}
