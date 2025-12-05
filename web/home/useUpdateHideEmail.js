import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../common/Snackbar";
import { UPDATE_HIDE_EMAIL_MUTATION } from "common/utils/apiQueries/employments";

export const useUpdateHideEmail = (employment) => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const store = useStoreSyncedWithLocalStorage();

  const { id } = employment;

  const updateHideEmail = async (newHideEmail) => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(UPDATE_HIDE_EMAIL_MUTATION, {
        employmentId: id,
        hideEmail: newHideEmail
      });
      const editedEmploymentPayload =
        apiResponse.data.employments.updateHideEmail;
      store.updateEmployment(editedEmploymentPayload);
    });
  };

  return updateHideEmail;
};
