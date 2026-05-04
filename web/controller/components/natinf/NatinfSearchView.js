
import React from "react";
import classNames from "classnames";
import { makeStyles } from "@mui/styles";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useApi } from "common/utils/api";
import { CONTROLLER_SEARCH_NATINF } from "common/utils/apiQueries/controller";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { NatinfResultAccordion } from "./NatinfResultAccordion";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(10),
    paddingTop: theme.spacing(2),
    maxWidth: "600px !important"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary
  },
  searchContainer: {
    marginBottom: theme.spacing(3)
  },
  recentSearches: {
    marginBottom: theme.spacing(3)
  },
  recentSearchTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary
  },
  resultsContainer: {
    marginTop: theme.spacing(2)
  },
  resultsTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary
  },
  footerActions: {
    position: "fixed",
    bottom: 0,
    right: 0,
    width: "100%",
    maxWidth: "860px",
    backgroundColor: "white",
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    zIndex: 1300,
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)"
  },
  footerActionsRow: {
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerActionsColumn: {
    flexDirection: "column",
    gap: theme.spacing(2)
  },
  footerInfo: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: "0.875rem"
  },
  confirmationDescription: {
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary
  }
}));

export function NatinfSearchView({
  onConfirm,
  onClose,
  customInfractions,
  addDayToCustomInfraction,
  removeDayFromCustomInfraction,
  removeCustomInfraction,
  controlTime
}) {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [expandedAccordion, setExpandedAccordion] = React.useState(null);
  const [recentSearches, setRecentSearches] = React.useState([]);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  // Load recent searches from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('natinf_recent_searches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure stored items are objects with code+label (not legacy strings)
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item.code)) {
          setRecentSearches(parsed);
        } else {
          localStorage.removeItem('natinf_recent_searches');
        }
      } catch (e) {
        alerts.error("Une erreur est survenue", {}, 6000);
        localStorage.removeItem('natinf_recent_searches');
      }
    }
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    if (searchQuery.length < 2) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.graphQlQuery(
        CONTROLLER_SEARCH_NATINF,
        { query: searchQuery },
        { context: { nonPublicApi: true } }
      );
      setSearchResults(response.data.searchNatinf || []);
    } catch (err) {
      alerts.error(formatApiError(err), "", 6000);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccordionChange = (natinf) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? natinf.code : null);
    if (isExpanded) {
      const updated = [natinf, ...recentSearches.filter(r => r.code !== natinf.code)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('natinf_recent_searches', JSON.stringify(updated));
    }
  };

  const handleShowConfirmation = () => {
    if (selectedInfractionsCount === 0) {
      alerts.warning("Veuillez sélectionner au moins une infraction", "", 3000);
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedInfractionsCount === 0) {
      alerts.warning("Veuillez sélectionner au moins une infraction", "", 3000);
      return;
    }
    onConfirm();
  };

  const selectedInfractionsCount = customInfractions.filter(
    item => item.days.length > 0
  ).length;

  const getInfractionDays = (code) => {
    const infraction = customInfractions.find(item => item.code === code);
    return infraction ? infraction.days : [];
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh" }}>
      <Box
        sx={{
          flexShrink: 0,
          backgroundColor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 2,
          py: 1,
          minHeight: 56
        }}
      >
        <Button
          priority="tertiary no outline"
          iconId="ri-close-line"
          iconPosition="right"
          onClick={() => { setShowConfirmation(false); onClose(); }}
          size="small"
        >
          Fermer
        </Button>
      </Box>
      <Box sx={{ overflowY: "auto", flexGrow: 1, paddingBottom: "120px" }}>
      <Container maxWidth="md" className={classes.container}>
      {!showConfirmation ? (
        <>
          <Typography className={classes.title}>
            Rechercher des infractions
          </Typography>
          <SearchBar
            label=""
            placeholder="Qualification, n° NATINF..."
            onButtonClick={performSearch}
            renderInput={({ className, id, type }) => (
              <input
                className={className}
                id={id}
                placeholder="Qualification, n° NATINF..."
                type={type}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus={true}
              />
            )}
            className={classes.searchContainer}
          />

          {!searchQuery && recentSearches.length > 0 && (
            <Box className={classes.recentSearches}>
              <Typography className={classes.recentSearchTitle}>
                Recherches récentes
              </Typography>
              {recentSearches.map(natinf => (
                <NatinfResultAccordion
                  key={natinf.code}
                  natinf={natinf}
                  selectedDays={getInfractionDays(natinf.code)}
                  onDaySelect={addDayToCustomInfraction}
                  onDayRemove={removeDayFromCustomInfraction}
                  controlTime={controlTime}
                  expanded={expandedAccordion === natinf.code}
                  onChange={handleAccordionChange(natinf)}
                />
              ))}
            </Box>
          )}

          {isSearching && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          )}

          {!isSearching && searchQuery.length >= 2 && searchResults.length > 0 && (
            <Box className={classes.resultsContainer}>
              <Typography className={classes.resultsTitle}>
                Résultats ({searchResults.length})
              </Typography>
              {searchResults.map(natinf => (
                <NatinfResultAccordion
                  key={natinf.code}
                  natinf={natinf}
                  selectedDays={getInfractionDays(natinf.code)}
                  onDaySelect={addDayToCustomInfraction}
                  onDayRemove={removeDayFromCustomInfraction}
                  controlTime={controlTime}
                  expanded={expandedAccordion === natinf.code}
                  onChange={handleAccordionChange(natinf)}
                />
              ))}
            </Box>
          )}

          {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <Box py={4}>
              <Typography variant="body2" color="textSecondary" align="center">
                Aucun résultat trouvé
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <>
          <Typography className={classes.title}>
            Confirmer votre sélection
          </Typography>
          <Typography variant="body2" className={classes.confirmationDescription}>
            Ces infractions seront ajoutées au contrôle et resteront modifiables par la suite.
          </Typography>
          {customInfractions.filter(item => item.days.length > 0).length === 0 ? (
            <Box py={4}>
              <Typography variant="body2" color="textSecondary" align="center">
                Aucune infraction sélectionnée
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {customInfractions
                .filter(item => item.days.length > 0)
                .map(infraction => (
                  <NatinfResultAccordion
                    key={infraction.code}
                    natinf={infraction}
                    selectedDays={infraction.days}
                    onDaySelect={addDayToCustomInfraction}
                    onDayRemove={removeDayFromCustomInfraction}
                    controlTime={controlTime}
                    expanded={expandedAccordion === infraction.code}
                    onChange={(event, isExpanded) =>
                      setExpandedAccordion(isExpanded ? infraction.code : null)
                    }
                    onDelete={() => removeCustomInfraction(infraction.code)}
                  />
                ))}
            </Stack>
          )}
        </>
      )}

      <Box className={classNames(classes.footerActions, showConfirmation ? classes.footerActionsColumn : classes.footerActionsRow)}>
      {!showConfirmation ? (
        <>
          <Typography variant="body2" className={classes.footerInfo}>
            {selectedInfractionsCount} infraction{selectedInfractionsCount > 1 ? "s" : ""}{" "}
            sélectionnée{selectedInfractionsCount > 1 ? "s" : ""}
          </Typography>
          <Button
            onClick={handleShowConfirmation}
            disabled={selectedInfractionsCount === 0}
          >
            Confirmer ({selectedInfractionsCount})
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={handleConfirm}
            disabled={selectedInfractionsCount === 0}
            size="large"
            style={{ width: "100%" }}
          >
            Ajouter au contrôle
          </Button>
          <Button
            onClick={() => setShowConfirmation(false)}
            priority="secondary"
            size="large"
            style={{ width: "100%" }}
          >
            Rechercher d'autres infractions
          </Button>
        </>
      )}
    </Box>
    </Container>
    </Box>
    </Box>
  );
}
