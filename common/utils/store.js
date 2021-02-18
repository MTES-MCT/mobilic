import React from "react";
import zipObject from "lodash/zipObject";
import keyBy from "lodash/keyBy";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import flatMap from "lodash/flatMap";
import uniq from "lodash/uniq";
import map from "lodash/map";
import orderBy from "lodash/orderBy";
import * as Sentry from "@sentry/browser";
import { NonConcurrentExecutionQueue } from "./concurrency";
import { BroadcastChannel } from "broadcast-channel";
import { currentUserId } from "./cookie";

const STORE_VERSION = 15;

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

export const isPendingSubmission = item =>
  item.pendingUpdates && item.pendingUpdates.length > 0;

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
      knownAddresses: List,
      activities: Map,
      employments: List,
      comments: Map,
      missions: Map,
      expenditures: Map,
      vehicles: Map
    };

    this.secondMapper = {
      nextRequestId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      },
      nextEntityObjectId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      },
      identityMap: Map,
      nextRequestGroupId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      },
      pendingRequests: List
    };

    // Initialize state with null values
    this.state = { _utils: this };
    this.secondState = {};
    this.pendingActions = [];
    Object.keys(this.mapper).forEach(entry => {
      this.state[entry] = this.mapper[entry].deserialize(null);
    });
    Object.keys(this.secondMapper).forEach(entry => {
      this.secondState[entry] = this.secondMapper[entry].deserialize(null);
    });

    this.loadFromStorageQueue = new NonConcurrentExecutionQueue();
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
      // Load main state from (local) storage
      const stateUpdate = Object.fromEntries(
        await Promise.all(
          map(this.mapper, async (value, entry) => {
            return [entry, await this.storage.getItem(entry)];
          })
        )
      );
      // Load secondary state from (local) storage, resetting it if possible
      const pendingRequests = this.secondMapper.pendingRequests.deserialize(
        await this.storage.getItem("pendingRequests")
      );
      await Promise.all(
        Object.keys(this.secondMapper).map(async entry => {
          this.secondState[entry] = this.secondMapper[entry].deserialize(
            await (pendingRequests.length > 0
              ? this.storage.getItem(entry)
              : null)
          );
          if (pendingRequests.length === 0)
            this.storage.setItem(
              entry,
              this.secondMapper[entry].serialize(this.secondState[entry])
            );
        })
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
      this.loadFromStorageQueue.execute(
        async () => await this.loadFromStorage(false),
        "load",
        true
      );
    }
  };

  componentDidMount() {
    broadCastChannel.addEventListener(
      "message",
      this.broadcastChannelMessageHandler
    );
  }

  componentWillUnmount() {
    broadCastChannel.removeEventListener(
      "message",
      this.broadcastChannelMessageHandler
    );
  }

  batchUpdateStore = () => {
    if (this.pendingActions.length > 0) {
      const stateUpdates = this.pendingActions;
      this.updateStore(
        prevState =>
          stateUpdates.reduce(
            (state, update) => ({
              ...state,
              ...(typeof update.update === "function"
                ? update.update(state)
                : update.update)
            }),
            prevState
          ),
        uniq(flatMap(stateUpdates, upd => upd.fieldsToSync)),
        () => {
          stateUpdates.forEach(upd => upd.callback());
        }
      );
      this.pendingActions = [];
    }
  };

  dispatchUpdateAction = (stateUpdate, fieldsToSync, callback = () => {}) => {
    this.pendingActions.push({
      update: stateUpdate,
      fieldsToSync,
      callback
    });
  };

  updateStore = (stateUpdate, fieldsToSync, callback = () => {}) => {
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

  setItems = (itemValueMap, callback = () => {}, commitImmediately = true) =>
    commitImmediately
      ? this.updateStore(itemValueMap, Object.keys(itemValueMap), callback)
      : this.dispatchUpdateAction(
          itemValueMap,
          Object.keys(itemValueMap),
          callback
        );

  generateId = idStateEntry => {
    const id = this.secondState[idStateEntry];
    this.secondState[idStateEntry] = id + 1;
    this.storage.setItem(
      idStateEntry,
      this.secondMapper[idStateEntry].serialize(id + 1)
    );
    return id;
  };

  addToIdentityMap = async (key, value) => {
    this.secondState.identityMap = {
      ...this.secondState.identityMap,
      [key]: value
    };
    this.storage.setItem(
      "identityMap",
      this.secondMapper["identityMap"].serialize(this.secondState.identityMap)
    );
  };

  createEntityObject = (object, entity, requestId) => {
    if (this.mapper[entity] === List) {
      this.dispatchUpdateAction(
        prevState => ({
          [entity]: [
            ...prevState[entity],
            {
              ...object,
              pendingUpdates: [{ requestId, type: "create", time: Date.now() }]
            }
          ]
        }),
        [entity]
      );
      return;
    }
    const entityObjectId = "temp" + this.generateId("nextEntityObjectId");
    this.dispatchUpdateAction(
      prevState => ({
        [entity]: {
          ...prevState[entity],
          [entityObjectId.toString()]: {
            ...object,
            id: entityObjectId,
            pendingUpdates: [{ requestId, type: "create", time: Date.now() }]
          }
        }
      }),
      [entity]
    );
    return entityObjectId;
  };

  updateEntityObject = (objectId, entity, update, requestId) =>
    this.dispatchUpdateAction(
      prevState => ({
        [entity]: {
          ...mapValues(prevState[entity], (value, id) =>
            id === objectId.toString()
              ? {
                  ...value,
                  pendingUpdates: [
                    ...(value.pendingUpdates || []),
                    { requestId, type: "update", new: update, time: Date.now() }
                  ]
                }
              : value
          )
        }
      }),
      [entity]
    );

  deleteEntityObject = (objectId, entity, requestId) =>
    this.dispatchUpdateAction(
      prevState => ({
        [entity]: {
          ...mapValues(prevState[entity], (value, id) =>
            id === objectId.toString()
              ? {
                  ...value,
                  pendingUpdates: [
                    ...(value.pendingUpdates || []),
                    { requestId, type: "delete", time: Date.now() }
                  ]
                }
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

  clearPendingRequest = async request => {
    await this.removeOptimisticUpdateForRequest(
      request.id,
      request.watchFields
    );
    this.secondState.pendingRequests = this.secondState.pendingRequests.filter(
      r => r.id !== request.id
    );
    this.storage.setItem(
      "pendingRequests",
      this.secondMapper["pendingRequests"].serialize(
        this.secondState.pendingRequests
      )
    );
  };

  newRequest = (
    query,
    variables,
    updateStore,
    watchFields,
    apiResponseHandlerName,
    batchable = true,
    groupId = null
  ) => {
    const requestId = this.generateId("nextRequestId");
    const storeInfo = updateStore(this, requestId);
    this.batchUpdateStore();
    const request = {
      id: requestId,
      userId: this.state.userId,
      query,
      variables,
      watchFields,
      storeInfo,
      apiResponseHandlerName,
      batchable,
      groupId
    };
    this.secondState.pendingRequests = [
      ...this.secondState.pendingRequests,
      request
    ];
    this.storage.setItem(
      "pendingRequests",
      this.secondMapper["pendingRequests"].serialize(
        this.secondState.pendingRequests
      )
    );
    return request;
  };

  pendingRequests = () =>
    this.secondState.pendingRequests.filter(
      r => r.userId === this.state.userId
    );

  removeOptimisticUpdateForRequest = (requestId, watchFields) => {
    const _removeUpdateForItem = item => {
      if (
        isPendingSubmission(item) &&
        item.pendingUpdates.some(upd => upd.requestId === requestId)
      ) {
        if (
          item.pendingUpdates.some(
            upd => upd.requestId === requestId && upd.type === "create"
          )
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
    };

    this.dispatchUpdateAction(
      prevState =>
        zipObject(
          watchFields,
          watchFields.map(entity => {
            if (this.mapper[entity] === List) {
              return prevState[entity]
                .map(_removeUpdateForItem)
                .filter(value => !!value);
            }
            return pickBy(
              mapValues(prevState[entity], _removeUpdateForItem),
              value => !!value
            );
          })
        ),
      watchFields
    );
  };

  resolveLastVersionOfItem = item => {
    if (!isPendingSubmission(item)) {
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
  };

  syncEntity = (
    itemsFromApi,
    entity,
    belongsToSyncScope = () => true,
    createdIdMap = {}
  ) =>
    this.dispatchUpdateAction(
      prevState => {
        const prevEntityState = prevState[entity];
        if (this.mapper[entity] === List) {
          return {
            [entity]: [
              ...prevEntityState.filter(
                item =>
                  !belongsToSyncScope(item) ||
                  (isPendingSubmission(item) &&
                    item.pendingUpdates.some(upd => upd.type === "create"))
              ),
              ...itemsFromApi
            ]
          };
        }
        itemsFromApi.forEach(item => {
          const prevEntityMatch =
            prevEntityState[
              createdIdMap[item.id]
                ? createdIdMap[item.id].toString()
                : item.id.toString()
            ];
          if (prevEntityMatch && isPendingSubmission(prevEntityMatch)) {
            item.pendingUpdates = prevEntityMatch.pendingUpdates.filter(
              upd => upd.type !== "create"
            );
          }
        });
        return {
          [entity]: {
            ...pickBy(
              prevEntityState,
              item =>
                !values(createdIdMap).includes(item.id) &&
                (!belongsToSyncScope(item) ||
                  (isPendingSubmission(item) &&
                    item.pendingUpdates.some(upd => upd.type === "create")))
            ),
            ...keyBy(itemsFromApi, item => item.id.toString())
          }
        };
      },
      [entity]
    );

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

  setUserInfo = (
    {
      firstName,
      lastName,
      email,
      birthDate,
      hasConfirmedEmail,
      hasActivatedEmail
    },
    commitImmediately = true
  ) =>
    new Promise(resolve =>
      this.setItems(
        {
          userInfo: {
            firstName,
            lastName,
            email,
            birthDate,
            hasConfirmedEmail,
            hasActivatedEmail
          }
        },
        resolve,
        commitImmediately
      )
    );

  setEmployeeInvite = employment =>
    this.setState({ employeeInvite: employment });

  clearEmployeeInvite = () => this.setState({ employeeInvite: null });

  setHasAcceptedCgu = () => this.setState({ hasAcceptedCgu: true });

  companies = () => {
    const employments = this.getEntity("employments").filter(
      e => e.isAcknowledged
    );
    return employments.map(e => ({
      id: e.company.id,
      name: e.company.name,
      admin: e.hasAdminRights,
      siren: e.company.siren,
      isPrimary: e.isPrimary
    }));
  };

  _updateUserId = async () =>
    new Promise(resolve => this.setItems({ userId: currentUserId() }, resolve));

  updateUserIdAndInfo = async () => {
    await this._updateUserId();
    await this._removeUserInfo();
  };

  userId = () => this.state.userId;

  userInfo = () => ({ id: this.state.userId, ...this.state.userInfo });

  coworkers = () => this.state.coworkers;

  employeeInvite = () => this.state.employeeInvite;

  hasAcceptedCgu = () => this.state.hasAcceptedCgu;

  clearHasAcceptedCgu = () => this.setState({ hasAcceptedCgu: null });

  identityMap = () => this.secondState.identityMap;

  render() {
    return (
      <StoreSyncedWithLocalStorage.Provider value={this.state}>
        {this.props.children}
      </StoreSyncedWithLocalStorage.Provider>
    );
  }
}

export const useStoreSyncedWithLocalStorage = () =>
  React.useContext(StoreSyncedWithLocalStorage)._utils;
