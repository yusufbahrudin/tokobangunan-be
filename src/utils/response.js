/**
 * Standar format response API
 */

const successResponse = (res, data = null, message = 'Berhasil', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, message = 'Berhasil', pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

const errorResponse = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const notFoundResponse = (res, message = 'Data tidak ditemukan') => {
  return errorResponse(res, message, 404);
};

const validationErrorResponse = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validasi gagal',
    errors,
  });
};

const unauthorizedResponse = (res, message = 'Tidak diizinkan') => {
  return errorResponse(res, message, 401);
};

const forbiddenResponse = (res, message = 'Akses ditolak') => {
  return errorResponse(res, message, 403);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
};
