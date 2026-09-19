// Usage: router.post("/", checkToken, checkRole("admin"), handler)
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: `Access denied for role '${req.userRole}'` });
    }
    next();
  };
};