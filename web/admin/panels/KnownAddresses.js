import React from "react";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { useModals } from "common/utils/modals";
import { AddressField } from "../../common/AddressField";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { AugmentedTable } from "../components/AugmentedTable";
import {
  CREATE_KNOWN_ADDRESS_MUTATION,
  EDIT_KNOWN_ADDRESS_MUTATION,
  TERMINATE_KNOWN_ADDRESS_MUTATION
} from "common/utils/apiQueries";
import * as Sentry from "@sentry/browser";
import { usePanelStyles } from "./Company";

export default function KnownAddressAdmin({ company }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const companyId = company ? company.id : null;

  const [triggerAddLocation, setTriggerAddLocation] = React.useState({
    value: false
  });

  const classes = usePanelStyles();

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
          small
          label="Adresse"
          value={address}
          onChange={onChange}
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
      validateRow={({ address }) => !!address}
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
