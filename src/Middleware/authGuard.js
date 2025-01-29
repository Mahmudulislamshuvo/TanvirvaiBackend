const jwt = require("jsonwebtoken");
const { apiError } = require("../utils/apiError");
const userModel = require("../Model/user.model");

const authGuard = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, "Authorization required", true));
    }

    // Verify access token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json(new apiError(false, 404, null, "User not found", true));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(new apiError(false, 403, null, "Invalid/expired token", true));
  }
};

module.exports = { authGuard };
