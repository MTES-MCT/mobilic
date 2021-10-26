import {
  createItemsReducer,
  deleteItemReducer,
  syncReducer,
  updateItemReducer
} from "./crud";
import {
  closeCurrentActivityReducer,
  removeOptimisticUpdateReducer,
  removeTemporaryMissionIdReducer
} from "./other";

export function rootReducer(state, { type, payload }) {
  switch (type) {
    case "create":
      return createItemsReducer(state, payload);
    case "update":
      return updateItemReducer(state, payload);
    case "delete":
      return deleteItemReducer(state, payload);
    case "basicUpdate":
      return { ...state, ...payload };
    case "removeOptimistic":
      return removeOptimisticUpdateReducer(state, payload);
    case "sync":
      return syncReducer(state, payload);
    case "closeCurrentActivity":
      return closeCurrentActivityReducer(state, payload);
    case "removeTemporaryMissionId":
      return removeTemporaryMissionIdReducer(state, payload);
    default:
      return state;
  }
}
