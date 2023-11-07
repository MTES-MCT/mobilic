import React from "react";
import Typography from "@mui/material/Typography";
import TextField from "common/utils/TextField";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useStyles as useFunnelModalStyles } from "../pwa/components/FunnelModal";
import MenuItem from "@mui/material/MenuItem";
import { MainCtaButton } from "../pwa/components/MainCtaButton";
import { jsToUnixTimestamp } from "common/utils/time";
import { NativeDateTimePicker } from "./NativeDateTimePicker";

const OTHER_MOTIF_ID = "other";
const MOTIFS = [
  {
    id: "sick-leave",
    label: "Arrêt Maladie"
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
    label: "Congé pour évènement familiaux"
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
    label: "Autre congé (précisez)"
  }
];

export default function LogHolidayForm({
  handleSubmit,
  companies,
  companyId = null
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

  const [company, setCompany] = React.useState(getInitialCompany());
  const [startTimestamp, setStartTimestamp] = React.useState(null);
  const [endTimestamp, setEndTimestamp] = React.useState(null);
  const [motif, setMotif] = React.useState(MOTIFS[0].id);
  const [otherMotif, setOtherMotif] = React.useState(undefined);
  const [loading, setLoading] = React.useState(false);

  const funnelModalClasses = useFunnelModalStyles();

  React.useEffect(() => {
    const today = new Date();
    setStartTimestamp(
      jsToUnixTimestamp(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1,
          Math.min(today.getHours(), 7),
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
          today.getDate() - 1,
          Math.max(today.getHours(), 16),
          0,
          0
        ).getTime()
      )
    );
  }, []);

  const isFormValid = React.useMemo(() => {
    if (!startTimestamp || !endTimestamp || !company || !motif) {
      return false;
    }
    if (motif === OTHER_MOTIF_ID && !otherMotif) {
      return false;
    }
    return true;
  }, [startTimestamp, endTimestamp, company, motif, otherMotif]);

  return (
    <Container>
      <form
        autoComplete="off"
        onSubmit={async e => {
          setLoading(true);
          e.preventDefault();
          await handleSubmit({
            companyId: company.id,
            title: motif,
            startTime: startTimestamp,
            endTime: endTimestamp
          });
          setLoading(false);
        }}
      >
        <Container
          className={`day-info-inputs ${funnelModalClasses.slimContainer}`}
          style={{ flexShrink: 0 }}
          disableGutters
        >
          {companies && companies.length > 1 && (
            <>
              <Typography variant="h5" className="form-field-title">
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
          <Typography variant="h5" className="form-field-title">
            Quel est le motif de congé ou d'absence&nbsp;?
          </Typography>
          <TextField
            label="Motif"
            required
            fullWidth
            variant="filled"
            select
            value={motif}
            onChange={e => setMotif(e.target.value)}
          >
            {MOTIFS.map(({ id, label }) => (
              <MenuItem key={id} value={id}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          {motif === OTHER_MOTIF_ID && (
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

          <Typography variant="h5" className="form-field-title">
            Quel est le jour et l'heure de début&nbsp;?
          </Typography>
          <NativeDateTimePicker
            label="Début"
            value={startTimestamp}
            setValue={setStartTimestamp}
            // minDateTime={previousMissionEnd}
            // maxDateTime={now()}
            fullWidth
            required
            variant="filled"
            // error={newUserTimeError}
          />
          <Typography variant="h5" className="form-field-title">
            Quel est le jour et l'heure de fin&nbsp;?
          </Typography>
          <NativeDateTimePicker
            label="Début"
            value={endTimestamp}
            setValue={setEndTimestamp}
            // setValue={_.flow([truncateMinute, setNewUserTime])}
            // minDateTime={previousMissionEnd}
            // maxDateTime={now()}
            fullWidth
            required
            variant="filled"
            // error={newUserTimeError}
          />
        </Container>
        <Box className="cta-container" my={4}>
          <MainCtaButton
            disabled={!isFormValid}
            type="submit"
            loading={loading}
          >
            Soumettre ma saisie
          </MainCtaButton>
        </Box>
      </form>
    </Container>
  );
}
