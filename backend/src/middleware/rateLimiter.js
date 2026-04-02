import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // Only rate limit write operations — GET requests are never limited
    if (req.method === "GET") return next();

    // Use IP address as the key so limits are per user not global
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
      || req.socket?.remoteAddress
      || "unknown";

    const { success } = await ratelimit.limit(`rate:${ip}`);

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(); // Don't block requests if rate limiter fails
  }
};

export default rateLimiter;
