import React from "react";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  useApi,
  CREATE_VEHICLE_MUTATION,
  EDIT_VEHICLE_MUTATION,
  TERMINATE_VEHICLE_MUTATION,
  EDIT_KNOWN_ADDRESS_MUTATION,
  CREATE_KNOWN_ADDRESS_MUTATION,
  TERMINATE_KNOWN_ADDRESS_MUTATION
} from "common/utils/api";
import { useAdminStore } from "../utils/store";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import { AugmentedTable } from "../components/AugmentedTable";
import { useModals } from "common/utils/modals";
import { Employees } from "./Employees";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import { LinkButton } from "../../common/LinkButton";
import * as Sentry from "@sentry/browser";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { AddressField } from "../../common/AddressField";

const useStyles = makeStyles(theme => ({
  navigation: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    flexShrink: 0,
    position: ({ width }) => (isWidthUp("md", width) ? "sticky" : "static"),
    top: "0",
    zIndex: 500,
    textAlign: "left",
    flexWrap: "wrap"
  },
  subPanel: {
    padding: theme.spacing(2)
  },
  createCompanyButton: {
    marginTop: theme.spacing(1),
    flexShrink: 0
  },
  explanation: {
    marginBottom: theme.spacing(2),
    fontStyle: "italic",
    textAlign: "justify"
  },
  companyName: {
    marginBottom: theme.spacing(1)
  },
  title: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}));

function KnownAddressAdmin({ companyId }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();

  const [triggerAddLocation, setTriggerAddLocation] = React.useState({
    value: false
  });

  const classes = useStyles();

  const knownAddressColumns = [
    {
      label: "Adresse",
      name: "address",
      format: address => (
        <span>
          <span className="bold">{address.name}</span>{" "}
          <span style={{ fontStyle: "italic" }}>
            {address.postalCode} {address.city}
          </span>
        </span>
      ),
      renderEditMode: (address, onChange) => (
        <AddressField
          variant="outlined"
          fullWidth
          label="Adresse"
          value={address}
          onChange={onChange}
          dynamicMargin={false}
          allowCreate={false}
        />
      ),
      create: true,
      sortable: true,
      minWidth: 200
    },
    {
      label: "Nom usuel",
      name: "alias",
      create: true,
      edit: true,
      sortable: true
    }
  ];

  const knownAddresses = adminStore.knownAddresses
    .filter(a => a.companyId === companyId)
    .map(a => ({ ...a, address: a }));

  return [
    <Box key={0} className={classes.title}>
      <Typography variant="h4">
        Adresses fréquentes ({knownAddresses.length})
      </Typography>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => setTriggerAddLocation({ value: true })}
      >
        Ajouter un lieu
      </Button>
    </Box>,
    <Typography key={1} className={classes.explanation}>
      Vous pouvez ajouter ici les lieux de travail fréquents dans votre
      entreprise, comme le dépôt. Ces lieux seront proposés aux salariés
      lorsqu'ils renseigneront le début et la fin de mission dans leur outil
      mobile.
    </Typography>,
    <AugmentedTable
      key={2}
      columns={knownAddressColumns}
      entries={knownAddresses}
      triggerRowAdd={triggerAddLocation}
      afterRowAdd={() => setTriggerAddLocation({ value: false })}
      editable={true}
      onRowEdit={async (address, { alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            EDIT_KNOWN_ADDRESS_MUTATION,
            {
              companyKnownAddressId: address.id,
              alias
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.setKnownAddresses(oldAddresses => {
            const newAddresses = [...oldAddresses];
            const addressIndex = oldAddresses.findIndex(
              a => a.id === address.id
            );
            if (addressIndex >= 0)
              newAddresses[addressIndex] = {
                ...apiResponse.data.locations.editKnownAddress,
                companyId: companyId
              };
            return newAddresses;
          });
        } catch (err) {
          Sentry.captureException(err);
          console.log(err);
        }
      }}
      disableAdd={({ address }) => !address}
      onRowAdd={async ({ address, alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            CREATE_KNOWN_ADDRESS_MUTATION,
            {
              geoApiData: address,
              alias,
              companyId
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.setKnownAddresses(oldAddresses => [
            {
              ...apiResponse.data.locations.createKnownAddress,
              companyId: companyId
            },
            ...oldAddresses
          ]);
        } catch (err) {
          Sentry.captureException(err);
          console.log(err);
        }
      }}
      onRowDelete={address =>
        modals.open("confirmation", {
          textButtons: true,
          title: "Confirmer suppression",
          handleConfirm: async () => {
            try {
              await api.graphQlMutate(
                TERMINATE_KNOWN_ADDRESS_MUTATION,
                {
                  companyKnownAddressId: address.id
                },
                { context: { nonPublicApi: true } }
              );
              adminStore.setKnownAddresses(oldAddresses =>
                oldAddresses.filter(a => a.id !== address.id)
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(err);
            }
          }
        })
      }
    />
  ];
}

function VehicleAdmin({ companyId }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();

  const [triggerAddVehicle, setTriggerAddVehicle] = React.useState({
    value: false
  });

  const classes = useStyles();

  const vehicleColumns = [
    {
      label: "Immatriculation",
      name: "registrationNumber",
      create: true,
      sortable: true
    },
    {
      label: "Nom usuel",
      name: "alias",
      create: true,
      edit: true,
      sortable: true
    }
  ];
  const vehicles = adminStore.vehicles.filter(v => v.companyId === companyId);

  return [
    <Box key={3} className={classes.title}>
      <Typography variant="h4">Véhicules ({vehicles.length})</Typography>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => setTriggerAddVehicle({ value: true })}
      >
        Ajouter un véhicule
      </Button>
    </Box>,
    <Typography key={4} className={classes.explanation}>
      Les véhicules que vous ajoutez ici seront proposés aux salariés lorsqu'ils
      renseigneront les informations d'une mission dans leur outil mobile.
    </Typography>,
    <AugmentedTable
      key={5}
      columns={vehicleColumns}
      entries={vehicles}
      triggerRowAdd={triggerAddVehicle}
      afterRowAdd={() => setTriggerAddVehicle({ value: false })}
      editable={true}
      onRowEdit={async (vehicle, { alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            EDIT_VEHICLE_MUTATION,
            {
              id: vehicle.id,
              alias
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.setVehicles(oldVehicles => {
            const newVehicles = [...oldVehicles];
            const vehicleIndex = oldVehicles.findIndex(
              v => v.id === vehicle.id
            );
            if (vehicleIndex >= 0)
              newVehicles[vehicleIndex] = {
                ...apiResponse.data.vehicles.editVehicle,
                companyId: companyId
              };
            return newVehicles;
          });
        } catch (err) {
          Sentry.captureException(err);
          console.log(err);
        }
      }}
      disableAdd={({ registrationNumber }) => !registrationNumber}
      onRowAdd={async ({ registrationNumber, alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            CREATE_VEHICLE_MUTATION,
            {
              registrationNumber,
              alias,
              companyId
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.setVehicles(oldVehicles => [
            {
              ...apiResponse.data.vehicles.createVehicle,
              companyId: companyId
            },
            ...oldVehicles
          ]);
        } catch (err) {
          Sentry.captureException(err);
          console.log(err);
        }
      }}
      onRowDelete={vehicle =>
        modals.open("confirmation", {
          textButtons: true,
          title: "Confirmer suppression",
          handleConfirm: async () => {
            try {
              await api.graphQlMutate(
                TERMINATE_VEHICLE_MUTATION,
                {
                  id: vehicle.id
                },
                { context: { nonPublicApi: true } }
              );
              adminStore.setVehicles(oldVehicles =>
                oldVehicles.filter(v => v.id !== vehicle.id)
              );
            } catch (err) {
              Sentry.captureException(err);
              console.log(err);
            }
          }
        })
      }
    />
  ];
}

const COMPANY_SUB_PANELS = [
  {
    label: "Employés",
    view: "employees",
    component: props => <Employees {...props} />
  },
  {
    label: "Véhicules",
    view: "vehicles",
    component: props => <VehicleAdmin {...props} />
  },
  {
    label: "Adresses",
    view: "addresses",
    component: props => <KnownAddressAdmin {...props} />
  }
];

function SubNavigationToggle({ view, setView }) {
  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={(e, newView) => {
        if (newView) setView(newView);
      }}
      size="small"
    >
      {COMPANY_SUB_PANELS.map(panelInfos => (
        <ToggleButton key={panelInfos.view} value={panelInfos.view}>
          {panelInfos.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function _CompanyPanel({ width, containerRef }) {
  const [view, setView] = React.useState("employees");
  const [companyId, setCompanyId] = React.useState(0);

  const adminStore = useAdminStore();

  const companies = adminStore.companies;

  React.useEffect(() => {
    if (companies && companies.length > 0) {
      let defaultCompany = companies.find(c => c.isPrimary);
      if (!defaultCompany) defaultCompany = companies[0];
      setCompanyId(defaultCompany.id);
    } else setCompanyId(0);
  }, [companies]);

  const classes = useStyles({ width });
  const subPanel = COMPANY_SUB_PANELS.find(sp => sp.view === view);

  const currentCompanyName =
    companies && companyId ? companies.find(c => c.id === companyId).name : "";

  return [
    <Paper
      className={`${classes.navigation} flex-row-center`}
      variant="outlined"
      key={1}
    >
      <Grid
        container
        spacing={5}
        justify="space-between"
        alignItems="center"
        style={{ flex: "1 1 auto", width: "unset" }}
      >
        <Grid item>
          <Box>
            <Typography className={classes.companyName} variant="h3">
              {currentCompanyName}
            </Typography>
            <SubNavigationToggle view={view} setView={setView} />
          </Box>
        </Grid>
        {companies && companies.length > 1 && (
          <Grid item>
            <TextField
              id="select-company-id"
              select
              label="Entreprise"
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              helperText="Voir une autre entreprise"
            >
              {companies.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        <Grid item>
          <LinkButton
            className={classes.createCompanyButton}
            size="small"
            variant="contained"
            color="primary"
            to="/signup/company"
          >
            Inscrire une nouvelle entreprise
          </LinkButton>
        </Grid>
      </Grid>
    </Paper>,
    <Paper className={classes.subPanel} variant="outlined" key={2}>
      {companyId ? subPanel.component({ companyId, containerRef }) : null}
    </Paper>
  ];
}

const CompanyPanel = withWidth()(_CompanyPanel);

export default CompanyPanel;
