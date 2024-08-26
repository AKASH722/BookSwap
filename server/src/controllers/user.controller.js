import Format from "../utils/Format.js";

export const getUser = async (req, res, next) => {
  try {
    return res.status(200).json(Format.success("User", { user: req.user }));
  } catch (err) {
    next(err);
  }
};
