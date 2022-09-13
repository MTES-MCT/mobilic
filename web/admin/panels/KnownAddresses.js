import React from "react";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { useModals } from "common/utils/modals";
import { AddressField } from "../../common/AddressField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { AugmentedTable } from "../components/AugmentedTable";
import {
  CREATE_KNOWN_ADDRESS_MUTATION,
  EDIT_KNOWN_ADDRESS_MUTATION,
  TERMINATE_KNOWN_ADDRESS_MUTATION
} from "common/utils/apiQueries";

import { usePanelStyles } from "./Company";
import { captureSentryException } from "common/utils/sentry";
import { buildBackendPayloadForAddress } from "common/utils/addresses";
import { ADMIN_ACTIONS } from "../store/reducers/root";

export default function KnownAddressAdmin({ company }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const companyId = company ? company.id : null;

  const tableRef = React.useRef();
  const classes = usePanelStyles();

  const knownAddressColumns = [
    {
      label: "Adresse",
      name: "address",
      propertyForSorting: "lowerCaseAddress",
      format: address => (
        <span>
          <span className="bold">{address.name}</span>{" "}
          <span style={{ fontStyle: "italic" }}>
            {address.postalCode} {address.city}
          </span>
        </span>
      ),
      renderEditMode: (address, _, onChange) => (
        <AddressField
          variant="outlined"
          fullWidth
          small
          label="Adresse"
          value={address}
          onChange={onChange}
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
    .map(a => ({ ...a, address: a, lowerCaseAddress: a.name?.toLowerCase() }));

  return [
    <Box key={0} className={classes.title}>
      <Typography variant="h4">
        Adresses fréquentes ({knownAddresses.length})
      </Typography>
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => tableRef.current.newRow()}
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
      ref={tableRef}
      defaultSortBy="lowerCaseAddress"
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
          adminStore.dispatch({
            type: ADMIN_ACTIONS.update,
            payload: {
              id: address.id,
              entity: "knownAddresses",
              update: {
                ...apiResponse.data.locations.editKnownAddress,
                companyId
              }
            }
          });
        } catch (err) {
          captureSentryException(err);
        }
      }}
      validateRow={({ address }) => !!address}
      onRowAdd={async ({ address, alias }) => {
        try {
          const apiResponse = await api.graphQlMutate(
            CREATE_KNOWN_ADDRESS_MUTATION,
            {
              alias,
              companyId,
              ...buildBackendPayloadForAddress(address)
            },
            { context: { nonPublicApi: true } }
          );
          adminStore.dispatch({
            type: ADMIN_ACTIONS.create,
            payload: {
              entity: "knownAddresses",
              items: [
                {
                  ...apiResponse.data.locations.createKnownAddress,
                  companyId
                }
              ]
            }
          });
        } catch (err) {
          captureSentryException(err);
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
              adminStore.dispatch({
                type: ADMIN_ACTIONS.delete,
                payload: { id: address.id, entity: "knownAddresses" }
              });
            } catch (err) {
              captureSentryException(err);
            }
          }
        })
      }
    />
  ];
}
