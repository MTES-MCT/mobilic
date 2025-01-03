import React from "react";
import Typography from "@mui/material/Typography";
import TextField from "common/utils/TextField";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useStyles as useFunnelModalStyles } from "../pwa/components/FunnelModal";
import MenuItem from "@mui/material/MenuItem";
import { MandatoryField } from "./MandatoryField";
import {
  jsToUnixTimestamp,
  now,
  sameMinute,
  truncateMinute
} from "common/utils/time";
import { NativeDateTimePicker } from "./NativeDateTimePicker";
import _ from "lodash";
import { LoadingButton } from "common/components/LoadingButton";

const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 16;

const OTHER_MOTIF_ID = "other";
const MOTIFS = [
  {
    id: "sick-leave",
    label: "Arrêt maladie"
  },
  {
    id: "workplace-accident",
    label: "Accident du travail"
  },
  {
    id: "rest",
    label: "Repos"
  },
  {
    id: "external-rest",
    label: "Repos extérieur"
  },
  {
    id: "paid-leave",
    label: "Congé payé"
  },
  {
    id: "unpaid-leave",
    label: "Congé sans solde"
  },
  {
    id: "parental-leave",
    label: "Congé maternité / paternité"
  },
  {
    id: "compassionate-leave",
    label: "Congé pour évènements familiaux"
  },
  {
    id: "bank-holiday",
    label: "Jour férié"
  },
  {
    id: "heavy-truck-driving",
    label: "Conduite poids lourd"
  },
  {
    id: "training",
    label: "Formation"
  },
  {
    id: "on-call-duty",
    label: "Astreinte"
  },
  {
    id: OTHER_MOTIF_ID,
    label: "Autre congé"
  }
];

export function LogHolidayForm({
  handleSubmit,
  companies,
  companyId = null,
  users
}) {
  const getInitialCompany = () => {
    if (companyId) {
      return companies.find(c => c.id === companyId);
    }
    if (companies && companies.length === 1) {
      return companies[0];
    }
    return "";
  };

  const getInitialUser = () => {
    if (users && users.length === 1) {
      return users[0];
    }
  };

  const [company, setCompany] = React.useState(getInitialCompany());
  const [user, setUser] = React.useState(getInitialUser());

  const [startTimestamp, setStartTimestamp] = React.useState(null);
  const [endTimestamp, setEndTimestamp] = React.useState(null);

  const [motifId, setMotifId] = React.useState(MOTIFS[0].id);
  const [otherMotif, setOtherMotif] = React.useState(undefined);
  const [loading, setLoading] = React.useState(false);

  const [startTimeError, setStartTimeError] = React.useState("");
  const [endTimeError, setEndTimeError] = React.useState("");

  const funnelModalClasses = useFunnelModalStyles();

  React.useEffect(() => {
    const today = new Date();
    const isTodayTooEarly = today.getHours() < DEFAULT_END_HOUR;
    setStartTimestamp(
      jsToUnixTimestamp(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - (isTodayTooEarly ? 1 : 0),
          DEFAULT_START_HOUR,
          0,
          0
        ).getTime()
      )
    );
    setEndTimestamp(
      jsToUnixTimestamp(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - (isTodayTooEarly ? 1 : 0),
          DEFAULT_END_HOUR,
          0,
          0
        ).getTime()
      )
    );
  }, []);

  React.useEffect(() => {
    let endTimeError = "";
    let startTimeError = "";

    if (startTimestamp && endTimestamp) {
      if (startTimestamp >= now()) {
        startTimeError = "L'heure de début ne peut pas être dans le futur.";
      }
      if (
        endTimestamp <= startTimestamp ||
        sameMinute(startTimestamp, endTimestamp)
      ) {
        endTimeError = "La fin doit être après le début";
      }
      if (endTimestamp >= now()) {
        endTimeError = "L'heure de fin ne peut pas être dans le futur.";
      }
    }

    setStartTimeError(startTimeError);
    setEndTimeError(endTimeError);
  }, [startTimestamp, endTimestamp]);

  const motifLabel = React.useMemo(
    () => MOTIFS.find(item => item.id === motifId)?.label || "",
    [motifId]
  );

  const isFormValid = React.useMemo(() => {
    if (
      !startTimestamp ||
      !endTimestamp ||
      (companies && !company) ||
      (users && !user) ||
      !motifId
    ) {
      return false;
    }
    if (endTimeError || startTimeError) {
      return false;
    }
    if (motifId === OTHER_MOTIF_ID && !otherMotif) {
      return false;
    }
    return true;
  }, [
    startTimestamp,
    endTimestamp,
    company,
    user,
    motifId,
    otherMotif,
    endTimeError,
    startTimeError
  ]);

  return (
    <Container>
      <Container
        className={`day-info-inputs ${funnelModalClasses.slimContainer}`}
        style={{ flexShrink: 0 }}
        disableGutters
      >
        <MandatoryField />
        <form
          style={{ width: "100%" }}
          autoComplete="off"
          onSubmit={async e => {
            setLoading(true);
            e.preventDefault();
            await handleSubmit({
              companyId: company.id,
              title: motifLabel,
              startTime: startTimestamp,
              endTime: endTimestamp,
              userId: user?.id,
              ...(motifId === OTHER_MOTIF_ID ? { comment: otherMotif } : {})
            });
            setLoading(false);
          }}
        >
          {companies && companies.length > 1 && (
            <>
              <Typography
                variant="h5"
                component="p"
                className="form-field-title"
              >
                Pour quelle entreprise&nbsp;?
              </Typography>
              <TextField
                label="Entreprise"
                required
                fullWidth
                variant="filled"
                select
                value={company || ""}
                onChange={e => {
                  setCompany(e.target.value);
                }}
                disabled={!!companyId}
              >
                {companies.map(company => (
                  <MenuItem key={company.id} value={company}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
          {users && (
            <>
              <Typography
                variant="h5"
                component="p"
                className="form-field-title"
              >
                Qui est le salarié concerné&nbsp;?
              </Typography>
              <TextField
                label="Salarié"
                required
                fullWidth
                variant="filled"
                select
                value={user || ""}
                onChange={e => {
                  setUser(e.target.value);
                }}
              >
                {users
                  .sort((u1, u2) => u1.lastName.localeCompare(u2.lastName))
                  .map(user => (
                    <MenuItem key={user.id} value={user}>
                      {`${user.lastName} ${user.firstName}`}
                    </MenuItem>
                  ))}
              </TextField>
            </>
          )}
          <Typography variant="h5" component="p" className="form-field-title">
            Quel est le motif de congé ou d'absence&nbsp;?
          </Typography>
          <TextField
            label="Motif"
            required
            fullWidth
            variant="filled"
            select
            value={motifId}
            onChange={e => setMotifId(e.target.value)}
          >
            {MOTIFS.map(({ id, label }) => (
              <MenuItem key={id} value={id}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {motifId === OTHER_MOTIF_ID && (
            <TextField
              label="Veuillez préciser votre motif de congé"
              variant="standard"
              required
              fullWidth
              sx={{ marginTop: 2 }}
              inputProps={{
                maxLength: 32
              }}
              onChange={e => setOtherMotif(e.target.value.trimLeft())}
              value={otherMotif}
            />
          )}

          <Typography variant="h5" component="p" className="form-field-title">
            Quel est le jour et l'heure de début&nbsp;?
          </Typography>
          <NativeDateTimePicker
            label="Début"
            value={startTimestamp}
            setValue={_.flow([truncateMinute, setStartTimestamp])}
            maxDateTime={now()}
            fullWidth
            required
            variant="filled"
            error={startTimeError}
          />
          <Typography variant="h5" component="p" className="form-field-title">
            Quel est le jour et l'heure de fin&nbsp;?
          </Typography>
          <NativeDateTimePicker
            label="Fin"
            value={endTimestamp}
            setValue={_.flow([truncateMinute, setEndTimestamp])}
            maxDateTime={now()}
            fullWidth
            required
            variant="filled"
            error={endTimeError}
          />
          <Box className="cta-container" my={4}>
            <LoadingButton
              disabled={!isFormValid}
              type="submit"
              loading={loading}
            >
              Soumettre ma saisie
            </LoadingButton>
          </Box>
        </form>
      </Container>
    </Container>
  );
}
