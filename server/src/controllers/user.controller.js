import Format from "../utils/Format.js";
import * as userService from "../services/user.service.js";

export const toggleDesiredBook = async (req, res, next) => {
  try {
    try {
      const user = req.user;
      const { id } = req.params;
      const result = await userService.toggleDesiredBook(user, id);
      return res.status(result.code).json(result);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    return res.status(200).json(Format.success("User", { user: req.user }));
  } catch (err) {
    next(err);
  }
};
