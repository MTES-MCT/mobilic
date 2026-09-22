export function createItemsReducer(state, { items, entity }) {
  return {
    ...state,
    [entity]: [
      ...items,
      ...state[entity].filter(
        it =>
          !it.id ||
          !items
            .map(i => i.id)
            .filter(Boolean)
            .includes(it.id)
      )
    ]
  };
}

export function updateItemReducer(state, { id, entity, update }) {
  const items = [...state[entity]];
  const itemIndex = items.findIndex(i => i.id === id);
  if (itemIndex >= 0)
    items[itemIndex] = {
      ...items[itemIndex],
      ...update
    };
  const newState = {
    ...state,
    [entity]: items
  };
  if (entity === "employments") {
    newState.weeklyThresholdsByUserId = Object.fromEntries(
      items
        .filter(e => e.weeklyThresholds && (e.userId || e.user?.id) && e.isActive)
        .map(e => [e.userId || e.user?.id, e.weeklyThresholds])
    );
  }
  return newState;
}

export function deleteItemReducer(state, { id, entity }) {
  return {
    ...state,
    [entity]: state[entity].filter(i => i.id !== id)
  };
}
