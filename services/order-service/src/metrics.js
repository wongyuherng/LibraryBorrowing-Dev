const { Registry, collectDefaultMetrics, Counter, Histogram } = require('prom-client');

const register = new Registry();

register.setDefaultLabels({ service: 'order-service' });

collectDefaultMetrics({ register });

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
  registers: [register]
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  registers: [register]
});

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const path = req.route ? req.route.path : req.path;
    const duration = Number(process.hrtime.bigint() - start) / 1e9;

    httpRequests.inc({
      method: req.method,
      path: path,
      status_code: String(res.statusCode)
    });

    httpDuration.observe({
      method: req.method,
      path: path
    }, duration);
  });

  next();
}

async function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = {
  metricsMiddleware,
  metricsHandler
};
