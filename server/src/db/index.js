import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using the connection URI
 * specified in the environment variable `MONGODB_URI`.
 *
 * @async
 * @function connectDB
 * @returns - A promise that resolves when the connection is successfully established.
 * @throws Will log an error message and exit the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\nMongoDB connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
