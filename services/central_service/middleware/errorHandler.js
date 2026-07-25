// Central error handler — every route funnels here via catchAsync/next(err),
// so the response envelope ({status, message}) is consistent everywhere
// instead of some routes returning 200 on failure.
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ status: 'FAILED', message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ status: 'FAILED', message: `Invalid id: ${err.value}` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ status: 'FAILED', message: 'That value is already in use.' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ status: 'FAILED', message: err.message || 'Internal Server Error' });
};
