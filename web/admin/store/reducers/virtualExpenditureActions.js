import { VIRTUAL_EXPENDITURES_ACTIONS } from "../store";

export function addVirtualExpenditureActionReducer(
  state,
  { virtualExpenditureAction }
) {
  if (
    virtualExpenditureAction.action === VIRTUAL_EXPENDITURES_ACTIONS.cancel &&
    state.virtualExpenditureActions.find(
      v => v.expenditureId === virtualExpenditureAction.payload.expenditureId
    )
  ) {
    return {
      ...state,
      virtualExpenditureActions: state.virtualExpenditureActions.filter(
        v => v.expenditureId !== virtualExpenditureAction.payload.expenditureId
      )
    };
  }
  return {
    ...state,
    virtualExpenditureActions: [
      ...state.virtualExpenditureActions,
      virtualExpenditureAction
    ]
  };
}
