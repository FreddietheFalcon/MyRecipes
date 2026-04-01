import jwt from "jsonwebtoken";

// Verifies the JWT cookie and attaches req.user
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

// Must be used AFTER requireAuth
export function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ message: "Owner access required" });
  }
  next();
}
