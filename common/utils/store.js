import React from "react";
import zipObject from "lodash/zipObject";
import keyBy from "lodash/keyBy";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import map from "lodash/map";
import * as Sentry from "@sentry/browser";
import omit from "lodash/omit";
import { NonConcurrentExecutionQueue } from "./concurrency";
import { BroadcastChannel } from "broadcast-channel";
import { readCookie } from "./cookie";

const STORE_VERSION = 8;

export const broadCastChannel = new BroadcastChannel("storeUpdates", {
  webWorkerSupport: false
});

const StoreSyncedWithLocalStorage = React.createContext(() => {});

const List = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : [])
};

const Map = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : {})
};

const String = {
  serialize: value => value || "",
  deserialize: value => value || null
};

export const isPendingSubmission = item => !!item.pendingUpdate;

export class StoreSyncedWithLocalStorageProvider extends React.Component {
  constructor(props) {
    super(props);
    this.storage = props.storage;
    // What is stored in local storage and how to read/write to it
    this.mapper = {
      userId: {
        deserialize: value => (value ? parseInt(value) : value),
        serialize: String.serialize
      },
      userInfo: Map,
      coworkers: Map,
      activities: Map,
      employments: List,
      pendingRequests: List,
      missions: Map,
      expenditures: Map,
      vehicles: Map,
      nextRequestId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      },
      nextEntityObjectId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      }
    };

    // Initialize state with null values
    this.state = {};
    Object.keys(this.mapper).forEach(entry => {
      this.state[entry] = this.mapper[entry].deserialize(null);
    });

    this.loadFromStorageQueue = new NonConcurrentExecutionQueue(2);
    // Async load state from storage
    this.loadFromStorage();
  }

  loadFromStorage = async (resetIfNeeded = true) => {
    // Reset storage when breaking backward compatibility
    const storeVersion = parseInt(await this.storage.getItem("storeVersion"));
    if (storeVersion !== STORE_VERSION && resetIfNeeded) {
      await this.storage.clear();
      await this.storage.setItem("storeVersion", STORE_VERSION);
    } else {
      const stateUpdate = Object.fromEntries(
        await Promise.all(
          map(this.mapper, async (value, entry) => {
            return [entry, await this.storage.getItem(entry)];
          })
        )
      );
      try {
        await new Promise(resolve =>
          this.setState(
            mapValues(stateUpdate, (value, entry) =>
              this.mapper[entry].deserialize(value)
            ),
            resolve
          )
        );
      } catch (err) {
        Sentry.captureException(err);
        console.log(err);
      }
    }
    this._updateUserId();
  };

  broadcastChannelMessageHandler = msg => {
    if (msg === "update") {
      console.log("Syncing from storage");
      this.loadFromStorageQueue.execute(
        async () => await this.loadFromStorage(false)
      );
    }
  };

  componentDidMount() {
    console.log("Store mounted");
    broadCastChannel.addEventListener(
      "message",
      this.broadcastChannelMessageHandler
    );
  }

  componentWillUnmount() {
    console.log("Store unmounted");
    broadCastChannel.removeEventListener(
      "message",
      this.broadcastChannelMessageHandler
    );
  }

  setStoreState = (stateUpdate, fieldsToSync, callback = () => {}) => {
    this.setState(stateUpdate, () => {
      fieldsToSync.forEach(field => {
        this.storage.setItem(
          field,
          this.mapper[field].serialize(this.state[field])
        );
      });
      callback();
    });
  };

  setItems = (itemValueMap, callback = () => {}) =>
    this.setStoreState(itemValueMap, Object.keys(itemValueMap), callback);

  pushItemToArray = (item, arrayField) => {
    return new Promise(resolve =>
      this.setStoreState(
        prevState => ({ [arrayField]: [...prevState[arrayField], item] }),
        [arrayField],
        resolve
      )
    );
  };

  updateItemInArray = (updatedItem, arrayField) => {
    return new Promise(resolve =>
      this.setStoreState(
        prevState => {
          const array = prevState[arrayField];
          const oldItemVersionIdx = array.findIndex(
            it => it.id === updatedItem.id
          );
          if (oldItemVersionIdx >= 0) {
            array.splice(oldItemVersionIdx, 1, updatedItem);
            return { [arrayField]: [...array] };
          }
          return {};
        },
        [arrayField],
        resolve
      )
    );
  };

  _generateId = idStateEntry =>
    new Promise(resolve => {
      this.setStoreState(
        prevState => {
          resolve(prevState[idStateEntry]);
          return {
            [idStateEntry]: prevState[idStateEntry] + 1
          };
        },
        [idStateEntry]
      );
    });

  createEntityObject = async (object, entity, requestId) => {
    if (this.mapper[entity] === List) {
      this.setStoreState(
        prevState => ({
          [entity]: [
            ...prevState[entity],
            { ...object, pendingUpdate: { requestId, type: "create" } }
          ]
        }),
        [entity]
      );
      return;
    }
    const entityObjectId =
      "temp" + (await this._generateId("nextEntityObjectId"));
    this.setStoreState(
      prevState => ({
        [entity]: {
          ...prevState[entity],
          [entityObjectId.toString()]: {
            ...object,
            id: entityObjectId,
            pendingUpdate: { requestId, type: "create" }
          }
        }
      }),
      [entity]
    );
    return entityObjectId;
  };

  updateEntityObject = (objectId, entity, update, requestId) =>
    this.setStoreState(
      prevState => ({
        [entity]: {
          ...mapValues(prevState[entity], (value, id) =>
            id === objectId.toString()
              ? {
                  ...value,
                  pendingUpdate: { requestId, type: "update", new: update }
                }
              : value
          )
        }
      }),
      [entity]
    );

  deleteEntityObject = (objectId, entity, requestId) =>
    this.setStoreState(
      prevState => ({
        [entity]: {
          ...mapValues(prevState[entity], (value, id) =>
            id === objectId.toString()
              ? { ...value, pendingUpdate: { requestId, type: "delete" } }
              : value
          )
        }
      }),
      [entity]
    );

  getEntity = entity => {
    if (this.mapper[entity] === List) return this.state[entity];
    return pickBy(
      mapValues(this.state[entity], item =>
        this.resolveLastVersionOfItem(item)
      ),
      value => !!value
    );
  };

  removeItemFromArray = (item, arrayField) =>
    new Promise((resolve, reject) =>
      this.setStoreState(
        prevState => ({
          [arrayField]: prevState[arrayField].filter(e =>
            item.id
              ? item.id !== e.id
              : JSON.stringify(e) !== JSON.stringify(item)
          )
        }),
        [arrayField],
        resolve
      )
    );

  clearPendingRequest = async request => {
    await this.removeOptimisticUpdateForRequest(
      request.id,
      request.watchFields
    );
    await this.removeItemFromArray(request, "pendingRequests");
  };

  newRequest = async (
    query,
    variables,
    updateStore,
    watchFields,
    handleSubmitResponse,
    batchable = true,
    onApiError = null
  ) => {
    const requestId = await this._generateId("nextRequestId");
    const storeInfo = await updateStore(this, requestId);
    const request = {
      id: requestId,
      query,
      variables,
      watchFields,
      handleSubmitResponse: apiResponse =>
        handleSubmitResponse(apiResponse, storeInfo),
      batchable,
      onApiError: onApiError ? err => onApiError(err, storeInfo) : null
    };
    await this.pushItemToArray(request, "pendingRequests");
    return request;
  };

  removeOptimisticUpdateForRequest = (requestId, watchFields) =>
    new Promise(resolve => {
      this.setStoreState(
        prevState =>
          zipObject(
            watchFields,
            watchFields.map(entity => {
              if (this.mapper[entity] === List) {
                return prevState[entity].filter(
                  item =>
                    !isPendingSubmission(item) ||
                    item.pendingUpdate.requestId !== requestId
                );
              }
              return pickBy(
                mapValues(prevState[entity], item =>
                  isPendingSubmission(item) &&
                  item.pendingUpdate.requestId === requestId
                    ? item.pendingUpdate.type === "create"
                      ? null
                      : omit(item, "pendingUpdate")
                    : item
                ),
                value => !!value
              );
            })
          ),
        watchFields,
        resolve
      );
    });

  resolveLastVersionOfItem = item => {
    if (!isPendingSubmission(item) || item.pendingUpdate.type === "create") {
      return item;
    }
    if (item.pendingUpdate.type === "delete") {
      return null;
    }
    if (item.pendingUpdate.type === "update") {
      return { ...item, ...item.pendingUpdate.new };
    }
  };

  syncEntity = (itemsFromApi, entity, belongsToSyncScope = () => true) =>
    new Promise(resolve => {
      this.setStoreState(
        prevState => {
          const prevEntityState = prevState[entity];
          if (this.mapper[entity] === List) {
            return {
              [entity]: [
                ...prevEntityState.filter(
                  item =>
                    !belongsToSyncScope(item) ||
                    (isPendingSubmission(item) &&
                      item.pendingUpdate.type === "create")
                ),
                ...itemsFromApi
              ]
            };
          }
          itemsFromApi.forEach(item => {
            const prevEntityMatch = prevEntityState[item.id.toString()];
            if (prevEntityMatch && isPendingSubmission(prevEntityMatch)) {
              item.pendingUpdate = prevEntityMatch.pendingUpdate;
            }
          });
          return {
            [entity]: {
              ...pickBy(
                prevEntityState,
                item =>
                  !belongsToSyncScope(item) ||
                  (isPendingSubmission(item) &&
                    item.pendingUpdate.type === "create")
              ),
              ...keyBy(itemsFromApi, item => item.id.toString())
            }
          };
        },
        [entity],
        resolve
      );
    });

  removeItems = (items, callback = () => {}) => {
    const itemValueMap = {};
    items.forEach(item => (itemValueMap[item] = null));
    this.setState(itemValueMap, () => {
      items.forEach(item => this.storage.removeItem(item));
      callback();
    });
  };

  _removeUserInfo = async () =>
    await Promise.all([
      new Promise(resolve => this.removeItems(["hasAcceptedCgu"], resolve)),
      new Promise(resolve => {
        this.setItems({ userInfo: {}, employments: [] }, resolve);
      })
    ]);

  setUserInfo = ({
    firstName,
    lastName,
    email,
    hasConfirmedEmail,
    hasActivatedEmail
  }) =>
    new Promise(resolve =>
      this.setItems(
        {
          userInfo: {
            firstName,
            lastName,
            email,
            hasConfirmedEmail,
            hasActivatedEmail
          }
        },
        resolve
      )
    );

  setEmployeeInvite = employment =>
    this.setState({ employeeInvite: employment });

  clearEmployeeInvite = () => this.setState({ employeeInvite: null });

  setIsSigningUp = () => this.setState({ isSigningUp: true });

  clearIsSigningUp = () => this.setState({ isSigningUp: null });

  setHasAcceptedCgu = () => this.setState({ hasAcceptedCgu: true });

  companyInfo = () => {
    let info = { id: null, name: null, admin: null };
    const primaryEmployments = this.getEntity("employments").filter(
      e => e.isPrimary && e.isAcknowledged
    );
    if (primaryEmployments.length > 0) {
      const primaryEmployment = primaryEmployments[0];
      info.id = primaryEmployment.company.id;
      info.admin = primaryEmployment.hasAdminRights;
      info.name = primaryEmployment.company.name;
    }
    return info;
  };

  _updateUserId = async () =>
    new Promise(resolve =>
      this.setItems({ userId: parseInt(readCookie("userId")) || null }, resolve)
    );

  updateUserIdAndInfo = async () => {
    await this._updateUserId();
    await this._removeUserInfo();
  };

  render() {
    return (
      <>
        <StoreSyncedWithLocalStorage.Provider
          value={{
            userId: () => this.state.userId,
            updateUserIdAndInfo: this.updateUserIdAndInfo,
            companyInfo: this.companyInfo,
            setUserInfo: this.setUserInfo,
            userInfo: () => ({ id: this.state.userId, ...this.state.userInfo }),
            coworkers: () => this.state.coworkers,
            pendingRequests: () => this.state.pendingRequests,
            getEntity: this.getEntity,
            pushItemToArray: this.pushItemToArray,
            setItems: this.setItems,
            setStoreState: this.setStoreState,
            newRequest: this.newRequest,
            syncEntity: this.syncEntity,
            clearPendingRequest: this.clearPendingRequest,
            removeOptimisticUpdateForRequest: this
              .removeOptimisticUpdateForRequest,
            updateItemInArray: this.updateItemInArray,
            createEntityObject: this.createEntityObject,
            updateEntityObject: this.updateEntityObject,
            deleteEntityObject: this.deleteEntityObject,
            setEmployeeInvite: this.setEmployeeInvite,
            clearEmployeeInvite: this.clearEmployeeInvite,
            employeeInvite: () => this.state.employeeInvite,
            isSigningUp: () => this.state.isSigningUp,
            setIsSigningUp: this.setIsSigningUp,
            clearIsSigningUp: this.clearIsSigningUp,
            hasAcceptedCgu: () => this.state.hasAcceptedCgu,
            clearHasAcceptedCgu: () => this.setState({ hasAcceptedCgu: null }),
            setHasAcceptedCgu: this.setHasAcceptedCgu
          }}
        >
          {this.props.children}
        </StoreSyncedWithLocalStorage.Provider>
      </>
    );
  }
}

export const useStoreSyncedWithLocalStorage = () =>
  React.useContext(StoreSyncedWithLocalStorage);
