// Simple admin middleware — checks for a secret admin key in headers
export const adminAuth = (req, res, next) => {
    const adminKey = req.headers["x-admin-key"];
  
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      console.warn("[ADMIN AUTH] Unauthorized admin access attempt");
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
  
    console.log("[ADMIN AUTH] Admin access granted");
    next();
  };