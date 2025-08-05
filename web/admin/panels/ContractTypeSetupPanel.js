import React from "react";
import { makeStyles } from "@mui/styles";
import { LoadingButton } from "common/components/LoadingButton";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { NumericInput } from "../../common/forms/NumericInput";
import { PercentageInput } from "../../common/forms/PercentageInput";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { AugmentedTable } from "../components/AugmentedTable";
import {
  MIN_NB_WORKERS,
  MAX_NB_WORKERS
} from "../../signup/company/SubmitStep";
import { formatPersonName } from "common/utils/coworkers";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { SET_EMPLOYEE_CONTRACT_TYPES_MUTATION } from "common/utils/apiQueries";
import { clearUpdateContractTypeCookie } from "common/utils/updateContractType";
import { isoFormatLocalDate } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(3),
    height: "100%",
    overflow: "auto"
  },
  stepContainer: {
    minHeight: "400px",
    marginBottom: theme.spacing(3)
  },
  tableContainer: {
    maxHeight: "400px",
    overflow: "auto"
  },
  stepProgress: {
    fontSize: "0.875rem",
    color: theme.palette.grey[600],
    marginBottom: theme.spacing(3)
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(3),
    gap: theme.spacing(2)
  }
}));

export default function ContractTypeSetupPanel({ onClose }) {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const adminStore = useAdminStore();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const eligibleEmployments = React.useMemo(() => {
    return (
      adminStore.employments?.filter(
        emp =>
          emp.companyId === adminStore.companyId &&
          emp.isAcknowledged &&
          emp.user.firstName &&
          emp.user.lastName &&
          (!emp.endDate || emp.endDate >= isoFormatLocalDate(new Date()))
      ) || []
    );
  }, [adminStore.employments, adminStore.companyId]);

  // Calculer le nombre d'employés sans contractType par défaut
  const defaultNbWorkers = React.useMemo(() => {
    const employeesWithoutContract = eligibleEmployments.filter(
      emp => !emp.contractType
    ).length;
    return Math.max(1, employeesWithoutContract);
  }, [eligibleEmployments]);

  const [nbWorkers, setNbWorkers] = React.useState(defaultNbWorkers);
  const [defaultContractType, setDefaultContractType] = React.useState(
    "FULL_TIME"
  );
  const [
    defaultPartTimePercentage,
    setDefaultPartTimePercentage
  ] = React.useState(50);

  const [employeeContractTypes, setEmployeeContractTypes] = React.useState([]);

  React.useEffect(() => {
    if (eligibleEmployments.length > 0) {
      const initialData = eligibleEmployments
        .slice(0, Math.max(1, nbWorkers))
        .map(employment => ({
          employmentId: employment.id,
          userId: employment.user?.id,
          name: employment.user
            ? formatPersonName(employment.user)
            : "Utilisateur inconnu",
          contractType: employment.contractType || defaultContractType,
          partTimePercentage:
            employment.partTimePercentage ||
            (defaultContractType === "PART_TIME"
              ? defaultPartTimePercentage
              : null)
        }));
      setEmployeeContractTypes(initialData);
    }
  }, [
    eligibleEmployments,
    nbWorkers,
    defaultContractType,
    defaultPartTimePercentage
  ]);

  const handleDefaultContractTypeChange = value => {
    setDefaultContractType(value);
    setEmployeeContractTypes(prev =>
      prev.map(emp => ({
        ...emp,
        contractType: value,
        partTimePercentage:
          value === "PART_TIME" ? defaultPartTimePercentage : null
      }))
    );
  };

  const handleDefaultPartTimePercentageChange = value => {
    setDefaultPartTimePercentage(value);
    setEmployeeContractTypes(prev =>
      prev.map(emp => ({
        ...emp,
        partTimePercentage:
          emp.contractType === "PART_TIME" ? value : emp.partTimePercentage
      }))
    );
  };

  const updateEmployeeContractType = (index, field, value) => {
    setEmployeeContractTypes(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        ...(field === "contractType" &&
          value === "FULL_TIME" && { partTimePercentage: null })
      };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    try {
      const contractSpecifications = employeeContractTypes.map(emp => {
        const spec = {
          employmentId: parseInt(emp.employmentId, 10),
          contractType: emp.contractType,
          ...(emp.contractType === "PART_TIME" && {
            partTimePercentage: parseInt(emp.partTimePercentage, 10)
          })
        };
        return spec;
      });

      const response = await api.graphQlMutate(
        SET_EMPLOYEE_CONTRACT_TYPES_MUTATION,
        { contractSpecifications }
      );

      const updatedEmployments =
        response.data.employments.setEmployeeContractTypes;
      updatedEmployments.forEach(employment => {
        adminStore.dispatch({
          type: ADMIN_ACTIONS.update,
          payload: {
            id: employment.id,
            entity: "employments",
            update: {
              contractType: employment.contractType,
              partTimePercentage: employment.partTimePercentage,
              contractTypeSnoozeDate: employment.contractTypeSnoozeDate
            }
          }
        });
      });

      clearUpdateContractTypeCookie();
      alerts.success(
        "Les types de contrat ont été enregistrés avec succès !",
        "",
        6000
      );
      onClose();
    } catch (err) {
      alerts.error(
        `Erreur lors de l'enregistrement : ${err.message}`,
        "",
        6000
      );
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onClose();
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return nbWorkers >= MIN_NB_WORKERS && nbWorkers <= MAX_NB_WORKERS;
    }
    return employeeContractTypes.every(
      emp =>
        emp.contractType === "FULL_TIME" ||
        (emp.partTimePercentage >= 10 && emp.partTimePercentage <= 90)
    );
  };

  const tableColumns = [
    {
      label: "Salarié",
      name: "name",
      sortable: true,
      align: "left",
      minWidth: 200
    },
    {
      label: "Type de contrat",
      name: "contractType",
      align: "left",
      minWidth: 150,
      format: (contractType, employee, index) => (
        <Select
          label=""
          nativeSelectProps={{
            value: contractType,
            onChange: e =>
              updateEmployeeContractType(
                employee.index,
                "contractType",
                e.target.value
              )
          }}
        >
          <option value="FULL_TIME">Temps plein</option>
          <option value="PART_TIME">Temps partiel</option>
        </Select>
      )
    },
    {
      label: "Pourcentage",
      name: "partTimePercentage",
      align: "left",
      minWidth: 120,
      format: (percentage, employee, index) =>
        employee.contractType === "PART_TIME" ? (
          <PercentageInput
            initialValue={percentage || 50}
            onChangeValue={value =>
              updateEmployeeContractType(
                employee.index,
                "partTimePercentage",
                value
              )
            }
            min={10}
            max={90}
            label=""
            compact={true}
          />
        ) : (
          <span>-</span>
        )
    }
  ];

  const renderStep1 = () => (
    <Card>
      <CardContent className={classes.stepContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <NumericInput
              initialValue={nbWorkers}
              onChangeValue={setNbWorkers}
              label="Nombre de salariés concernés"
              hintText="Nombre de salariés actifs dans votre entreprise"
              required
              min={MIN_NB_WORKERS}
              max={Math.min(MAX_NB_WORKERS, eligibleEmployments.length)}
            />
          </Grid>

          <Grid item xs={12}>
            <RadioButtons
              legend="Type de contrat prévalent au sein de l'entreprise"
              options={[
                {
                  label: "Temps plein",
                  hintText:
                    "La majorité des salariés a un contrat à temps plein.",
                  nativeInputProps: {
                    value: "FULL_TIME",
                    checked: defaultContractType === "FULL_TIME",
                    onChange: () => handleDefaultContractTypeChange("FULL_TIME")
                  }
                },
                {
                  label: "Temps partiel",
                  hintText:
                    "La majorité des salariés a un contrat à temps partiel (90% ou moins).",
                  nativeInputProps: {
                    value: "PART_TIME",
                    checked: defaultContractType === "PART_TIME",
                    onChange: () => handleDefaultContractTypeChange("PART_TIME")
                  }
                }
              ]}
            />
          </Grid>

          {defaultContractType === "PART_TIME" && (
            <Grid item xs={12} md={6}>
              <PercentageInput
                initialValue={defaultPartTimePercentage}
                onChangeValue={handleDefaultPartTimePercentageChange}
                label="Pourcentage temps partiel par défaut"
                hintText="Entre 10% et 90%"
                min={10}
                max={90}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardContent className={classes.stepContainer}>
        <div className={classes.tableContainer}>
          <AugmentedTable
            columns={tableColumns}
            entries={employeeContractTypes.map((emp, index) => ({
              ...emp,
              index
            }))}
            dense
            defaultSortBy="name"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={classes.container}>
      <Button
        priority="tertiary no outline"
        iconId="fr-icon-arrow-left-s-line"
        iconPosition="left"
        onClick={handleBack}
        disabled={loading}
      >
        {currentStep === 1 ? "Fermer" : "Retour"}
      </Button>

      <Typography className={classes.stepProgress}>
        Étape {currentStep} sur 2
      </Typography>

      <Typography variant="h3" component="h1" gutterBottom>
        Type de contrat
      </Typography>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}

      <div className={classes.actionButtons}>
        {currentStep === 1 && (
          <LoadingButton
            onClick={handleSubmit}
            disabled={!canProceed()}
            loading={loading}
          >
            Suivant
          </LoadingButton>
        )}
        {currentStep === 2 && (
          <>
            <Button
              priority="secondary"
              onClick={handleBack}
              disabled={loading}
            >
              Précédent
            </Button>
            <LoadingButton
              onClick={handleSubmit}
              disabled={!canProceed()}
              loading={loading}
            >
              Enregistrer les informations
            </LoadingButton>
          </>
        )}
      </div>
    </div>
  );
}
