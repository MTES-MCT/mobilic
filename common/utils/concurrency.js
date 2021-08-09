export class NonConcurrentExecutionQueue {
  constructor() {
    this.queue = [];
  }

  _enqueueTask = (func, id, refresh) =>
    new Promise((resolve, reject) => {
      this.queue.push({ func, id, resolve, reject, refresh });
    });

  _executeTask = async ({
    func,
    id,
    resolve,
    reject,
    fastResolveWith,
    fastRejectWith,
    hasFastImpl,
    refresh
  }) => {
    let response, error;
    if (!hasFastImpl) {
      try {
        response = await func();
      } catch (err) {
        error = err;
      }
    }

    if (this.queue.length > 0) {
      this.queue = this.queue.slice(1);
    }

    const actualId = typeof id === "function" ? id() : id;

    if (this.queue.length > 0) {
      if (actualId && !hasFastImpl) {
        if (!refresh) {
          this.queue = this.queue.map(task => ({
            ...task,
            hasFastImpl:
              (typeof task.id === "function" ? task.id() : task.id) === actualId
                ? true
                : task.hasFastImpl,
            fastRejectWith:
              (typeof task.id === "function" ? task.id() : task.id) === actualId
                ? error
                : task.fastRejectWith,
            fastResolveWith:
              (typeof task.id === "function" ? task.id() : task.id) === actualId
                ? response
                : task.fastResolveWith
          }));
        } else {
          const indexOfSameTaskEnqueuedDuringRun = this.queue.findIndex(
            task =>
              (typeof task.id === "function" ? task.id() : task.id) ===
                actualId && !task.hasFastImpl
          );
          const shouldRefresh = indexOfSameTaskEnqueuedDuringRun > -1;
          if (shouldRefresh) {
            this.queue = this.queue.map((task, index) => ({
              ...task,
              hasFastImpl:
                (typeof task.id === "function" ? task.id() : task.id) ===
                  actualId && index !== indexOfSameTaskEnqueuedDuringRun
                  ? true
                  : task.hasFastImpl,
              fastRejectWith:
                (typeof task.id === "function" ? task.id() : task.id) ===
                  actualId && index !== indexOfSameTaskEnqueuedDuringRun
                  ? error
                  : task.fastRejectWith,
              fastResolveWith:
                (typeof task.id === "function" ? task.id() : task.id) ===
                  actualId && index !== indexOfSameTaskEnqueuedDuringRun
                  ? response
                  : task.fastResolveWith
            }));
          } else {
            this.queue = this.queue.map(task => ({
              ...task,
              hasFastImpl:
                (typeof task.id === "function" ? task.id() : task.id) ===
                actualId
                  ? true
                  : task.hasFastImpl,
              fastRejectWith:
                (typeof task.id === "function" ? task.id() : task.id) ===
                actualId
                  ? error
                  : task.fastRejectWith,
              fastResolveWith:
                (typeof task.id === "function" ? task.id() : task.id) ===
                actualId
                  ? response
                  : task.fastResolveWith
            }));
          }
        }
      }
      setTimeout(() => this._executeTask(this.queue[0]), 0);
    }

    if (hasFastImpl)
      return fastRejectWith ? reject(fastRejectWith) : resolve(fastResolveWith);
    return error ? reject(error) : resolve(response);
  };

  execute = async (func, id = null, refresh = false) => {
    const shouldRunImmediately = this.queue.length === 0;
    const task = this._enqueueTask(func, id, refresh);
    if (shouldRunImmediately) {
      this._executeTask(this.queue[0]);
    }
    return await task;
  };

  clear = () => {
    if (this.queue.length > 0) {
      this.queue = this.queue.slice(0, 1);
    } else this.queue = [];
  };
}
