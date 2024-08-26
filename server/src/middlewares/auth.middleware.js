import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import Format from "../utils/Format.js";

export const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw Format.unAuthorized("Unauthorized request");

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) throw Format.unAuthorized("Invalid Access request");

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
