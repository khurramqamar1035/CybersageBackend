const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "cybersage_admin_2024_secure_token";

export const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authentication token" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ message: "Invalid authentication token" });
  }

  next();
};
