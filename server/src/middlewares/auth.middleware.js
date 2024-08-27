import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import Format from "../utils/Format.js";

export const verifyJWT = async (req, _, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw Format.unAuthorized("Token not found");

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) throw Format.unAuthorized("Invalid access token");

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
