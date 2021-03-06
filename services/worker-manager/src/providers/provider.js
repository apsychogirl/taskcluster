const assert = require('assert');
const libUrls = require('taskcluster-lib-urls');

/**
 * The parent class for all providers.
 *
 * See ../../providers.md for information on writing providers.
 */
class Provider {
  constructor({
    providerId,
    notify,
    monitor,
    rootUrl,
    estimator,
    Worker,
    WorkerPool,
    WorkerPoolError,
    validator,
    providerConfig,
  }) {
    this.providerId = providerId;
    this.monitor = monitor;
    this.validator = validator;
    this.notify = notify;
    this.rootUrl = rootUrl;
    this.estimator = estimator;
    this.Worker = Worker;
    this.WorkerPool = WorkerPool;
    this.WorkerPoolError = WorkerPoolError;
  }

  async setup() {
  }

  async initiate() {
  }

  async terminate() {
  }

  validate(config) {
    assert(this.configSchema); // This must be set up by a provider impl
    return this.validator(config, libUrls.schema(this.rootUrl, 'worker-manager', `v1/${this.configSchema}.yml`));
  }

  async prepare() {
  }

  async provision({workerPool, workerInfo}) {
  }

  async deprovision({workerPool}) {
  }

  async registerWorker({worker, workerPool, workerIdentityProof}) {
    throw new ApiError('not supported for this provider');
  }

  async cleanup() {
  }

  async scanPrepare() {
  }

  async checkWorker({worker}) {
  }

  async scanCleanup() {
  }

  async createWorker({workerPool, workerGroup, workerId, input}) {
    throw new ApiError('not supported for this provider');
  }

  async removeWorker({worker}) {
    throw new ApiError('not supported for this provider');
  }

  async createResources({workerPool}) {
  }

  async updateResources({workerPool}) {
  }

  async removeResources({workerPool}) {
  }

  /**
   * Takes a lifecycle block as defined in the schema and returns
   * a date when the worker should be destroyed if the provider
   * supports this action. Also returns the reregistrationTimeout
   * in milliseconds (as opposed to the seconds it is defined in) for
   * doing date math with easier.
   */
  static interpretLifecycle({lifecycle}) {
    let terminateAfter = null;
    if (!lifecycle) {
      return {terminateAfter, reregistrationTimeout: null};
    }

    let {registrationTimeout, reregistrationTimeout} = lifecycle;
    if (registrationTimeout !== undefined) {
      terminateAfter = Date.now() + registrationTimeout * 1000;
    }
    if (reregistrationTimeout !== undefined && registrationTimeout === undefined ||
        reregistrationTimeout < registrationTimeout) {
      terminateAfter = Date.now() + reregistrationTimeout * 1000;
    }
    return {terminateAfter, reregistrationTimeout: reregistrationTimeout * 1000 || null};
  }
}

/**
 * An error which, if thrown from API-related Provider methods, will be returned to
 * the user as a 400 Bad Request error containing `err.message`.
 */
class ApiError extends Error {
}

module.exports = {
  Provider,
  ApiError,
};
