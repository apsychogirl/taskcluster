const slugid = require('slugid');
const loaders = require('./loaders');

module.exports = ({ clients, pulseEngine, rootUrl, strategies, cfg, monitor }) => ({ req, connection }) => {
  if (req) {
    const requestId = slugid.v4();
    const currentClients = clients({
      credentials: req.credentials,
      rootUrl,
    });
    const currentLoaders = loaders(
      currentClients,
      Boolean(req.credentials),
      rootUrl,
      monitor,
      strategies,
      req,
      cfg,
      requestId,
    );

    if (req.body.operationName !== 'IntrospectionQuery') {
      monitor.log.requestReceived({
        operationName: req.body.operationName,
        query: req.body.query,
        requestId,
      });
    }

    return {
      clients: currentClients,
      loaders: currentLoaders,
    };
  }

  if (connection) {
    // subscriptions do not need credentials (all public data)
    const currentClients = clients({ rootUrl });
    const currentLoaders = loaders(
      currentClients,
      false,
      rootUrl,
      monitor,
    );
    // if connection is set, this is for a subscription
    return {
      pulseEngine,
      clients: currentClients,
      loaders: currentLoaders,
    };
  }

  return {};
};
