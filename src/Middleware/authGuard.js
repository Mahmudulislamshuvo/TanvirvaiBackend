const authGuard = async (req, res, next) => {
  try {
    // Check both cookies and Authorization header
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, "Authorization required", true));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!decoded) {
      return res
        .status(404)
        .json(
          new apiError(
            false,
            404,
            null,
            "Problem with decode Access Token",
            true
          )
        );
    }
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
