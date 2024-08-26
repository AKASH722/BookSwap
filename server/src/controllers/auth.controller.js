import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser(username, email, password);
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};
