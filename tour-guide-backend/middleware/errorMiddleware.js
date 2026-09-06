import multer from 'multer';

export const notFound = (req, _res, next) => next(Object.assign(new Error(`API route not found: ${req.method} ${req.originalUrl}`), { status: 404 }));

export const errorHandler = (error, _req, res, _next) => {
  let status = error.status || 500; let message = error.message || 'Unexpected server error'; let errors = error.errors || [];
  if (error.name === 'CastError') { status = 400; message = 'Invalid resource identifier'; }
  if (error.code === 11000) { status = 409; message = 'A record with these details already exists'; errors = Object.keys(error.keyPattern || {}).map((field) => ({ field, message: `${field} must be unique` })); }
  if (error instanceof multer.MulterError) { status = 400; message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : 'Image upload failed'; }
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') { status = 401; message = 'Your session is invalid or expired'; }
  if (status >= 500) message = 'Unexpected server error';
  res.status(status).json({ success: false, message, errors });
};
