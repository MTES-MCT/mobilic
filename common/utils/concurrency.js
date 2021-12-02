import mapValues from "lodash/mapValues";

export class NonConcurrentExecutionQueue {
  constructor() {
    this.queues = { main: [] };
    this.runningQueues = {};
  }

  _enqueueTask = (func, queueName, cacheKey, refresh) => {
    const queue = this.queues[queueName];
    return new Promise((resolve, reject) => {
      queue.push({ func, cacheKey, resolve, reject, refresh });
    });
  };

  _cacheTaskResult = (queueName, cacheKey, result, error) => {
    const queue = this.queues[queueName];
    this.queues[queueName] = queue.map(task => {
      let updatedTask = task;
      if (task.cacheKey === cacheKey && !task.refresh) {
        updatedTask = {
          ...task,
          hasCachedComputation: true,
          cachedError: error,
          cachedResult: result
        };
      }
      return updatedTask;
    });
  };

  _executeNext = async queueName => {
    if (this.runningQueues[queueName]) return;

    const nextTask = this.queues[queueName][0];
    if (!nextTask) return;
    const {
      func,
      cacheKey,
      resolve,
      reject,
      cachedResult,
      cachedError,
      hasCachedComputation
    } = nextTask;

    this.runningQueues[queueName] = true;

    // Avoid running other tasks with the same cache key
    if (cacheKey && !hasCachedComputation) {
      this.queues[queueName] = this.queues[queueName].map(task => ({
        ...task,
        refresh: task.cacheKey === cacheKey ? false : task.refresh
      }));
    }

    // Execute task if result not cached
    let response, error;
    if (!hasCachedComputation) {
      try {
        response = await func();
      } catch (err) {
        error = err;
      }
    }

    // Remove task from queue
    this.queues[queueName] = this.queues[queueName].slice(1);

    // Cache task results
    if (cacheKey && !hasCachedComputation) {
      this._cacheTaskResult(queueName, cacheKey, response, error);
    }

    this.runningQueues[queueName] = false;

    // Start next task
    setTimeout(() => this._executeNext(queueName), 0);

    if (hasCachedComputation) {
      return cachedError ? reject(cachedError) : resolve(cachedResult);
    }
    return error ? reject(error) : resolve(response);
  };

  execute = async (
    func,
    { cacheKey = null, queueName = "main", refresh = false } = {}
  ) => {
    if (!this.queues[queueName]) this.queues[queueName] = [];
    const task = this._enqueueTask(func, queueName, cacheKey, refresh);
    this._executeNext(queueName);
    return await task;
  };

  clear = () => {
    this.queues = mapValues(this.queues, queue => queue.slice(0, 1));
  };
}
