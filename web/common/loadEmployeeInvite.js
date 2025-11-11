import { GET_EMPLOYMENT_QUERY } from "common/utils/apiQueries/employments";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";

export async function loadEmployeeInvite(token, store, api, setError) {
  try {
    const employment = await api.graphQlQuery(
      GET_EMPLOYMENT_QUERY,
      {
        token
      },
      { context: { nonPublicApi: true } }
    );
    store.setEmployeeInvite({
      ...employment.data.employment,
      inviteToken: token
    });
  } catch (err) {
    setError(
      formatApiError(err, (gqlError) => {
        if (graphQLErrorMatchesCode(gqlError, "INVALID_TOKEN")) {
          return "le lien d'invitation est invalide";
        }
        if (graphQLErrorMatchesCode(gqlError, "EXPIRED_TOKEN")) {
          return "le lien d'invitation a expiré";
        }
      })
    );
  }
}
