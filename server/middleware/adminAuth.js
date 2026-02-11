const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

/**
 * Middleware to check if user is admin or accessing their own resource
 * @param {string} userIdParam - Name of the route parameter containing user ID
 */
const adminOrOwner = (userIdParam = 'id') => {
  return (req, res, next) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && req.user._id.toString() === req.params[userIdParam];

    if (isAdmin || isOwner) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.',
      });
    }
  };
};

module.exports = {
  adminOnly,
  adminOrOwner,
};