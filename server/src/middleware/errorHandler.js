export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  res.status(err.status || 500).json({
    type: 'https://api.itblog.dev/errors/server',
    title: err.message || 'Internal Server Error',
    status: err.status || 500,
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
