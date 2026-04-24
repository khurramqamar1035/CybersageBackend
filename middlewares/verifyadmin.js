// Legacy middleware — kept for backward compatibility only.
// New routes should use adminOnly from authMiddleware.js instead.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export const verifyAdmin = (req, res, next) => {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ message: "Service unavailable" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};
