import React from "react";
import { useHistory } from "react-router-dom";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "../../common/forms/Select";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { LoadingButton } from "common/components/LoadingButton";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Modal from "../../common/Modal";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { isoFormatLocalDate } from "common/utils/time";
import { formatApiError } from "common/utils/errors";
import { NO_TEAM_ID } from "../utils/teams";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
}));

export default function InviteSingleEmployeeModal({
  open,
  handleClose,
  handleSubmit,
  allowTemporaryEmployees,
  teams,
}) {
  const classes = useStyles();
  const history = useHistory();
  const [idOrEmail, setIdOrEmail] = React.useState("");
  const [hasAdminRights, setHasAdminRights] = React.useState(false);
  const [isTemporary, setIsTemporary] = React.useState(false);
  const [endDate, setEndDate] = React.useState("");
  const [teamId, setTeamId] = React.useState(NO_TEAM_ID);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setIdOrEmail("");
      setHasAdminRights(false);
      setIsTemporary(false);
      setEndDate("");
      setTeamId(NO_TEAM_ID);
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
        teamId,
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
  const hasTeams = teams?.length > 0;

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
          <ToggleSwitch
            label="Accès gestionnaire"
            checked={hasAdminRights}
            onChange={(checked) => setHasAdminRights(checked)}
            disabled={isTemporary}
          />
          {hasTeams && (
            <Select
              label="Groupe d'affectation"
              nativeSelectProps={{
                value: teamId,
                onChange: (e) => setTeamId(parseInt(e.target.value, 10)),
              }}
            >
              <option value={NO_TEAM_ID}>-</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          )}
          <ToggleSwitch
            label="Salarié temporaire"
            checked={isTemporary}
            disabled={!allowTemporaryEmployees}
            onChange={(checked) => {
              setIsTemporary(checked);
              if (checked) setHasAdminRights(false);
            }}
            helperText={
              !allowTemporaryEmployees ? (
                <>
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
                </>
              ) : undefined
            }
          />
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
