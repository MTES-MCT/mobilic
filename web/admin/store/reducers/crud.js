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
  return {
    ...state,
    [entity]: items
  };
}

export function deleteItemReducer(state, { id, entity }) {
  return {
    ...state,
    [entity]: state[entity].filter(i => i.id !== id)
  };
}
