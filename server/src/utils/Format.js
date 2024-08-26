const Format = {
  error: (code, message, data) => ({
    code,
    message: message || "Something went wrong",
    data: data || null,
  }),

  success: (message, data) => ({
    code: 200,
    message: message || "OK",
    data: data || null,
  }),

  noContent: (message) => ({
    code: 204,
    message: message || "No Content Found",
    data: null,
  }),

  badRequest: (message, data) => ({
    code: 400,
    message: message || "Bad Request",
    data: data || null,
  }),

  unAuthorized: (message) => ({
    code: 401,
    message: message || "Unauthorized",
    data: null,
  }),

  notFound: (message) => ({
    code: 404,
    message: message || "Not found",
    data: null,
  }),

  conflict: (message, data) => ({
    code: 409,
    message: message || "Conflict",
    data: data || null,
  }),

  internalError: (error, message) => ({
    code: 500,
    message: message || "Internal Server Error",
    error: `${error}`,
    data: null,
  }),
};

export default Format;
