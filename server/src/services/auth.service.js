import Format from "../utils/Format.js";
import { User } from "../models/user.model.js";

export const registerUser = async (username, email, password) => {
  if (!email || !username || !password)
    return Format.badRequest(null, "All fields are required");

  let user = await User.findOne({ email });

  if (user) return Format.badRequest("User already exists");

  user = new User({ username, email, password });
  await user.save();

  return Format.success("User Signup Successfully");
};

export const loginUser = async (email, password) => {
  if (!email || !password)
    return Format.badRequest(null, "All fields are required");
  let user = await User.findOne({ email });
  if (!user) return Format.badRequest("Invalid credentials");

  const isMatch = await user.comparePassword(password);

  if (!isMatch) return Format.badRequest("Invalid credentials");

  const accessToken = user.generateAccessToken();

  if (!accessToken) return Format.internalError("Error generating token");

  delete user["password"];

  return Format.success("User Login Successfully", {
    accessToken: accessToken,
    user: user,
  });
};
