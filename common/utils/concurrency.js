export class NonConcurrentExecutionQueue {
  constructor(type = "classic") {
    // Type "classic" : normal queue
    // Type "sameSignal" : queue containing several copies of a unique task that need only to be run once (in a short time window). When a running task completes the other enqueued tasks should not run but reuse the result of this task
    // Type "sameSignalWithRefresh" : same as "oneTaskRefresh" except that the task should be run once again if it was enqueued during a run.
    this.queue = [];
    this.type = type;
  }

  _enqueueTask = func =>
    new Promise((resolve, reject) => {
      this.queue.push({ func, resolve, reject });
    });

  _executeTask = async ({
    func,
    resolve,
    reject,
    fastResolveWith,
    fastRejectWith
  }) => {
    let response, error;
    if (!fastResolveWith && !fastRejectWith) {
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
      if (!fastRejectWith && !fastResolveWith) {
        if (this.type === "sameSignal") {
          this.queue = this.queue.map(task => ({
            ...task,
            fastRejectWith: error,
            fastResolveWith: response
          }));
        } else if (this.type === "sameSignalWithRefresh") {
          const shouldRefresh = this.queue.some(
            task => !task.fastRejectWith && !task.fastResolveWith
          );
          if (shouldRefresh) {
            this.queue = this.queue.map((task, index) => ({
              ...task,
              fastRejectWith: index > 0 ? error : null,
              fastResponseWith: index > 0 ? response : null
            }));
          } else {
            this.queue = this.queue.map(task => ({
              ...task,
              fastRejectWith: error,
              fastResolveWith: response
            }));
          }
        }
      }
      this._executeTask(this.queue[0]);
    }

    if (fastRejectWith) return reject(fastRejectWith);
    if (fastResolveWith) return reject(fastResolveWith);
    return error ? reject(error) : resolve(response);
  };

  execute = async func => {
    const shouldRunImmediately = this.queue.length === 0;
    const task = this._enqueueTask(func);
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
