import React from "react";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { THIRD_PARTY_CLIENTS_COMPANY_QUERY } from "common/utils/apiQueries";
import { usePanelStyles } from "./Company";
import { currentUserId } from "common/utils/cookie";
import Skeleton from "@mui/material/Skeleton";
import { CompanyClientCard } from "./CompanyClientCard";

export default function CompanyApiPanel({ company }) {
  const api = useApi();

  const [authorizedClients, setAuthorizedClients] = React.useState([]);
  const [
    loadingAuthorizedClients,
    setLoadingAuthorizedClients
  ] = React.useState(false);
  React.useEffect(async () => {
    setLoadingAuthorizedClients(true);
    const apiResponse = await api.graphQlMutate(
      THIRD_PARTY_CLIENTS_COMPANY_QUERY,
      {
        userId: currentUserId(),
        companyIds: [company.id]
      }
    );
    setAuthorizedClients(
      apiResponse?.data?.user?.adminedCompanies[0]?.authorizedClients
    );
    setLoadingAuthorizedClients(false);
  }, [company]);

  const classes = usePanelStyles();

  return [
    <Box key={0} className={classes.title}>
      <Typography variant="h4">
        Mes logiciels autorisés{" "}
        {!loadingAuthorizedClients && (
          <span> ({authorizedClients?.length || 0})</span>
        )}
      </Typography>
    </Box>,
    loadingAuthorizedClients ? (
      <Skeleton variant="rectangular" width="100%" height={100} />
    ) : (
      <Box key={1} mt={4}>
        {authorizedClients.map(ac => (
          <CompanyClientCard
            key={ac.id}
            authorizedClient={ac}
            setAuthorizedClients={setAuthorizedClients}
            companyId={company.id}
          />
        ))}
      </Box>
    )
  ];
}
