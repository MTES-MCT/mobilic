import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { useApi } from "common/utils/api";
import { CHANGE_GENDER_MUTATION } from "common/utils/apiQueries";

export const useUpdateGender = () => {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const updateGender = async newGender => {
    const apiResponse = await api.graphQlMutate(
      CHANGE_GENDER_MUTATION,
      { gender: newGender },
      { context: { nonPublicApi: true } }
    );
    await store.setUserInfo({
      ...store.userInfo(),
      gender: apiResponse.data.account.changeGender.gender
    });
    await broadCastChannel.postMessage("update");
  };

  return {
    updateGender
  };
};
