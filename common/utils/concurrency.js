export class NonConcurrentExecutionQueue {
  constructor() {
    // Type "classic" : normal queue
    // Type "sameSignal" : queue containing several copies of a unique task that need only to be run once (in a short time window). When a running task completes the other enqueued tasks should not run but reuse the result of this task
    // Type "sameSignalWithRefresh" : same as "oneTaskRefresh" except that the task should be run once again if it was enqueued during a run.
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
    await 1;
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

    if (this.queue.length > 0) {
      if (id && !hasFastImpl) {
        if (!refresh) {
          this.queue = this.queue.map(task => ({
            ...task,
            hasFastImpl: task.id === id ? true : task.hasFastImpl,
            fastRejectWith: task.id === id ? error : task.fastRejectWith,
            fastResolveWith: task.id === id ? response : task.fastResolveWith
          }));
        } else {
          const indexOfSameTaskEnqueuedDuringRun = this.queue.findIndex(
            task => task.id === id && !hasFastImpl
          );
          const shouldRefresh = indexOfSameTaskEnqueuedDuringRun > -1;
          if (shouldRefresh) {
            this.queue = this.queue.map((task, index) => ({
              ...task,
              hasFastImpl:
                task.id === id && index !== indexOfSameTaskEnqueuedDuringRun
                  ? true
                  : task.hasFastImpl,
              fastRejectWith:
                task.id === id && index !== indexOfSameTaskEnqueuedDuringRun
                  ? error
                  : task.fastRejectWith,
              fastResolveWith:
                task.id === id && index !== indexOfSameTaskEnqueuedDuringRun
                  ? response
                  : task.fastResolveWith
            }));
          } else {
            this.queue = this.queue.map(task => ({
              ...task,
              hasFastImpl: task.id === id ? true : task.hasFastImpl,
              fastRejectWith: task.id === id ? error : task.fastRejectWith,
              fastResolveWith: task.id === id ? response : task.fastResolveWith
            }));
          }
        }
      }
      this._executeTask(this.queue[0]);
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
