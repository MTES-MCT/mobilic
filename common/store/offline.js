import orderBy from "lodash/orderBy";

export const hasPendingUpdates = item =>
  item.pendingUpdates && item.pendingUpdates.length > 0;

export function resolveLatestVersion(item) {
  if (!hasPendingUpdates(item)) {
    return item;
  }
  let updatedItem = item;
  orderBy(item.pendingUpdates, ["time"]).forEach(upd => {
    if (updatedItem) {
      if (upd.type === "delete") {
        updatedItem = null;
      } else {
        updatedItem = { ...updatedItem, ...upd.new };
      }
    }
  });
  return updatedItem;
}

function addPendingVersion(item, type, pendingRequestId, additionalData = {}) {
  const existingPendingUpdates = item.pendingUpdates || [];
  return {
    ...item,
    pendingUpdates: [
      ...existingPendingUpdates,
      {
        requestId: pendingRequestId,
        type,
        time: Date.now(),
        ...additionalData
      }
    ]
  };
}

export function addPendingCreate(item, pendingRequestId) {
  return addPendingVersion(item, "create", pendingRequestId);
}

export function addPendingEdit(item, pendingRequestId, changes) {
  return addPendingVersion(item, "update", pendingRequestId, { new: changes });
}

export function addPendingDelete(item, pendingRequestId) {
  return addPendingVersion(item, "delete", pendingRequestId);
}

export function removePendingVersion(item, requestId) {
  if (
    hasPendingUpdates(item) &&
    item.pendingUpdates.some(upd => upd.requestId === requestId)
  ) {
    if (
      item.pendingUpdates.some(
        upd => upd.requestId === requestId && upd.type === "create"
      ) &&
      (!item.id || item.id.toString().startsWith("temp"))
    ) {
      return null;
    }
    return {
      ...item,
      pendingUpdates: item.pendingUpdates.filter(
        upd => upd.requestId !== requestId
      )
    };
  }
  return item;
}
