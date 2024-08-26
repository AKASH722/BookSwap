import {MongoError} from "mongodb";
import Format from "../utils/format";

const handleMongoError = (error) => {
  let response;

  switch (error.code) {
    case 11000:
      response = {
        message: 'Duplicate key error: A record with the same value already exists.',
        code: error.code,
      };
      break;
    case 121:
      response = {
        message: 'Document validation error: The document does not meet the validation criteria.',
        code: error.code,
      };
      break;
    case 13:
      response = {
        message: 'Unauthorized: You do not have permission to perform this action.',
        code: error.code,
      };
      break;
    default:
      response = {
        message: 'An unknown error occurred while interacting with the database.',
        code: error.code,
      };
      break;
  }

  return response;
};

const errorMiddleware = (err, req, res, _) => {
  const status = err.statusCode || err.code || 500;
  const message = err.message || "Something went wrong";

  if (process.env.NODE_ENV === "development") {
    console.error(`[${req.method}] ${req.path} - Error: ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  const errorResponse = {
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  if (err instanceof MongoError) {
    const mongoErrorResponse = handleMongoError(err);
    res.status(mongoErrorResponse.code || 500).json(
      Format.error(mongoErrorResponse.code || 500, mongoErrorResponse.message)
    );
  } else {
    res.status(status).json(errorResponse);
  }
};

export default errorMiddleware;
