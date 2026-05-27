const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error({
    code:    err.code || 'UNKNOWN',
    message: err.message,
    stack:   err.isOperational ? undefined : err.stack,
    path:    req.originalUrl,
    method:  req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message, details: err.errors }
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_KEY', message: 'Resource already exists', details: err.keyValue }
    });
  }

  // Dockerode: container already in requested state
  if (err.statusCode === 304) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONTAINER_ALREADY_IN_STATE', message: 'Container is already in the requested state' }
    });
  }

  // Dockerode: container not found
  if (err.statusCode === 404 && err.reason === 'no such container') {
    return res.status(404).json({
      success: false,
      error: { code: 'DOCKER_CONTAINER_NOT_FOUND', message: 'Docker container does not exist' }
    });
  }

  // Docker daemon unreachable
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOENT') {
    return res.status(503).json({
      success: false,
      error: { code: 'DOCKER_UNAVAILABLE', message: 'Docker daemon is not responding' }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token' }
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' }
    });
  }

  // Operational ApiError (thrown intentionally)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details }
    });
  }

  // Unexpected programmer error
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  });
}

module.exports = errorHandler;
