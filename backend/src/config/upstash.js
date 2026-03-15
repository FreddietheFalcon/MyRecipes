import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";

import detenv from "dotenv";

detenv.config();

// Create a new ratelimiter, that allows 100 requests per 60 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "20 s"),
    //analytics: true,
});

export default ratelimit;