import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { prettyFormatDayHour, strToUnixTimestamp } from "common/utils/time";
import Stack from "@mui/material/Stack";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Notice from "../../common/Notice";
import { AlertGroup } from "./Alerts/AlertGroup";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

import { FieldTitle } from "../../common/typography/FieldTitle";
import { DisplayBusinessTypes } from "./Alerts/BusinessTypesFromGroupedAlerts";
import { getBusinessTypesFromGroupedAlerts } from "../utils/businessTypesFromGroupedAlerts";
import { Description } from "../../common/typography/Description";
import { CONTROL_TYPES } from "../../controller/utils/useReadControlData";
import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import { useInfractions } from "../../controller/utils/contextInfractions";
import { sanctionComparator } from "../utils/sanctionComparator";
import { useControl } from "../../controller/utils/contextControl";
import { TitleContainer } from "./TitleContainer";
import Grid from "@mui/material/Grid";
import { useIsWidthUp } from "common/utils/useWidth";
import { UserReadAlertsPictures } from "./UserReadAlertsPictures";
import { useCustomInfractions } from "../../controller/hooks/useCustomInfractions";
import { NatinfSearchView } from "../../controller/components/natinf/NatinfSearchView";
import { useStoreSyncedWithLocalStorage } from "common/store/store";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0)
    }
  },
  linkContainer: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  italicInfo: {
    fontStyle: "italic",
    color: theme.palette.grey[600],
    marginTop: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  bottomButtons: {
    position: "sticky",
    bottom: 0,
    background: "white",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    zIndex: 300,
    width: "100%"
  }
}));

const HELPER_TEXT_SEVERAL_INFRACTIONS = (
  <>Sélectionnez la ou les infractions que vous souhaitez verbaliser&nbsp;:</>
);
const HELPER_TEXT_SINGLE_INFRACTION = (
  <>Sélectionnez l’infraction si vous souhaitez la verbaliser&nbsp;:</>
);
const HELPER_TEXT_LIC_PAPIER = (
  <>
    Sélectionnez les infractions que vous souhaitez verbaliser à partir du
    livret individuel de contrôle présenté&nbsp;:
  </>
);

export const WarningComputedAlerts = () => (
  <Notice
    description="Les infractions calculées par Mobilic se basent sur la version
              validée par le gestionnaire, ou, si elle n’a pas été faite au
              moment du contrôle, sur celle du salarié."
  />
);

export function UserReadAlerts({
  onChangeTab,
  setPeriodOnFocus,
  readOnlyAlerts,
  groupedAlerts = undefined
}) {
  const classes = useStyles();
  const isDesktop = useIsWidthUp("lg");
  const store = useStoreSyncedWithLocalStorage();
  const controllerUserInfo = store.controllerInfo();
  const {
    groupedAlerts: infractionsGroupedAlerts,
    isReportingInfractions,
    totalAlertsNumber,
    reportedInfractionsLastUpdateTime,
    reportedCustomInfractionsLastUpdateTime,
    saveInfractions,
    cancelInfractions,
    setIsReportingInfractions,
    addCustomInfractions,
    natinfViewMode,
    setNatinfViewMode,
    removeCustomInfractionsBySanction,
    observedInfractions
  } = useInfractions();
  const { controlType, controlData } = useControl();
  
  const {
    customInfractions,
    addDayToCustomInfraction,
    removeDayFromCustomInfraction,
    removeCustomInfraction,
    clearCustomInfractions,
    getCustomInfractionsForAPI
  } = useCustomInfractions();

  const [editSection, setEditSection] = React.useState(null);

  const reportInfraction = (section) => {
    setEditSection(section);
    setIsReportingInfractions(true);
  };

  const handleAddCustomInfractions = () => {
    setNatinfViewMode('search');
  };

  const handleConfirmCustomInfractions = () => {
    const customInfractionsForAPI = getCustomInfractionsForAPI();
    if (customInfractionsForAPI.length === 0) {
      setNatinfViewMode('list');
      setEditSection(null);
      return;
    }
    // Build merged list synchronously to avoid stale closure in saveInfractions
    const newEntries = customInfractionsForAPI.map((ci) => ({
      sanction: ci.sanction,
      date: ci.dateStr ? strToUnixTimestamp(ci.dateStr) : null,
      type: ci.type,
      isReported: true,
      isReportable: true,
      label: (ci.customLabel ?? "").trim() || ci.sanction,
      description: (ci.customDescription ?? "").trim(),
      articles: (ci.customArticles ?? "").trim(),
      unit: PERIOD_UNITS.DAY,
      business: null
    }));
    const mergedInfractions = [...observedInfractions, ...newEntries];
    addCustomInfractions(customInfractionsForAPI);
    clearCustomInfractions();
    setNatinfViewMode('list');
    setEditSection(null);
    saveInfractions({ infractionsOverride: mergedInfractions });
  };

  const isMinistryOfInterior = controllerUserInfo?.isMinistryOfInterior || false;

  const _groupedAlerts = groupedAlerts ?? infractionsGroupedAlerts;
  
  // Separate computed infractions from custom NATINF infractions
  const computedInfractions = React.useMemo(
    () => _groupedAlerts?.filter(group => group.type !== "custom") || [],
    [_groupedAlerts]
  );
  
  const reportedCustomInfractions = React.useMemo(
    () => _groupedAlerts?.filter(group => group.type === "custom") || [],
    [_groupedAlerts]
  );

  // Section visibility logic
  const showComputedSection = computedInfractions.length > 0 && (!isReportingInfractions || editSection === 'computed');
  const showCustomSection = isReportingInfractions
    ? editSection === 'custom' && (reportedCustomInfractions.length > 0 || isMinistryOfInterior)
    : reportedCustomInfractions.length > 0;
  
  const businessTypes = React.useMemo(
    () => getBusinessTypesFromGroupedAlerts(computedInfractions),
    [computedInfractions]
  );

  const updateInfractionsTitle = React.useMemo(
    () =>
      controlType === CONTROL_TYPES.LIC_PAPIER.label
        ? HELPER_TEXT_LIC_PAPIER
        : totalAlertsNumber === 1
        ? HELPER_TEXT_SINGLE_INFRACTION
        : HELPER_TEXT_SEVERAL_INFRACTIONS,
    [totalAlertsNumber, controlType]
  );

  const displayPictures = React.useMemo(
    () =>
      isReportingInfractions &&
      controlType === CONTROL_TYPES.LIC_PAPIER.label &&
      controlData.pictures.length > 0 &&
      isDesktop,
    [controlType, isReportingInfractions, controlData.pictures, isDesktop]
  );

  if (natinfViewMode === 'search') {
    return (
      <NatinfSearchView
        onClose={() => setNatinfViewMode('list')}
        onConfirm={handleConfirmCustomInfractions}
        customInfractions={customInfractions}
        addDayToCustomInfraction={addDayToCustomInfraction}
        removeDayFromCustomInfraction={removeDayFromCustomInfraction}
        removeCustomInfraction={removeCustomInfraction}
        controlTime={controlData.qrCodeGenerationTime}
      />
    );
  }

  return (
    <Container maxWidth={displayPictures ? "lg" : "md"} sx={{ padding: 0, minHeight: "calc(100vh - 200px)" }}>
      {controlType === CONTROL_TYPES.MOBILIC.label && (
        <DisplayBusinessTypes businessTypes={businessTypes} />
      )}
      <Container className={classes.container}>
        <Grid container spacing={2}>
          {displayPictures && (
            <Grid item xs={5}>
              <UserReadAlertsPictures />
            </Grid>
          )}
          <Grid item xs={displayPictures ? 7 : 12}>
            <Stack direction="column" rowGap={1}>

              {/* Computed infractions section */}
              {showComputedSection && (
                <>
                  {!isReportingInfractions ? (
                    <>
                      <TitleContainer>
                        <FieldTitle uppercaseTitle component="h2">
                          Infractions calculées par Mobilic
                        </FieldTitle>
                        <Button
                          priority="primary"
                          onClick={() => reportInfraction('computed')}
                          size="small"
                        >
                          Modifier
                        </Button>
                      </TitleContainer>
                      {reportedInfractionsLastUpdateTime && (
                        <Description noMargin>
                          {`Dernière modification le ${prettyFormatDayHour(
                            reportedInfractionsLastUpdateTime
                          )}`}
                        </Description>
                      )}
                    </>
                  ) : (
                    <>
                      <FieldTitle uppercaseTitle component="h2" sx={{ marginTop: 0 }}>
                        Infractions calculées par Mobilic
                      </FieldTitle>
                      <Typography>{updateInfractionsTitle}</Typography>
                    </>
                  )}
                  {controlType === CONTROL_TYPES.MOBILIC.label && isReportingInfractions && (
                    <WarningComputedAlerts />
                  )}
                </>
              )}
              {showComputedSection && (
                <List
                  sx={{
                    ...(isReportingInfractions && {
                      overflow: "scroll",
                      maxHeight: "30vh"
                    })
                  }}
                >
                  {computedInfractions.sort(sanctionComparator).map(group => (
                    <ListItem
                      key={`${group.type}_${group.sanction}`}
                      disableGutters
                      disablePadding
                      sx={{ marginBottom: "8px" }}
                    >
                      <AlertGroup
                        {...group}
                        setPeriodOnFocus={setPeriodOnFocus}
                        onChangeTab={onChangeTab}
                        readOnlyAlerts={readOnlyAlerts}
                        titleProps={{ component: "h3" }}
                        displayBusinessType={
                          businessTypes && businessTypes.length > 1
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              {/* Custom infractions section */}
              {showCustomSection && (
                <>
                  {!isReportingInfractions ? (
                    <>
                      <TitleContainer sx={{ marginTop: reportedCustomInfractions.length > 0 ? 3 : 0 }}>
                        <FieldTitle uppercaseTitle component="h2">
                          Autre(s) infraction(s) constatée(s)
                        </FieldTitle>
                        <Button
                          priority="primary"
                          onClick={() => reportInfraction('custom')}
                          size="small"
                        >
                          Modifier
                        </Button>
                      </TitleContainer>
                      {reportedCustomInfractionsLastUpdateTime && (
                        <Description noMargin>
                          {`Dernière modification le ${prettyFormatDayHour(
                            reportedCustomInfractionsLastUpdateTime
                          )}`}
                        </Description>
                      )}
                    </>
                  ) : (
                    <FieldTitle uppercaseTitle component="h2" sx={{ marginTop: 0 }}>
                      Autre(s) infraction(s) constatée(s)
                    </FieldTitle>
                  )}
                  {reportedCustomInfractions.length > 0 ? (
                    <List
                      sx={{
                        ...(isReportingInfractions && {
                          overflow: "scroll",
                          maxHeight: "30vh"
                        })
                      }}
                    >
                      {reportedCustomInfractions.sort(sanctionComparator).map(group => (
                        <ListItem
                          key={`${group.type}_${group.sanction}`}
                          disableGutters
                          disablePadding
                          sx={{ marginBottom: "8px" }}
                        >
                          <AlertGroup
                            {...group}
                            setPeriodOnFocus={setPeriodOnFocus}
                            onChangeTab={onChangeTab}
                            readOnlyAlerts={readOnlyAlerts}
                            titleProps={{ component: "h3" }}
                            displayBusinessType={false}
                            onDelete={isReportingInfractions && editSection === 'custom' ? () => removeCustomInfractionsBySanction(group.sanction) : undefined}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : null}
                </>
              )}
              
              {/* "Ajouter des infractions" visible in both edit sections */}
              {isReportingInfractions && isMinistryOfInterior && (
                <Button
                  priority="secondary"
                  iconId="ri-add-line"
                  onClick={handleAddCustomInfractions}
                  size="small"
                  sx={{ marginTop: 1 }}
                >
                  Ajouter des infractions
                </Button>
              )}
              
              {/* Show message if no infractions at all */}
              {computedInfractions.length === 0 && reportedCustomInfractions.length === 0 && !isReportingInfractions && (
                <Typography className={classes.italicInfo}>
                  Il n'y a aucune alerte réglementaire sur la période
                </Typography>
              )}
              <>
                {!isReportingInfractions &&
                  controlType === CONTROL_TYPES.MOBILIC.label && (
                    <Notice
                      type="warning"
                      description={
                        <>
                          Les données collectées par Mobilic sont déclaratives
                          et sont donc susceptibles d'erreurs ou d'oublis. En
                          cas de données manquantes ou inexactes les alertes
                          réglementaires ne peuvent pas être remontées
                          correctement.
                          <br />
                          Mobilic sert à faciliter le travail d'enquête des
                          inspecteurs sans se substituer à lui.
                        </>
                      }
                    />
                  )}
              </>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      {isReportingInfractions && (
        <ButtonsGroup
          className={classes.bottomButtons}
          buttons={[
            {
              onClick: () => { setEditSection(null); saveInfractions(); },
              children: "Enregistrer"
            },
            {
              children: "Annuler",
              onClick: () => { setEditSection(null); cancelInfractions(); },
              priority: "secondary"
            }
          ]}
          inlineLayoutWhen="sm and up"
          alignment="right"
        />
      )}
    </Container>
  );
}
