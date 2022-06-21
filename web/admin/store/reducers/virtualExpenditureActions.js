export function addVirtualExpenditureActionReducer(
  state,
  { virtualExpenditureAction }
) {
  return {
    ...state,
    virtualExpenditureActions: [
      ...state.virtualExpenditureActions,
      virtualExpenditureAction
    ]
  };
}

export function removeAllVirtualExpenditureActionsReducer(state) {
  return {
    ...state,
    virtualExpenditureActions: []
  };
}
