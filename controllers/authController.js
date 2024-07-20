import User from "../models/userModel";
import { createError } from "../utils/error";
import bcrypt from "bcryptjs";

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(createError(400, "password incorrect"));
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY
    );

    const { password, role, _id, createdAt, updatedAt, __v, ...others } =
      user._doc;

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(201)
      .json({ details: { ...others }, role });
  } catch (error) {
    next(error);
  }
};
